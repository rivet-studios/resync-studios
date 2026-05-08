import { storage } from "./storage";
import { getUncachableStripeClient } from "./stripeClient";

const VIP_TIERS = [
  {
    id: "bronze",
    name: "Bronze VIP",
    description: "The Bronze Supporter package is for supporters who want to contribute to RIVET Studios while receiving light account enhancements within the RIVET Studios ecosystem only. This tier includes select boosts, limited priority access, and basic recognition perks designed to modestly improve your website and Roblox experience. Your support helps fund development, servers, and updates for our PC titles. Perks remain active while your subscription is active.",
    priceAmountMonth: 999,
    priceAmountYear: 9999,
  },
  {
    id: "diamond",
    name: "Diamond VIP",
    description: "The Diamond Supporter package is built for supporters who want a powerful upgrade to their RIVET Studios experience. This tier unlocks expanded premium boosts, enhanced priority access, and high-value recognition across the RIVET Studios ecosystem only. Your support directly fuels development, infrastructure, and future expansion for our Roblox titles, while you receive a strong collection of impactful quality of life benefits. Perks remain active during your subscription.",
    priceAmountMonth: 1499,
    priceAmountYear: 14999,
  },
  {
    id: "founders",
    name: "Founders Edition VIP",
    description: "The Founder’s Edition Supporter package is our most exclusive tier, created for supporters who want elite status within RIVET Studios. This membership delivers top-level boosts, elite recognition, and priority privileges across the RIVET Studios ecosystem. Your contribution supports long-term growth and expansion for our Roblox games while granting access to premier quality of life upgrades. Benefits remain active during your subscription.",
    priceAmountMonth: 1999,
    priceAmountYear: 19999,
  },
];

// Cache now stores both monthly and yearly IDs
const priceCache: Record<string, { month?: string; year?: string }> = {};

/**
 * Gets the Stripe Price ID for a specific tier and interval.
 */
export async function getVipPriceId(tierId: string, interval: "month" | "year" = "month"): Promise<string | null> {
  // Check memory cache first
  if (priceCache[tierId]?.[interval]) return priceCache[tierId][interval]!;

  // Check env fallback: e.g., STRIPE_PRICE_BRONZE_MONTH
  const envKey = `STRIPE_PRICE_${tierId.toUpperCase()}_${interval.toUpperCase()}`;
  const envVal = process.env[envKey];

  if (envVal) {
    if (!priceCache[tierId]) priceCache[tierId] = {};
    priceCache[tierId][interval] = envVal;
    return envVal;
  }

  // Last resort: try to look it up live in Stripe so we don't crash if init
  // hasn't run yet (e.g. cold start or Stripe init failed earlier).
  try {
    const tier = VIP_TIERS.find((t) => t.id === tierId);
    if (!tier) return null;
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.search({
      query: `metadata['tier_id']:'${tierId}'`,
    });
    if (!products.data.length) return null;
    const prices = await stripe.prices.list({
      product: products.data[0].id,
      active: true,
      type: "recurring",
    });
    const wantedAmount = interval === "year" ? tier.priceAmountYear : tier.priceAmountMonth;
    const match = prices.data.find(
      (p) => p.recurring?.interval === interval && p.unit_amount === wantedAmount,
    ) || prices.data.find((p) => p.recurring?.interval === interval);
    if (match) {
      if (!priceCache[tierId]) priceCache[tierId] = {};
      priceCache[tierId][interval] = match.id;
      return match.id;
    }
  } catch (err: any) {
    console.warn(`⚠️ getVipPriceId live lookup failed for ${tierId}/${interval}:`, err?.message);
  }

  return null;
}

export async function initializeStripeProducts(): Promise<void> {
  try {
    const stripe = await getUncachableStripeClient();

    for (const tier of VIP_TIERS) {
      if (!priceCache[tier.id]) priceCache[tier.id] = {};

      // 1. Find or Create Product
      const existingProducts = await stripe.products.search({
        query: `metadata['tier_id']:'${tier.id}'`,
      });

      let productId: string;
      if (existingProducts.data.length > 0) {
        productId = existingProducts.data[0].id;
        console.log(`✅ VIP tier ${tier.id}: found existing product ${productId}`);
      } else {
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          metadata: { tier_id: tier.id },
        });
        productId = product.id;
        console.log(`✅ VIP tier ${tier.id}: created product ${productId}`);
      }

      // 2. Initialize both Monthly and Yearly Prices
      const intervals = [
        { key: "month" as const, amount: tier.priceAmountMonth },
        { key: "year" as const, amount: tier.priceAmountYear }
      ];

      for (const inv of intervals) {
        const existingPrices = await stripe.prices.list({
          product: productId,
          active: true,
          type: "recurring",
        });

        const matchingPrice = existingPrices.data.find(
          (p) =>
            p.unit_amount === inv.amount &&
            p.recurring?.interval === inv.key
        );

        if (matchingPrice) {
          priceCache[tier.id][inv.key] = matchingPrice.id;
          console.log(`✅ VIP tier ${tier.id} (${inv.key}): using existing price ${matchingPrice.id}`);
        } else {
          const price = await stripe.prices.create({
            product: productId,
            unit_amount: inv.amount,
            currency: "usd",
            recurring: { interval: inv.key },
            metadata: { tier_id: tier.id },
          });
          priceCache[tier.id][inv.key] = price.id;
          console.log(`✅ VIP tier ${tier.id} (${inv.key}): created price ${price.id}`);
        }
      }
    }

    console.log("✅ All VIP Stripe products initialized (Monthly & Yearly)");
  } catch (error: any) {
    console.error("⚠️ Failed to initialize Stripe VIP products:", error.message);
  }
}