import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, MapPin, Plus, ShoppingBag } from 'lucide-react';
import {
  BRANCHES,
  COURSE_CATEGORIES,
  MENU_DISHES,
  type BranchId,
  type CourseCategory,
  type DishItem,
} from '../data/atelierData';
import { ResilientImage } from './ResilientImage';

export type MenuOverrides = Record<string, { inStock?: boolean; pricePkr?: number }>;

interface MenuSectionProps {
  selectedBranch: BranchId;
  onSelectBranch: (branchId: BranchId) => void;
  onSelectDish: (dish: DishItem) => void;
  onAddToOrder: (dish: DishItem) => void;
  orderItemCount: number;
  onOpenOrderDrawer: () => void;
  justAddedId: string | null;
  menuOverrides?: MenuOverrides;
}

export function MenuSection({
  selectedBranch,
  onSelectBranch,
  onSelectDish,
  onAddToOrder,
  orderItemCount,
  onOpenOrderDrawer,
  justAddedId,
  menuOverrides = {},
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('All Courses');
  const [activeAngleByDish, setActiveAngleByDish] = useState<Record<string, number>>({});

  const activeBranchInfo = useMemo(
    () => BRANCHES.find((b) => b.id === selectedBranch) ?? BRANCHES[0],
    [selectedBranch]
  );

  const visibleDishes = useMemo(() => {
    const filteredByCategory =
      activeCategory === 'All Courses'
        ? MENU_DISHES
        : MENU_DISHES.filter((d) => d.category === activeCategory);

    // Prioritize branch-exclusive dishes first for the selected enclave
    return [...filteredByCategory].sort((a, b) => {
      const aMatch = a.exclusiveBranch === selectedBranch ? 0 : 1;
      const bMatch = b.exclusiveBranch === selectedBranch ? 0 : 1;
      return aMatch - bMatch;
    });
  }, [activeCategory, selectedBranch]);

  return (
    <section id="menu" className="py-16 md:py-24 border-b border-[rgba(212,175,55,0.16)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Section Heading & Specialized Location Selector */}
        <div
          id="enclaves"
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[rgba(212,175,55,0.16)]"
        >
          <div className="max-w-xl">
            <p className="font-label text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-3">
              Curated Tasting Folio
            </p>
            <h2
              className="font-display text-3xl md:text-[42px] font-semibold text-[#F8F5F0] leading-[1.15] tracking-[-0.01em]"
              style={{ textWrap: 'balance' }}
            >
              Select Your Enclave &amp; Evening Course
            </h2>
          </div>

          {/* Specialized Component: Location Selector */}
          <div role="tablist" aria-label="Karachi Bites Flagship Enclaves" className="flex flex-wrap items-center gap-6 sm:gap-8">
            {BRANCHES.map((branch) => {
              const isActive = branch.id === selectedBranch;
              return (
                <button
                  key={branch.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectBranch(branch.id)}
                  className={`relative pb-3 font-label text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#F8F5F0]'
                      : 'text-[#A39E93] hover:text-[#F3E5AB]'
                  }`}
                >
                  {branch.shortLabel}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 bottom-0 h-[2px] transition-opacity duration-200 ${
                      isActive
                        ? 'opacity-100 bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#AA7C11]'
                        : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Enclave Atelier Brief */}
        <div className="mt-8 bg-[#141414] border border-[rgba(212,175,55,0.2)] rounded p-6 md:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-1.5">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="font-label text-[11px] font-semibold uppercase tracking-[0.12em]">
                {activeBranchInfo.name}
              </span>
            </div>
            <p className="text-[15px] text-[#F8F5F0] font-medium">{activeBranchInfo.address}</p>
            <p className="text-[13px] text-[#A39E93]">{activeBranchInfo.valetNote}</p>
          </div>

          <div className="md:col-span-4 md:border-l md:border-[rgba(212,175,55,0.16)] md:pl-6 space-y-1">
            <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93]">
              Atelier Distinction
            </p>
            <p className="text-[14px] text-[#F3E5AB]">{activeBranchInfo.exclusiveFeature}</p>
            <p className="text-[13px] text-[#A39E93]">{activeBranchInfo.chefNote}</p>
          </div>

          <div className="md:col-span-3 md:border-l md:border-[rgba(212,175,55,0.16)] md:pl-6 flex flex-col justify-center space-y-1">
            <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93]">
              Service &amp; Concierge
            </p>
            <p className="text-[14px] text-[#F8F5F0] tabular-nums">{activeBranchInfo.hours}</p>
            <p className="text-[13px] text-[#D4AF37] tabular-nums">{activeBranchInfo.phone}</p>
          </div>
        </div>

        {/* Course Category Filter Toolbar + Tasting Order Drawer Trigger */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {COURSE_CATEGORIES.filter((c) => c !== 'Cellar & Chai').map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#D4AF37] text-[#0A0A0A]'
                      : 'bg-[#141414] text-[#A39E93] border border-[rgba(212,175,55,0.2)] hover:text-[#F8F5F0] hover:border-[rgba(212,175,55,0.45)]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenOrderDrawer}
            className="btn-atelier-outline inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded font-label text-[11px] font-semibold uppercase tracking-[0.12em] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>View Cart</span>
            <span className="tabular-nums text-[#F3E5AB]">({orderItemCount})</span>
          </button>
        </div>

        {/* 3-Column Charcoal Menu Folios */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleDishes.map((dish) => {
            const override = menuOverrides[dish.id];
            const effectivePrice = override?.pricePkr ?? dish.pricePkr;
            const inStock = override?.inStock !== false;
            const effectiveDish =
              effectivePrice !== dish.pricePkr ? { ...dish, pricePkr: effectivePrice } : dish;
            const isHighlightedForBranch = dish.exclusiveBranch === selectedBranch;
            const isAdded = justAddedId === dish.id;

            const activeAngle = activeAngleByDish[dish.id] ?? 0;

            return (
              <article
                key={dish.id}
                className={`folio-card rounded overflow-hidden flex flex-col justify-between ${
                  inStock ? '' : 'opacity-75'
                }`}
              >
                <div>
                  {/* Sliding 3-Angle Dish Preview */}
                  <div className="relative aspect-[4/4] overflow-hidden bg-[#0E0E0E] group">
                    <div
                      className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ transform: `translateX(-${activeAngle * 100}%)` }}
                    >
                      {dish.images.map((imgSrc, idx) => (
                        <div key={imgSrc} className="w-full h-full shrink-0">
                          <ResilientImage
                            src={imgSrc}
                            alt={`${dish.imageAlt} — View ${idx + 1}`}
                            fallbackTitle={dish.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      ))}
                    </div>

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/15 to-transparent pointer-events-none"
                    />

                    {/* Subtle Prev / Next Slide Arrows */}
                    <button
                      type="button"
                      aria-label={`Previous ${dish.name} image`}
                      onClick={() =>
                        setActiveAngleByDish((prev) => ({
                          ...prev,
                          [dish.id]: (activeAngle - 1 + dish.images.length) % dish.images.length,
                        }))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded bg-[#0A0A0A]/70 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Next ${dish.name} image`}
                      onClick={() =>
                        setActiveAngleByDish((prev) => ({
                          ...prev,
                          [dish.id]: (activeAngle + 1) % dish.images.length,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded bg-[#0A0A0A]/70 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 3 Product Angle Thumbnails */}
                  <div className="px-6 pt-3 grid grid-cols-3 gap-2" role="group" aria-label={`${dish.name} gallery views`}>
                    {dish.images.map((thumbSrc, idx) => {
                      const isThumbActive = activeAngle === idx;
                      return (
                        <button
                          key={thumbSrc}
                          type="button"
                          onClick={() =>
                            setActiveAngleByDish((prev) => ({ ...prev, [dish.id]: idx }))
                          }
                          aria-label={`View ${dish.name} angle ${idx + 1}`}
                          aria-pressed={isThumbActive}
                          className={`relative aspect-[4/3] rounded overflow-hidden border transition-all cursor-pointer ${
                            isThumbActive
                              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                              : 'border-[rgba(212,175,55,0.2)] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <ResilientImage
                            src={thumbSrc}
                            alt={`${dish.name} angle ${idx + 1}`}
                            fallbackTitle={`View ${idx + 1}`}
                            className="w-full h-full object-cover object-center"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Dish Copy */}
                  <div className="px-6 pt-4 pb-5">
                    <div className="flex items-center gap-2 font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#D4AF37] mb-2">
                      <span>{dish.heritageLabel}</span>
                      <span aria-hidden="true" className="text-[#A39E93]">
                        ·
                      </span>
                      <span
                        className={
                          !inStock
                            ? 'text-[#FFB4AB]'
                            : isHighlightedForBranch
                              ? 'text-[#F3E5AB]'
                              : 'text-[#A39E93]'
                        }
                      >
                        {inStock ? dish.branchTag : 'Sold Out'}
                      </span>
                    </div>

                    <h3 className="font-display text-[22px] font-medium text-[#F8F5F0] leading-[1.28] mb-2.5">
                      {dish.name}
                    </h3>

                    <p className="text-[14px] leading-[1.6] text-[#A39E93] mb-3">
                      {dish.shortDescription}
                    </p>

                    <p className="text-[12px] text-[#D0C5AF]">{dish.servingNote}</p>
                  </div>
                </div>

                {/* Price & Actions Baseline */}
                <div className="px-6 pb-6 pt-4 border-t border-[rgba(212,175,55,0.12)] flex items-center justify-between gap-4">
                  <div className="font-display text-lg font-semibold text-[#F3E5AB] tabular-nums whitespace-nowrap">
                    PKR {effectivePrice.toLocaleString('en-PK')}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectDish(effectiveDish)}
                      className="px-3 py-2 rounded font-label text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A39E93] hover:text-[#F8F5F0] inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Notes</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => onAddToOrder(effectiveDish)}
                      className={`px-4 py-2 rounded font-label text-[11px] font-semibold uppercase tracking-[0.08em] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                        !inStock
                          ? 'bg-[#1C1B1B] text-[#A39E93] border border-[rgba(255,180,171,0.2)] cursor-not-allowed'
                          : isAdded
                            ? 'bg-[#D4AF37] text-[#0A0A0A] cursor-pointer'
                            : 'btn-atelier-outline cursor-pointer'
                      }`}
                    >
                      {!inStock ? (
                        <span>Sold Out</span>
                      ) : isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
