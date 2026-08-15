import { ImageResponse } from "next/og";

export const alt = "Beacon Capital - Secure Mobile Banking & Institutional Portal";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a192f",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Top bar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #2563eb, #38bdf8, #60a5fa)",
          }}
        />

        {/* Logo & Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              backgroundColor: "#1e3a8a",
              border: "2px solid #3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
            }}
          >
            🏛️
          </div>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              letterSpacing: "3px",
              color: "#ffffff",
            }}
          >
            BEACON CAPITAL
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            color: "#93c5fd",
            textAlign: "center",
            maxWidth: "900px",
            marginBottom: "16px",
          }}
        >
          Secure Mobile Banking & Institutional Asset Portal
        </div>

        <div
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.5",
            marginBottom: "40px",
          }}
        >
          Institutional asset reconciliation, real-time transfers, and 256-bit encrypted capital management.
        </div>

        {/* Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            fontSize: "18px",
            color: "#38bdf8",
            backgroundColor: "#1e293b",
            padding: "16px 32px",
            borderRadius: "50px",
            border: "1px solid #334155",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🔒 256-Bit Encryption
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            ⚡ Instant Reconciliation
          </span>
          <span style={{ color: "#475569" }}>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🛡️ Verified Compliance
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
