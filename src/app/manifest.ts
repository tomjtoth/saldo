import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saldo",
    description: "A multi-user expense tracker app",
    start_url: "/",
    display: "standalone",
  };
}
