import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 84,
          background: "#0b0f17",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontFamily: "sans-serif",
          borderRadius: 36,
          border: "4px solid #af0017",
          letterSpacing: "-2px",
        }}
      >
        <span style={{ color: "#ffffff" }}>B</span>
        <span style={{ color: "#af0017" }}>C</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
