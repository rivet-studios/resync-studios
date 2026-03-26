import { getStripeSync } from "./stripeClient";
import { sendStripeLog } from "./lib/discord-webhooks";

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
