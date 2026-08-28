import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 15,
          background: "#0b0f17",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          fontFamily: "sans-serif",
          borderRadius: 6,
          border: "1.5px solid #af0017",
          letterSpacing: "-0.5px",
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
