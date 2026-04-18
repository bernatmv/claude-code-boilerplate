import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)",
        color: "white",
        fontSize: 72,
        fontWeight: 700,
        padding: "80px",
        textAlign: "center",
      }}
    >
      <div>{site.name}</div>
      <div
        style={{
          fontSize: 28,
          marginTop: 32,
          fontWeight: 400,
          opacity: 0.85,
        }}
      >
        {site.description}
      </div>
    </div>,
    size,
  );
}
