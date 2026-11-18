import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onReserveClick: () => void;
}

const NAV_LINKS = [
  { label: 'Tasting Menu', href: '#menu' },
  { label: 'Enclaves', href: '#enclaves' },
  { label: 'Private Suites', href: '#suites' },
  { label: 'Reservations', href: '#reservations' },
];

export function Header({ onReserveClick }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNav = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0A0A0A]/85 border-b border-[rgba(212,175,55,0.2)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-xl md:text-2xl font-semibold tracking-tight text-[#F8F5F0] hover:text-[#F3E5AB] transition-colors whitespace-nowrap shrink-0"
        >
          Karachi Bites
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-label text-[12px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] hover:text-[#F8F5F0] pb-0.5 border-b border-transparent hover:border-[#D4AF37] transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReserveClick}
            className="btn-imperial-gold font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-2.5 rounded whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reserve a Table
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2.5 rounded border border-[rgba(212,175,55,0.3)] text-[#F8F5F0] hover:border-[#D4AF37] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[rgba(212,175,55,0.18)] bg-[#141414]/95 backdrop-blur-md px-6 py-5">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleMobileNav(link.href)}
                className="text-left font-label text-xs font-semibold uppercase tracking-[0.12em] text-[#F8F5F0] py-2 border-b border-[rgba(212,175,55,0.12)] cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
