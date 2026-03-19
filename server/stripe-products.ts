import { getUncachableStripeClient } from "./stripeClient";

const VIP_TIERS = [
  {
    id: "bronze",
    name: "Bronze VIP®",
    description:
      "The Bronze VIP® package is designed for supporters who want to help RIVET Studios grow while enhancing their RIVET Studios account experience exclusively.",
    priceAmount: 1399,
  },
  {
    id: "diamond",
    name: "Diamond VIP®",
    description:
      "The Diamond VIP® package is built for supporters who want the highest level of benefits within RIVET Studios exclusively.",
    priceAmount: 3499,
  },
  {
    id: "founders",
    name: "Founder's Edition VIP®",
    description:
      "The Founder's Edition VIP® package is our most exclusive tier, created for supporters who want the highest level of access within RIVET Studios exclusively.",
    priceAmount: 4399,
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
