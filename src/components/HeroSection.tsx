import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRIVATE_SUITES } from '../data/atelierData';
import { ResilientImage } from './ResilientImage';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onReserveClick: () => void;
}

const ATELIER_METRICS = [
  { value: '1984', label: 'Heritage Founded · Tariq Road' },
  { value: '03', label: 'Karachi Enclaves · Clifton, DHA, PECHS' },
  { value: '14 Hours', label: 'Copper-Pot Slow Dum Reduction' },
  { value: '18:00 – 01:00', label: 'Nightly Candlelit Service' },
];

const HERO_SLIDES = [
  {
    image: PRIVATE_SUITES[1].image,
    alt: PRIVATE_SUITES[1].imageAlt,
    kicker: 'DHA Phase 6 Flagship Seating',
    title: 'Modern Booth & Counter Dining Hall',
    priceLabel: 'PKR 14,500 Tasting · Walk-Ins Welcome',
  },
  {
    image: PRIVATE_SUITES[0].image,
    alt: PRIVATE_SUITES[0].imageAlt,
    kicker: 'Clifton Block 4 Lounge',
    title: 'Contemporary Leather Booths & High-Tops',
    priceLabel: 'Express Counter · Table Runner Service',
  },
];

export function HeroSection({ onExploreMenu, onReserveClick }: HeroSectionProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const activeSlide = HERO_SLIDES[slideIndex];

  return (
    <section id="top" className="relative border-b border-[rgba(212,175,55,0.16)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 pt-10 pb-14 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Editorial Proposition (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2 lg:py-4">
            <div>
              <p className="font-label text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-5">
                Clifton · DHA Phase 6 · Tariq Road
              </p>

              <h1
                className="font-display font-semibold text-[#F8F5F0] tracking-[-0.02em] leading-[1.12] mb-6"
                style={{ fontSize: 'clamp(2.25rem, 3.8vw, 3.5rem)', textWrap: 'balance' }}
              >
                Heirloom Pakistani Gastronomy, Tempered in Obsidian &amp; Gold.
              </h1>

              <p className="text-[16px] md:text-[17px] leading-[1.68] text-[#A39E93] max-w-[46ch] mb-8">
                A modern Karachi culinary flagship pairing contemporary fast-casual booth seating with slow-simmered nihari, aged Himalayan basmati dum biryani, and live charcoal grills.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onExploreMenu}
                className="btn-imperial-gold font-label text-[12px] font-semibold uppercase tracking-[0.12em] px-7 py-3.5 rounded whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Tasting Menu
              </button>
              <button
                type="button"
                onClick={onReserveClick}
                className="btn-atelier-outline font-label text-[12px] font-semibold uppercase tracking-[0.12em] px-7 py-3.5 rounded whitespace-nowrap shrink-0 cursor-pointer"
              >
                Book a Table
              </button>
            </div>
          </div>

          {/* Right Sliding Seating Showcase (7 cols) */}
          <div
            className="lg:col-span-7 relative rounded overflow-hidden border border-[rgba(212,175,55,0.22)] bg-[#141414] min-h-[280px] sm:min-h-[380px] lg:min-h-[480px] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {HERO_SLIDES.map((slide) => (
                <div key={slide.kicker} className="w-full h-full shrink-0 relative">
                  <ResilientImage
                    src={slide.image}
                    alt={slide.alt}
                    fallbackTitle={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/88 via-[#0A0A0A]/20 to-transparent pointer-events-none"
            />

            {/* Slide Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                aria-label="Previous seating preview"
                onClick={() =>
                  setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                className="p-2 rounded bg-[#0A0A0A]/75 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] backdrop-blur-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next seating preview"
                onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-2 rounded bg-[#0A0A0A]/75 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] backdrop-blur-sm transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F3E5AB] mb-1">
                  {activeSlide.kicker}
                </p>
                <p className="font-display text-lg md:text-xl text-[#F8F5F0]">
                  {activeSlide.title}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#D4AF37] tabular-nums whitespace-nowrap">
                  {activeSlide.priceLabel}
                </span>
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Hero seating slides">
                  {HERO_SLIDES.map((s, idx) => (
                    <button
                      key={s.kicker}
                      type="button"
                      role="tab"
                      aria-selected={slideIndex === idx}
                      aria-label={`Show ${s.kicker}`}
                      onClick={() => setSlideIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        slideIndex === idx
                          ? 'w-7 bg-[#D4AF37]'
                          : 'w-3 bg-[#A39E93]/45 hover:bg-[#F3E5AB]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Architectural Proof Strip */}
        <div className="mt-10 pt-8 border-t border-[rgba(212,175,55,0.16)] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {ATELIER_METRICS.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="font-display text-2xl md:text-[28px] font-semibold text-[#F3E5AB] tabular-nums">
                {item.value}
              </div>
              <div className="text-[13px] text-[#A39E93] leading-snug">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
