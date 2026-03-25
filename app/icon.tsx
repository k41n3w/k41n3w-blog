import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#dc2626",
            fontSize: 22,
            fontWeight: 900,
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          k
        </span>
      </div>
    ),
    { ...size }
  )
}
