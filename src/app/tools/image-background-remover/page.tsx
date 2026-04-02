import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Image Background Remover Tool | Remove Background Online",
  description:
    "Use our online image background remover to delete backgrounds from photos and download transparent PNG files instantly.",
  alternates: {
    canonical: "/tools/image-background-remover",
  },
};

export default function ToolPage() {
  return <ToolClient />;
}
