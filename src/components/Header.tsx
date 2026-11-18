import { useState } from 'react';
import { LogIn, LogOut, Menu, ShoppingBag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onReserveClick: () => void;
  orderItemCount: number;
  onOpenCart: () => void;
}

const NAV_LINKS = [
  { label: 'Tasting Menu', href: '#menu' },
  { label: 'Enclaves', href: '#enclaves' },
  { label: 'Private Suites', href: '#suites' },
  { label: 'Reservations', href: '#reservations' },
];

export function Header({ onReserveClick, orderItemCount, onOpenCart }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const handleMobileNav = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0A0A0A]/90 border-b border-[rgba(212,175,55,0.2)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-display text-xl md:text-2xl font-semibold tracking-tight text-[#F8F5F0] hover:text-[#F3E5AB] transition-colors whitespace-nowrap shrink-0"
        >
          Karachi Bites
        </a>

        {/* Zone 2: Single-line Navigation Links */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-7">
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

        {/* Zone 3: Google Sign-In, Cart & Primary Reserve Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={signOutUser}
              title={`Signed in as ${user.email}. Click to sign out.`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded border border-[rgba(212,175,55,0.25)] text-[#F3E5AB] hover:border-[#D4AF37] font-label text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="max-w-[110px] truncate">
                {user.displayName?.split(' ')[0] || user.email}
              </span>
              <LogOut className="w-3.5 h-3.5 text-[#A39E93]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[rgba(212,175,55,0.35)] text-[#F8F5F0] hover:border-[#D4AF37] hover:text-[#F3E5AB] font-label text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Google Sign-In</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open cart (${orderItemCount} items)`}
            className="btn-atelier-outline inline-flex items-center gap-2 px-3.5 py-2 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cart</span>
            <span className="tabular-nums text-[#F3E5AB]">({orderItemCount})</span>
          </button>

          <button
            type="button"
            onClick={onReserveClick}
            className="btn-imperial-gold font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-4 sm:px-5 py-2.5 rounded whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reserve a Table
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2.5 rounded border border-[rgba(212,175,55,0.3)] text-[#F8F5F0] hover:border-[#D4AF37] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[rgba(212,175,55,0.18)] bg-[#141414]/95 backdrop-blur-md px-6 py-5 space-y-4">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-3">
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

          <div className="pt-1 flex items-center justify-between gap-3">
            {user ? (
              <>
                <span className="text-[12px] text-[#F3E5AB] truncate">{user.email}</span>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="btn-atelier-outline px-3 py-1.5 rounded font-label text-[10px] font-semibold uppercase tracking-[0.1em] shrink-0 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  signInWithGoogle();
                }}
                className="w-full btn-atelier-outline inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
