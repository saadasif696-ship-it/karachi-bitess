import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  CELLAR_PAIRINGS,
  PRIVATE_SUITES,
  type BranchId,
} from '../data/atelierData';
import { ResilientImage } from './ResilientImage';

interface SuitesAndCellarSectionProps {
  onBookPrivateSuite: (branchId: BranchId, suiteName: string) => void;
}

export function SuitesAndCellarSection({ onBookPrivateSuite }: SuitesAndCellarSectionProps) {
  const [activeSuiteIndex, setActiveSuiteIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const suite = PRIVATE_SUITES[activeSuiteIndex];

  useEffect(() => {
    if (isPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActiveSuiteIndex((prev) => (prev + 1) % PRIVATE_SUITES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <section id="suites" className="py-16 md:py-24 border-b border-[rgba(212,175,55,0.16)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Sliding Seating Preview (6 cols) */}
          <div
            className="lg:col-span-6 relative rounded overflow-hidden border border-[rgba(212,175,55,0.22)] bg-[#141414] min-h-[320px] lg:min-h-[540px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${activeSuiteIndex * 100}%)` }}
            >
              {PRIVATE_SUITES.map((item) => (
                <div key={item.id} className="w-full h-full shrink-0 relative">
                  <ResilientImage
                    src={item.image}
                    alt={item.imageAlt}
                    fallbackTitle={item.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/28 to-transparent pointer-events-none"
            />

            {/* Top-Right Prev/Next Slide Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <span className="font-label text-[11px] font-semibold tracking-[0.12em] text-[#F3E5AB] bg-[#0A0A0A]/75 border border-[rgba(212,175,55,0.28)] px-2.5 py-1.5 rounded tabular-nums">
                0{activeSuiteIndex + 1} / 0{PRIVATE_SUITES.length}
              </span>
              <button
                type="button"
                aria-label="Previous seating lounge view"
                onClick={() =>
                  setActiveSuiteIndex(
                    (prev) => (prev - 1 + PRIVATE_SUITES.length) % PRIVATE_SUITES.length
                  )
                }
                className="p-2 rounded bg-[#0A0A0A]/75 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] backdrop-blur-sm transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next seating lounge view"
                onClick={() =>
                  setActiveSuiteIndex((prev) => (prev + 1) % PRIVATE_SUITES.length)
                }
                className="p-2 rounded bg-[#0A0A0A]/75 border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] backdrop-blur-sm transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37] mb-1">
                  {suite.branchName} · {suite.capacity}
                </p>
                <h3 className="font-display text-2xl font-medium text-[#F8F5F0]">{suite.name}</h3>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="font-label text-[12px] font-semibold uppercase tracking-[0.1em] text-[#F3E5AB] tabular-nums whitespace-nowrap">
                  From PKR {suite.minimumSpendPkr.toLocaleString('en-PK')}
                </span>
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Seating lounge slides">
                  {PRIVATE_SUITES.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={activeSuiteIndex === idx}
                      aria-label={`Preview ${s.name}`}
                      onClick={() => setActiveSuiteIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeSuiteIndex === idx
                          ? 'w-7 bg-[#D4AF37]'
                          : 'w-3 bg-[#A39E93]/45 hover:bg-[#F3E5AB]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Private Suites & Chai Cellar Details (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-10">
            <div>
              <p className="font-label text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-3">
                Seating Lounge &amp; Botanical Cellar
              </p>
              <h2
                className="font-display text-3xl md:text-[38px] font-semibold text-[#F8F5F0] leading-[1.16] mb-6"
                style={{ textWrap: 'balance' }}
              >
                Contemporary Fast-Casual Booths &amp; Group Seating
              </h2>

              {/* Suite Tabs */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {PRIVATE_SUITES.map((item, idx) => {
                  const active = idx === activeSuiteIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSuiteIndex(idx)}
                      className={`px-4 py-2 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#D4AF37] text-[#0A0A0A]'
                          : 'bg-[#141414] text-[#A39E93] border border-[rgba(212,175,55,0.2)] hover:text-[#F8F5F0]'
                      }`}
                    >
                      {item.branchId === 'clifton' ? 'Clifton Booths (10)' : 'DHA Dining Hall (16)'}
                    </button>
                  );
                })}
              </div>

              <p className="text-[15px] leading-[1.7] text-[#A39E93] mb-5">{suite.summary}</p>

              <ul className="space-y-2.5 mb-7">
                {suite.details.map((detail) => (
                  <li
                    key={detail}
                    className="text-[14px] text-[#F8F5F0] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-[1px] before:bg-[#D4AF37]"
                  >
                    {detail}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onBookPrivateSuite(suite.branchId, suite.name)}
                className="btn-imperial-gold font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-6 py-3 rounded whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reserve {suite.branchId === 'clifton' ? 'Clifton Booths' : 'DHA Dining Hall'}
              </button>
            </div>

            {/* Zero-Proof Chai & Botanical Pairing Flight */}
            <div className="pt-8 border-t border-[rgba(212,175,55,0.18)]">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-xl font-medium text-[#F8F5F0]">
                  Zero-Proof Chai &amp; Botanical Cellar
                </h3>
                <span className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                  3-Course Flight · PKR 4,200
                </span>
              </div>

              <div className="divide-y divide-[rgba(212,175,55,0.12)]">
                {CELLAR_PAIRINGS.map((pairing) => (
                  <div key={pairing.id} className="py-3.5 flex items-start justify-between gap-6">
                    <div>
                      <div className="text-[15px] font-medium text-[#F8F5F0]">{pairing.name}</div>
                      <div className="text-[12px] text-[#D4AF37] mt-0.5">{pairing.origin}</div>
                      <div className="text-[13px] text-[#A39E93] mt-1">{pairing.notes}</div>
                    </div>
                    <div className="font-display text-[15px] font-semibold text-[#F3E5AB] tabular-nums whitespace-nowrap shrink-0">
                      PKR {pairing.pricePkr.toLocaleString('en-PK')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
