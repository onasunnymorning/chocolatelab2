import Image from "next/image";

interface CacaoPodIconProps {
  className?: string;
  size?: number;
}

/**
 * Cacao pod icon — amber/golden palette matching the app's primary color.
 * Drop-in replacement for the 🍫 emoji in cacao toggles.
 */
export function CacaoPodIcon({ className, size = 20 }: CacaoPodIconProps) {
  return (
    <Image
      src="/cacao-pod.png"
      alt="cacao pod"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", mixBlendMode: "multiply" }}
    />
  );
}
