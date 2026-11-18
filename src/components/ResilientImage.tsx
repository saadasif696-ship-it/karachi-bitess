import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'Karachi Bites Atelier',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1B1B] via-[#141414] to-[#0A0A0A] border border-[rgba(212,175,55,0.2)] text-center p-6 ${className}`}
      >
        <div className="w-10 h-10 rounded-full border border-[rgba(212,175,55,0.35)] flex items-center justify-center mb-3 text-[#D4AF37]">
          <UtensilsCrossed className="w-4 h-4" />
        </div>
        <span className="font-display text-sm text-[#F8F5F0] tracking-wide">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
