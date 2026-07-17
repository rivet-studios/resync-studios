import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { sendStripeLog } from "./lib/discord-webhooks";
import { storage } from "./storage";
import { getVipTierFromPriceId, VIP_TIER_ID_TO_ENUM } from "./stripe-products";
import { syncDiscordVipRole } from "./discord-bot";

/** Track promotion code redemptions in our local discounts table. */
async function trackPromoRedemptions(session: any): Promise<void> {
  try {
    const promoEntries: any[] =
      session.total_details?.breakdown?.discounts ?? [];
    for (const entry of promoEntries) {
      const promoCodeId = entry.discount?.promotion_code;
      if (!promoCodeId) continue;
      const discount = await storage.getDiscountByStripePromotionCodeId(promoCodeId);
      if (!discount) continue;
      const updates: Record<string, any> = {
        timesRedeemed: (discount.timesRedeemed ?? 0) + 1,
      };
      // For personal (assigned) codes, stamp the used time once
      if (discount.assignedToUserId && !discount.usedAt) {
        updates.usedAt = new Date();
      }
      await storage.updateDiscount(discount.id, updates);
    }
  } catch (err: any) {
    console.warn("⚠️ Could not track promo redemptions:", err?.message);
  }
}

type VipTierEnum =
  | "none"
  | "Bronze VIP"
  | "Diamond VIP"
  | "Founders Edition VIP"
  | "Lifetime";

const VALID_VIP_TIERS = new Set<VipTierEnum>([
  "none",
  "Bronze VIP",
  "Diamond VIP",
  "Founders Edition VIP",
  "Lifetime",
]);

/**
 * Resolve the VIP tier (vipTierEnum value) for a Stripe subscription object.
 * Looks at the first line item's price ID and reverses it back to a VIP tier.
 * Returns "none" if the subscription is not in an active-ish state, or null if
 * we can't determine the tier (caller should skip).
 */
async function resolveTierFromSubscription(
  sub: any,
): Promise<VipTierEnum | null> {
  if (!sub) return null;
  const activeStatuses = new Set(["active", "trialing", "past_due"]);
  if (!activeStatuses.has(sub.status)) return "none";
  const priceId: string | undefined = sub.items?.data?.[0]?.price?.id;
  if (!priceId) return null;
  const tierId = await getVipTierFromPriceId(priceId);
  if (!tierId) return null;
  return VIP_TIER_ID_TO_ENUM[tierId] ?? null;
}

async function applyVipTierForCustomer(
  stripeCustomerId: string,
  newTier: VipTierEnum,
  stripeSubscriptionId: string | null,
): Promise<void> {
  if (!VALID_VIP_TIERS.has(newTier)) return;
  const user = await storage.getUserByStripeCustomerId(stripeCustomerId);
  if (!user) {
    console.warn(`⚠️ Stripe webhook: no user found for customer ${stripeCustomerId}`);
    return;
  }
  // Lifetime VIP is granted manually by an admin and must never be downgraded
  // by a Stripe subscription event.
  if (user.vipTier === "Lifetime") return;

  const updates: Record<string, any> = {};
  if (user.vipTier !== newTier) updates.vipTier = newTier;
  if (
    stripeSubscriptionId !== null &&
    user.stripeSubscriptionId !== stripeSubscriptionId
  ) {
    updates.stripeSubscriptionId = stripeSubscriptionId;
  }
  if (Object.keys(updates).length === 0) return;

  await storage.updateUser(user.id, updates as any);
  console.log(
    `🔄 Stripe webhook: user ${user.id} vipTier "${user.vipTier}" → "${updates.vipTier ?? user.vipTier}"`,
  );

  if (user.discordId && updates.vipTier) {
    syncDiscordVipRole(user.discordId, updates.vipTier as any).catch((err) =>
      console.error(
        `❌ Stripe webhook: Discord VIP sync failed for user ${user.id}:`,
        err,
      ),
    );
  }
}

export class WebhookHandlers {
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. " +
          "Received type: " +
          typeof payload +
          ". " +
          "Ensure webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    const sync = await getStripeSync();
    const event = await sync.processWebhook(payload, signature);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as any;

          // Always track promo code redemptions regardless of mode
          await trackPromoRedemptions(session);

          if (session.mode === "subscription") {
            // ── VIP subscription purchase ────────────────────────────────────
            const customerId = session.customer as string | null;
            if (!customerId) break;
            const subId = (session.subscription as string | null) ?? null;
            let tier: VipTierEnum | null = null;
            const metaTierId = session.metadata?.tierId as string | undefined;
            if (metaTierId && VIP_TIER_ID_TO_ENUM[metaTierId]) {
              tier = VIP_TIER_ID_TO_ENUM[metaTierId];
            } else if (subId) {
              const stripe = await getUncachableStripeClient();
              const sub = await stripe.subscriptions.retrieve(subId);
              tier = await resolveTierFromSubscription(sub);
            }
            if (tier) {
              await applyVipTierForCustomer(customerId, tier, subId);
            }
          } else if (session.mode === "payment") {
            // ── One-time product purchase ────────────────────────────────────
            const userId = session.metadata?.userId as string | undefined;
            const productId = session.metadata?.productId as string | undefined;
            if (!userId || !productId) break;

            // Idempotency: skip if we already recorded this session
            const stripeRef = (session.payment_intent as string | null) ?? session.id;
            const existingPayments = await storage.getUserPayments(userId);
            const alreadyRecorded = existingPayments.some(
              (p) => p.stripePaymentId === stripeRef,
            );
            if (alreadyRecorded) break;

            const product = await storage.getProduct(productId);
            await storage.createPayment({
              userId,
              amount: session.amount_total ?? 0,
              currency: ((session.currency as string | null) ?? "usd").toUpperCase(),
              status: "completed",
              tierId: `product:${productId}`,
              stripePaymentId: stripeRef,
              adminNotes: product
                ? `Store purchase: ${product.name}`
                : `Store purchase: ${productId}`,
            });
            console.log(
              `✅ Stripe webhook: recorded product purchase for user ${userId}, product ${productId}`,
            );
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const sub = event.data.object as any;
          const customerId = sub.customer as string;
          const tier = await resolveTierFromSubscription(sub);
          if (tier) {
            await applyVipTierForCustomer(customerId, tier, sub.id);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as any;
          const customerId = sub.customer as string;
          await applyVipTierForCustomer(customerId, "none", null);
          break;
        }
      }
    } catch (err) {
      console.error(`❌ Stripe webhook handler error for ${event.type}:`, err);
    }

    if (
      event.type === "payment_intent.succeeded" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const paymentIntent = event.data.object as any;

      await sendStripeLog({
        event: event.type,
        email: paymentIntent.receipt_email,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        id: paymentIntent.id,
      });
    }
  }
}
