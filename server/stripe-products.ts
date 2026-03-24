import { getUncachableStripeClient } from "./stripeClient";

const VIP_TIERS = [
  {
    id: "bronze",
    name: "Bronze VIP",
    description:
      "The Bronze Supporter package is for supporters who want to contribute to RIVET Studios while receiving light account enhancements within the RIVET Studios ecosystem only. This tier includes select boosts, limited priority access, and basic recognition perks designed to modestly improve your website and Roblox experience. Your support helps fund development, servers, and updates for our PC titles. Perks remain active while your subscription is active.",
    priceAmount: 999,
  },
  {
    id: "diamond",
    name: "Diamond VIP",
    description:
      "The Diamond Supporter package is built for supporters who want a powerful upgrade to their RIVET Studios experience. This tier unlocks expanded premium boosts, enhanced priority access, and high-value recognition across the RIVET Studios ecosystem only. Your support directly fuels development, infrastructure, and future expansion for our Roblox titles, while you receive a strong collection of impactful quality of life benefits. Perks remain active during your subscription.",
    priceAmount: 1499,
  },
  {
    id: "founders",
    name: "Founders Edition VIP",
    description:
      "The Founder’s Edition Supporter package is our most exclusive tier, created for supporters who want elite status within RIVET Studios. This membership delivers top-level boosts, elite recognition, and priority privileges across the RIVET Studios ecosystem. Your contribution supports long-term growth and expansion for our Roblox games while granting access to premier quality of life upgrades. Benefits remain active during your subscription.",
    priceAmount: 1999,
  },
];

const priceCache: Record<string, string> = {};

export async function getVipPriceId(tierId: string): Promise<string | null> {
  if (priceCache[tierId]) return priceCache[tierId];

  const envKey = `STRIPE_PRICE_${tierId.toUpperCase()}`;
  const envVal = process.env[envKey];
  if (envVal) {
    priceCache[tierId] = envVal;
    return envVal;
  }

  return null;
}

export async function initializeStripeProducts(): Promise<void> {
  try {
    const stripe = await getUncachableStripeClient();

    for (const tier of VIP_TIERS) {
      const envKey = `STRIPE_PRICE_${tier.id.toUpperCase()}`;
      if (process.env[envKey]) {
        priceCache[tier.id] = process.env[envKey]!;
        console.log(
          `✅ VIP tier ${tier.id}: using env price ${process.env[envKey]}`,
        );
        continue;
      }

      const existingProducts = await stripe.products.search({
        query: `metadata['tier_id']:'${tier.id}'`,
      });

      let productId: string;

      if (existingProducts.data.length > 0) {
        productId = existingProducts.data[0].id;
        console.log(
          `✅ VIP tier ${tier.id}: found existing product ${productId}`,
        );
      } else {
        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description,
          metadata: { tier_id: tier.id },
        });
        productId = product.id;
        console.log(`✅ VIP tier ${tier.id}: created product ${productId}`);
      }

      const existingPrices = await stripe.prices.list({
        product: productId,
        active: true,
        type: "recurring",
      });

      const matchingPrice = existingPrices.data.find(
        (p) =>
          p.unit_amount === tier.priceAmount &&
          p.recurring?.interval === "month",
      );

      if (matchingPrice) {
        priceCache[tier.id] = matchingPrice.id;
        console.log(
          `✅ VIP tier ${tier.id}: using existing price ${matchingPrice.id}`,
        );
      } else {
        const price = await stripe.prices.create({
          product: productId,
          unit_amount: tier.priceAmount,
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { tier_id: tier.id },
        });
        priceCache[tier.id] = price.id;
        console.log(`✅ VIP tier ${tier.id}: created price ${price.id}`);
      }
    }

    console.log("✅ All VIP Stripe products initialized");
  } catch (error: any) {
    console.error(
      "⚠️ Failed to initialize Stripe VIP products:",
      error.message,
    );
  }
}
