import { BRANCHES } from '../data/atelierData';

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] py-14 md:py-16">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[rgba(212,175,55,0.16)]">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-display text-2xl font-semibold text-[#F8F5F0]">Karachi Bites</div>
            <p className="text-[14px] leading-[1.65] text-[#A39E93] max-w-sm">
              Imperial Ephemeral culinary atelier honoring heirloom Pakistani slow-dum craft across Karachi’s historic and coastal enclaves since 1984.
            </p>
          </div>

          {/* Enclave Directory */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BRANCHES.map((branch) => (
              <div key={branch.id} className="space-y-1.5">
                <div className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                  {branch.shortLabel}
                </div>
                <p className="text-[13px] text-[#F8F5F0] leading-snug">{branch.address}</p>
                <p className="text-[12px] text-[#A39E93] tabular-nums">{branch.hours}</p>
                <p className="text-[12px] text-[#D0C5AF] tabular-nums">{branch.phone}</p>
              </div>
            ))}
          </div>

          {/* Quick Anchor Navigation */}
          <div className="md:col-span-2 flex flex-col gap-2.5 md:items-end">
            <span className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-1">
              Navigation
            </span>
            <a href="#menu" className="text-[13px] text-[#F8F5F0] hover:text-[#D4AF37] transition-colors">
              Tasting Menu
            </a>
            <a href="#enclaves" className="text-[13px] text-[#F8F5F0] hover:text-[#D4AF37] transition-colors">
              Flagship Enclaves
            </a>
            <a href="#suites" className="text-[13px] text-[#F8F5F0] hover:text-[#D4AF37] transition-colors">
              Private Suites
            </a>
            <a href="#reservations" className="text-[13px] text-[#F8F5F0] hover:text-[#D4AF37] transition-colors">
              Reservations
            </a>
            <a href="/admin.html" className="text-[13px] text-[#D4AF37] hover:text-[#F3E5AB] transition-colors pt-1">
              Staff Portal
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12px] text-[#A39E93]">
          <p>© {new Date().getFullYear()} Karachi Bites Culinary Atelier. All rights reserved.</p>
          <p>Clifton Block 4 · DHA Phase 6 · PECHS Tariq Road</p>
        </div>
      </div>
    </footer>
  );
}
