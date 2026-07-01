import { getUncachableStripeClient } from "./stripeClient";
import type { Discount, InsertDiscount } from "@shared/schema";

/**
 * Creates a matching Stripe Coupon + Promotion Code for a locally-defined
 * discount so it can be redeemed at checkout via `allow_promotion_codes`.
 */
export async function createStripeDiscount(
  discount: InsertDiscount,
): Promise<{ stripeCouponId: string; stripePromotionCodeId: string }> {
  const stripe = await getUncachableStripeClient();

  const couponParams: Record<string, any> = {
    duration: "forever",
    name: discount.description || discount.code,
  };
  if (discount.discountType === "percent") {
    couponParams.percent_off = discount.amount;
  } else {
    couponParams.amount_off = discount.amount;
    couponParams.currency = "usd";
  }
  if (discount.appliesTo === "product" && discount.productId) {
    // Stripe coupons can restrict to specific products via `applies_to`
    // when the product has been synced to Stripe.
  }

  const coupon = await stripe.coupons.create(couponParams);

  const promoParams: Record<string, any> = {
    promotion: { type: "coupon", coupon: coupon.id },
    code: discount.code,
  };
  if (discount.maxRedemptions) {
    promoParams.max_redemptions = discount.maxRedemptions;
  }
  if (discount.expiresAt) {
    promoParams.expires_at = Math.floor(
      new Date(discount.expiresAt as any).getTime() / 1000,
    );
  }

  const promotionCode = await stripe.promotionCodes.create(promoParams as any);

  return {
    stripeCouponId: coupon.id,
    stripePromotionCodeId: promotionCode.id,
  };
}

export async function setStripeDiscountActive(
  discount: Discount,
  isActive: boolean,
): Promise<void> {
  const stripe = await getUncachableStripeClient();
  if (discount.stripePromotionCodeId) {
    await stripe.promotionCodes.update(discount.stripePromotionCodeId, {
      active: isActive,
    });
  }
}

export async function deleteStripeDiscount(discount: Discount): Promise<void> {
  const stripe = await getUncachableStripeClient();
  try {
    if (discount.stripePromotionCodeId) {
      await stripe.promotionCodes.update(discount.stripePromotionCodeId, {
        active: false,
      });
    }
    if (discount.stripeCouponId) {
      await stripe.coupons.del(discount.stripeCouponId);
    }
  } catch (err: any) {
    console.warn("⚠️ Failed to clean up Stripe discount:", err?.message);
  }
}
