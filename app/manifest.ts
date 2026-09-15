import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DMC FUJI | Ceremonial Kimono Photo Studio & Rental",
    short_name: "DMC FUJI",
    description:
      "Kimono experience in Fuji City, Shizuoka. Photo sessions with Mt. Fuji and tea fields.",
    start_url: "/ja",
    display: "standalone",
    background_color: "#F4F1EA",
    theme_color: "#181816",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
