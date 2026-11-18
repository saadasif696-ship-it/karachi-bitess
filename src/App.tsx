import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BranchId, DishItem } from './data/atelierData';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MenuSection, type MenuOverrides } from './components/MenuSection';
import { SuitesAndCellarSection } from './components/SuitesAndCellarSection';
import { ReservationSection, type DiningExperience } from './components/ReservationSection';
import { DishModal } from './components/DishModal';
import { OrderDrawer, type OrderLineItem } from './components/OrderDrawer';
import { Footer } from './components/Footer';

function StorefrontContent() {
  const [selectedBranch, setSelectedBranch] = useState<BranchId>('clifton');
  const [activeDish, setActiveDish] = useState<DishItem | null>(null);
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [preferredExperience, setPreferredExperience] =
    useState<DiningExperience>('Main Dining Room');
  const [preferredSuiteNote, setPreferredSuiteNote] = useState('');
  const [menuOverrides, setMenuOverrides] = useState<MenuOverrides>({});

  const fetchLiveMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.items)) return;

      const nextOverrides: MenuOverrides = {};
      for (const item of data.items) {
        if (item && typeof item.id === 'string') {
          nextOverrides[item.id] = {
            inStock: item.inStock !== false,
            pricePkr: typeof item.pricePkr === 'number' ? item.pricePkr : undefined,
          };
        }
      }
      setMenuOverrides(nextOverrides);
    } catch {
      // Keep static fallback catalog if server request fails
    }
  }, []);

  useEffect(() => {
    fetchLiveMenu();
    const handleFocus = () => {
      fetchLiveMenu();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchLiveMenu]);

  const scrollToSection = useCallback((selector: string) => {
    const el = document.querySelector(selector);
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleAddToOrder = useCallback((dish: DishItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((line) => line.dish.id === dish.id);
      if (existing) {
        return prev.map((line) =>
          line.dish.id === dish.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });

    setJustAddedId(dish.id);
    window.setTimeout(() => {
      setJustAddedId((curr) => (curr === dish.id ? null : curr));
    }, 1200);
  }, []);

  const handleUpdateQuantity = useCallback((dishId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((line) =>
          line.dish.id === dishId ? { ...line, quantity: line.quantity + delta } : line
        )
        .filter((line) => line.quantity > 0)
    );
  }, []);

  const handleRemoveItem = useCallback((dishId: string) => {
    setOrderItems((prev) => prev.filter((line) => line.dish.id !== dishId));
  }, []);

  const handleBookPrivateSuite = useCallback(
    (branchId: BranchId, suiteName: string) => {
      setSelectedBranch(branchId);
      setPreferredExperience('Private Salon Suite');
      setPreferredSuiteNote(`Private inquiry for ${suiteName}`);
      scrollToSection('#reservations');
    },
    [scrollToSection]
  );

  const orderItemCount = useMemo(
    () => orderItems.reduce((sum, line) => sum + line.quantity, 0),
    [orderItems]
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F8F5F0] flex flex-col">
      <Header onReserveClick={() => scrollToSection('#reservations')} />

      <main className="flex-1">
        <HeroSection
          onExploreMenu={() => scrollToSection('#menu')}
          onReserveClick={() => scrollToSection('#reservations')}
        />

        <MenuSection
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          onSelectDish={setActiveDish}
          onAddToOrder={handleAddToOrder}
          orderItemCount={orderItemCount}
          onOpenOrderDrawer={() => setOrderDrawerOpen(true)}
          justAddedId={justAddedId}
          menuOverrides={menuOverrides}
        />

        <SuitesAndCellarSection onBookPrivateSuite={handleBookPrivateSuite} />

        <ReservationSection
          selectedBranch={selectedBranch}
          onSelectBranch={setSelectedBranch}
          preferredExperience={preferredExperience}
          preferredSuiteNote={preferredSuiteNote}
        />
      </main>

      <Footer />

      <DishModal
        dish={activeDish}
        onClose={() => setActiveDish(null)}
        onAddToOrder={handleAddToOrder}
      />

      <OrderDrawer
        open={orderDrawerOpen}
        onClose={() => setOrderDrawerOpen(false)}
        items={orderItems}
        selectedBranch={selectedBranch}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearOrder={() => setOrderItems([])}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StorefrontContent />
    </AuthProvider>
  );
}
