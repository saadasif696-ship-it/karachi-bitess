import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { DishItem } from '../data/atelierData';
import { ResilientImage } from './ResilientImage';

interface DishModalProps {
  dish: DishItem | null;
  onClose: () => void;
  onAddToOrder: (dish: DishItem) => void;
}

export function DishModal({ dish, onClose, onAddToOrder }: DishModalProps) {
  const [selectedAngle, setSelectedAngle] = useState(0);

  useEffect(() => {
    setSelectedAngle(0);
  }, [dish?.id]);

  useEffect(() => {
    if (!dish) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dish, onClose]);

  if (!dish) return null;

  const activePhoto = dish.images[selectedAngle] ?? dish.image;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0A0A0A]/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#141414]/95 border border-[rgba(243,229,171,0.3)] rounded overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[280px] sm:h-[320px] w-full overflow-hidden bg-[#0A0A0A]">
          <ResilientImage
            src={activePhoto}
            alt={`${dish.imageAlt} — View ${selectedAngle + 1}`}
            fallbackTitle={dish.name}
            className="w-full h-full object-contain"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tasting notes"
            className="absolute top-4 right-4 p-2 rounded bg-[#0A0A0A]/80 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-3 grid grid-cols-3 gap-3 bg-[#141414]">
          {dish.images.map((thumb, idx) => {
            const active = selectedAngle === idx;
            return (
              <button
                key={thumb}
                type="button"
                onClick={() => setSelectedAngle(idx)}
                className={`aspect-[4/3] rounded overflow-hidden border transition-all cursor-pointer bg-[#0A0A0A] ${
                  active
                    ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                    : 'border-[rgba(212,175,55,0.2)] opacity-65 hover:opacity-100'
                }`}
              >
                <ResilientImage
                  src={thumb}
                  alt={`${dish.name} view ${idx + 1}`}
                  fallbackTitle={`View ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <div className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37] mb-1.5">
              {dish.heritageLabel} · {dish.branchTag}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h3 id="dish-modal-title" className="font-display text-2xl sm:text-3xl font-semibold text-[#F8F5F0]">
                {dish.name}
              </h3>
              <span className="font-display text-xl font-semibold text-[#F3E5AB] tabular-nums">
                PKR {dish.pricePkr.toLocaleString('en-PK')}
              </span>
            </div>
          </div>

          <p className="text-[15px] leading-[1.68] text-[#D0C5AF]">{dish.provenance}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[rgba(212,175,55,0.16)] text-[13px]">
            <div>
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A39E93]">
                Spice &amp; Aromatic Profile
              </p>
              <p className="text-[#F8F5F0] mt-1">{dish.spiceProfile}</p>
            </div>
            <div>
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A39E93]">
                Recommended Chai Pairing
              </p>
              <p className="text-[#F3E5AB] mt-1">{dish.recommendedPairing}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A39E93]">
                Dietary &amp; Allergen Note
              </p>
              <p className="text-[#A39E93] mt-1">{dish.allergens}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(212,175,55,0.16)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-atelier-outline font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-2.5 rounded cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToOrder(dish);
                onClose();
              }}
              className="btn-imperial-gold font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-6 py-2.5 rounded inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Tasting Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
