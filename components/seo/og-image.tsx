import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/seo/metadata"

export async function generateOgImage(title: string = siteConfig.name, description: string = siteConfig.description) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
        backgroundImage: "linear-gradient(to bottom right, #000000, #1a1a1a)",
        padding: "40px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "30px",
        }}
      >
        <span
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            color: "#ff0000",
            marginRight: "10px",
          }}
        >
          k41n3w
        </span>
        <span
          style={{
            fontSize: "30px",
            color: "#ffffff",
          }}
        >
          Ruby on Rails Tech Blog
        </span>
      </div>
      <div
        style={{
          fontSize: "60px",
          fontWeight: "bold",
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "20px",
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "30px",
          color: "#cccccc",
          textAlign: "center",
          maxWidth: "800px",
        }}
      >
        {description.length > 100 ? description.substring(0, 100) + "..." : description}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            color: "#ff0000",
          }}
        >
          Por Caio Ramos
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
