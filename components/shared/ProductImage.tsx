import Image from "next/image";
import { ImageOff } from "lucide-react";

type ProductImageProps = {
  url: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  fit?: "cover" | "contain";
};

// Centralizes the "no photo yet" placeholder so every product thumbnail
// (card, gallery, cart row, compact header) handles a missing image the
// same way instead of leaving blank space.
export function ProductImage({
  url,
  alt,
  className = "",
  sizes = "200px",
  fit = "cover",
}: ProductImageProps) {
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          className={fit === "cover" ? "object-cover" : "object-contain"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <ImageOff className="h-[32%] w-[32%]" />
        </div>
      )}
    </div>
  );
}
