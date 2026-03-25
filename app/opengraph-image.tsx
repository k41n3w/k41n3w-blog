import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Nome principal */}
        <span
          style={{
            color: "#ffffff",
            fontSize: 128,
            fontWeight: 900,
            fontFamily: "monospace",
            letterSpacing: "-4px",
            lineHeight: 1,
          }}
        >
          kaineo
        </span>

        {/* Linha vermelha */}
        <div
          style={{
            width: 240,
            height: 4,
            background: "#dc2626",
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        {/* Subtítulo */}
        <span
          style={{
            color: "#71717a",
            fontSize: 26,
            fontFamily: "monospace",
            letterSpacing: "1px",
            marginBottom: 48,
          }}
        >
          Engenharia de software com propósito. Rails, IA e decisões que escalam.
        </span>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #dc2626",
            padding: "12px 36px",
            gap: 12,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 22,
              fontFamily: "monospace",
              letterSpacing: "2px",
            }}
          >
            Leia os posts
          </span>
          <span style={{ color: "#dc2626", fontSize: 22, fontFamily: "monospace" }}>→</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
