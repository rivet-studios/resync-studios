import { useState, useEffect, useCallback } from "react";

type GatewayStatus =
  | "contacting"
  | "waiting"
  | "finalizing"
  | "timeout"
  | "ready";

const STATUS_MESSAGES: Record<GatewayStatus, string> = {
  contacting: "Contacting platform services\u2026",
  waiting: "Waiting for backend response\u2026",
  finalizing: "Finalising connection\u2026",
  timeout: "Still waking up. You can retry below.",
  ready: "",
};

const HEALTH_URL = "/api/health";
const POLL_INTERVAL = 2500;
const TIMEOUT_THRESHOLD = 18000;

export function WakeGateway({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<GatewayStatus>("contacting");
  const [attempts, setAttempts] = useState(0);
  const [bypassed, setBypassed] = useState(false);
  const [startTime] = useState(() => Date.now());

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(HEALTH_URL, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.ok === true) {
          setStatus("ready");
          return;
        }
      }
      setAttempts((a) => a + 1);
      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_THRESHOLD) {
        setStatus("timeout");
      } else if (elapsed > 8000) {
        setStatus("finalizing");
      } else {
        setStatus("waiting");
      }
    } catch {
      setAttempts((a) => a + 1);
      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_THRESHOLD) {
        setStatus("timeout");
      } else {
        setStatus("contacting");
      }
    }
  }, [startTime]);

  useEffect(() => {
    if (status === "ready" || bypassed) return;

    checkHealth();

    const interval = setInterval(checkHealth, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [status, bypassed, checkHealth]);

  if (status === "ready" || bypassed) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      data-testid="wake-gateway"
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: 460,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 32px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: "2px solid rgba(255,255,255,0.08)",
              borderTopColor: "rgba(100,160,255,0.6)",
              borderRadius: "50%",
              animation: "rs-spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.5px",
            }}
          >
            RS
          </div>
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 12px",
            letterSpacing: "-0.01em",
          }}
          data-testid="text-gateway-heading"
        >
          Connecting to RIVET Studios
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
          data-testid="text-gateway-body"
        >
          Our services are currently waking up and preparing your session.
          <br />
          This usually only takes a moment.
        </p>

        <p
          style={{
            fontSize: 13,
            color: "rgba(100,160,255,0.7)",
            margin: "0 0 8px",
            minHeight: 20,
          }}
          data-testid="text-gateway-status"
        >
          {STATUS_MESSAGES[status]}
        </p>

        {attempts > 0 && (
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              margin: "0 0 24px",
            }}
          >
            Attempt {attempts}
          </p>
        )}

        {status === "timeout" && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setStatus("contacting");
                setAttempts(0);
                checkHealth();
              }}
              style={{
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: "rgba(100,160,255,0.15)",
                border: "1px solid rgba(100,160,255,0.3)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.background =
                  "rgba(100,160,255,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.background =
                  "rgba(100,160,255,0.15)")
              }
              data-testid="button-gateway-retry"
            >
              Retry Connection
            </button>

            <button
              onClick={() => setBypassed(true)}
              style={{
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.1)")
              }
              data-testid="button-gateway-bypass"
            >
              Open Site Anyway
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rs-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
