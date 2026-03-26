type LogLevel = "info" | "success" | "warn" | "error";

const COLORS: Record<LogLevel, number> = {
  info: 3447003,
  success: 5763719,
  warn: 16705372,
  error: 15548997,
};

async function sendWebhook(
  url: string | undefined,
  payload: any
) {
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Discord webhook error:", res.status, text);
    }
  } catch (err) {
    console.error("Webhook send failed:", err);
  }
}

/* -------------------------------- */
/* GENERAL SITE LOGS */
/* -------------------------------- */
export async function sendSiteLog(data: {
  title: string;
  description?: string;
  level?: LogLevel;
  fields?: { name: string; value: string; inline?: boolean }[];
}) {
  await sendWebhook(process.env.DISCORD_LOGS_WEBHOOK_URL, {
    embeds: [
      {
        title: data.title,
        description: data.description,
        color: COLORS[data.level || "info"],
        fields: data.fields || [],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

/* -------------------------------- */
/* STRIPE LOGS */
/* -------------------------------- */
export async function sendStripeLog(data: {
  event: string;
  email?: string;
  amount?: number;
  currency?: string;
  status?: string;
  id?: string;
}) {
  await sendWebhook(process.env.DISCORD_STRIPE_WEBHOOK_URL, {
    embeds: [
      {
        title: "💳 Stripe Event",
        color: COLORS.success,
        fields: [
          { name: "Event", value: data.event, inline: true },
          { name: "Email", value: data.email || "Unknown", inline: true },
          {
            name: "Amount",
            value: data.amount
              ? `${data.amount} ${data.currency || ""}`
              : "N/A",
            inline: true,
          },
          { name: "Status", value: data.status || "Unknown", inline: true },
          { name: "ID", value: data.id || "N/A", inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

/* -------------------------------- */
/* ERROR LOGS */
/* -------------------------------- */
export async function sendErrorLog(error: unknown) {
  await sendWebhook(process.env.DISCORD_ERROR_WEBHOOK_URL, {
    embeds: [
      {
        title: "🚨 Server Error",
        color: COLORS.error,
        description:
          typeof error === "string"
            ? error
            : JSON.stringify(error, null, 2),
        timestamp: new Date().toISOString(),
      },
    ],
  });
}