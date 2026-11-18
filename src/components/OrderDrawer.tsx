import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, LogOut, Minus, Plus, Trash2, X } from 'lucide-react';
import { BRANCHES, type BranchId, type DishItem } from '../data/atelierData';
import { useAuth } from '../context/AuthContext';

export interface OrderLineItem {
  dish: DishItem;
  quantity: number;
}

interface OrderDrawerProps {
  open: boolean;
  onClose: () => void;
  items: OrderLineItem[];
  selectedBranch: BranchId;
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearOrder: () => void;
}

interface ConfirmedOrder {
  orderNumber: string;
  fulfillment: 'delivery' | 'pickup';
  branchName: string;
  totalPkr: number;
  customerName: string;
  address: string;
}

const COMPLIMENTARY_DELIVERY_THRESHOLD = 12000;
const DELIVERY_FEE = 650;

export function OrderDrawer({
  open,
  onClose,
  items,
  selectedBranch,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
}: OrderDrawerProps) {
  const { user, idToken, authError, myOrders, signInWithGoogle, signOutUser, refreshAccountData } = useAuth();
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (user?.displayName && !customerName) {
      setCustomerName(user.displayName);
    }
  }, [user, customerName]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    refreshAccountData();
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, refreshAccountData]);

  if (!open) return null;

  const branchInfo = BRANCHES.find((b) => b.id === selectedBranch) ?? BRANCHES[0];
  const subtotal = items.reduce((sum, line) => sum + line.dish.pricePkr * line.quantity, 0);
  const qualifiesFreeDelivery = subtotal >= COMPLIMENTARY_DELIVERY_THRESHOLD;
  const deliveryCharge =
    fulfillment === 'delivery' && items.length > 0 && !qualifiesFreeDelivery ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) return;
    if (customerName.trim().length < 2) {
      setError('Please enter recipient name.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (fulfillment === 'delivery' && address.trim().length < 6) {
      setError('Please enter your Clifton, DHA, or PECHS delivery address.');
      return;
    }

    let token = idToken;
    if (!token) {
      token = await signInWithGoogle();
      if (!token) {
        setError('Please sign in with Google to confirm your dispatch order.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branchId: selectedBranch,
          customerName: customerName.trim(),
          customerPhone: phone.trim(),
          fulfillment,
          deliveryAddress: fulfillment === 'delivery' ? address.trim() : undefined,
          items: items.map((line) => ({
            menuItemId: line.dish.id,
            quantity: line.quantity,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || 'Unable to place order. Please try again.');
        return;
      }

      setConfirmedOrder({
        orderNumber: payload.order?.orderCode ?? 'KB-CONFIRMED',
        fulfillment,
        branchName: branchInfo.name,
        totalPkr: payload.order?.totalPkr ?? grandTotal,
        customerName: customerName.trim(),
        address: fulfillment === 'delivery' ? address.trim() : branchInfo.address,
      });
      onClearOrder();
      await refreshAccountData(token);
    } catch {
      setError('Network error while submitting order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tasting Order Folio"
      className="fixed inset-0 z-50 flex justify-end bg-[#0A0A0A]/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[#141414] border-l border-[rgba(243,229,171,0.28)] flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[rgba(212,175,55,0.18)] flex items-center justify-between">
          <div>
            <p className="font-label text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">
              {branchInfo.shortLabel} Home Delivery &amp; Pickup
            </p>
            <h3 className="font-display text-2xl font-semibold text-[#F8F5F0]">Your Cart</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tasting order drawer"
            className="p-2 rounded border border-[rgba(212,175,55,0.25)] text-[#A39E93] hover:text-[#F8F5F0] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Account Bar */}
          <div className="p-3.5 rounded bg-[#0A0A0A] border border-[rgba(212,175,55,0.18)] flex items-center justify-between gap-3">
            {user ? (
              <>
                <div className="min-w-0">
                  <p className="font-label text-[10px] uppercase tracking-[0.1em] text-[#D4AF37]">
                    Signed In
                  </p>
                  <p className="text-[13px] text-[#F8F5F0] truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="text-[11px] font-label uppercase tracking-[0.08em] text-[#A39E93] hover:text-[#F8F5F0] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-[12px] text-[#A39E93]">
                  Sign in with Google to confirm Home Delivery &amp; track orders.
                </p>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="btn-imperial-gold px-3.5 py-2 rounded font-label text-[10px] font-semibold uppercase tracking-[0.1em] shrink-0 cursor-pointer"
                >
                  Sign in with Google
                </button>
              </>
            )}
          </div>

          {authError && (
            <div
              role="alert"
              className="p-3 rounded bg-[#2A1215] border border-[rgba(255,180,171,0.35)] text-[12px] text-[#FFB4AB]"
            >
              {authError}
            </div>
          )}

          {confirmedOrder ? (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-label text-[11px] font-semibold uppercase tracking-[0.14em]">
                  Order {confirmedOrder.orderNumber} Confirmed
                </span>
              </div>
              <h4 className="font-display text-2xl text-[#F8F5F0]">
                Preparing Your Copper-Sealed Dispatch
              </h4>
              <p className="text-[14px] leading-relaxed text-[#A39E93]">
                {confirmedOrder.fulfillment === 'delivery'
                  ? `Our private courier from ${confirmedOrder.branchName} will dispatch to ${confirmedOrder.address}. Cash on Delivery or POS terminal accepted upon arrival.`
                  : `Your tasting folio will be staged for priority handover at ${confirmedOrder.branchName} (${confirmedOrder.address}).`}
              </p>
              <div className="p-4 rounded bg-[#0A0A0A] border border-[rgba(212,175,55,0.2)] flex items-center justify-between">
                <span className="font-label text-[11px] uppercase tracking-[0.1em] text-[#A39E93]">
                  Total Payable
                </span>
                <span className="font-display text-lg font-semibold text-[#F3E5AB] tabular-nums">
                  PKR {confirmedOrder.totalPkr.toLocaleString('en-PK')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full btn-atelier-outline font-label text-[11px] font-semibold uppercase tracking-[0.12em] py-3 rounded cursor-pointer"
              >
                Return to Tasting Menu
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center space-y-4">
              <p className="font-display text-xl text-[#F8F5F0]">Your Cart is Empty</p>
              <p className="text-[14px] text-[#A39E93] max-w-xs mx-auto">
                Click &ldquo;Add to Cart&rdquo; on any dish from the menu to place a Home Delivery or Self Pickup order.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-imperial-gold font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-2.5 rounded cursor-pointer"
              >
                Browse Menu for Home Delivery
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="divide-y divide-[rgba(212,175,55,0.14)]">
                {items.map((line) => (
                  <div key={line.dish.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-display text-[17px] text-[#F8F5F0] leading-snug">
                        {line.dish.name}
                      </h4>
                      <p className="text-[12px] text-[#A39E93] tabular-nums">
                        PKR {line.dish.pricePkr.toLocaleString('en-PK')} each
                      </p>
                      <div className="flex items-center gap-2 pt-1.5">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.dish.name}`}
                          onClick={() => onUpdateQuantity(line.dish.id, -1)}
                          className="p-1 rounded border border-[rgba(212,175,55,0.25)] text-[#A39E93] hover:text-[#F8F5F0] cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[13px] font-medium text-[#F8F5F0] tabular-nums w-5 text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.dish.name}`}
                          onClick={() => onUpdateQuantity(line.dish.id, 1)}
                          className="p-1 rounded border border-[rgba(212,175,55,0.25)] text-[#A39E93] hover:text-[#F8F5F0] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="font-display text-[16px] font-semibold text-[#F3E5AB] tabular-nums">
                        PKR {(line.dish.pricePkr * line.quantity).toLocaleString('en-PK')}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${line.dish.name}`}
                        onClick={() => onRemoveItem(line.dish.id)}
                        className="text-[#A39E93] hover:text-[#FFB4AB] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fulfillment & Verification Form */}
              <form id="order-checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-[rgba(212,175,55,0.18)]">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFulfillment('delivery')}
                    className={`py-2.5 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] cursor-pointer ${
                      fulfillment === 'delivery'
                        ? 'bg-[#D4AF37] text-[#0A0A0A]'
                        : 'bg-[#0A0A0A] border border-[rgba(212,175,55,0.22)] text-[#A39E93]'
                    }`}
                  >
                    Home Delivery (COD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment('pickup')}
                    className={`py-2.5 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] cursor-pointer ${
                      fulfillment === 'pickup'
                        ? 'bg-[#D4AF37] text-[#0A0A0A]'
                        : 'bg-[#0A0A0A] border border-[rgba(212,175,55,0.22)] text-[#A39E93]'
                    }`}
                  >
                    Self Pickup
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Recipient Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-3.5 py-2.5 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number (+92 300 ...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-3.5 py-2.5 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 tabular-nums outline-none"
                />
                {fulfillment === 'delivery' && (
                  <input
                    type="text"
                    placeholder="Street & Residence (Clifton / DHA / PECHS)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-3.5 py-2.5 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 outline-none"
                  />
                )}
                {error && <p className="text-[12px] text-[#FFB4AB]">{error}</p>}
              </form>
            </>
          )}

          {/* Live Order Tracking for Signed-In Customer */}
          {user && myOrders.length > 0 && (
            <div className="pt-5 border-t border-[rgba(212,175,55,0.16)] space-y-3">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                Your Recent Orders
              </p>
              <div className="space-y-2.5">
                {myOrders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3.5 rounded bg-[#0A0A0A] border border-[rgba(212,175,55,0.16)] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-[#F3E5AB] tabular-nums">
                        {ord.orderCode} · {ord.branchLabel}
                      </span>
                      <span className="font-label text-[10px] uppercase tracking-[0.1em] text-[#D4AF37]">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A39E93] line-clamp-1">{ord.itemsSummary}</p>
                    <p className="text-[12px] text-[#F8F5F0] tabular-nums">
                      PKR {ord.totalPkr.toLocaleString('en-PK')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Totals */}
        {items.length > 0 && !confirmedOrder && (
          <div className="p-6 border-t border-[rgba(212,175,55,0.2)] bg-[#0E0E0E] space-y-4">
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between text-[#A39E93]">
                <span>Subtotal</span>
                <span className="tabular-nums text-[#F8F5F0]">
                  PKR {subtotal.toLocaleString('en-PK')}
                </span>
              </div>
              {fulfillment === 'delivery' && (
                <div className="flex justify-between text-[#A39E93]">
                  <span>Chilled Thermal Dispatch</span>
                  <span className="tabular-nums text-[#F8F5F0]">
                    {qualifiesFreeDelivery ? 'Complimentary' : `PKR ${DELIVERY_FEE}`}
                  </span>
                </div>
              )}
              {fulfillment === 'delivery' && !qualifiesFreeDelivery && (
                <p className="text-[11px] text-[#D4AF37] pt-0.5">
                  Complimentary courier dispatch on orders above PKR 12,000.
                </p>
              )}
              <div className="flex justify-between pt-2 border-t border-[rgba(212,175,55,0.14)] text-[15px] font-semibold">
                <span className="text-[#F8F5F0]">Total (COD / Valet)</span>
                <span className="font-display text-lg text-[#F3E5AB] tabular-nums">
                  PKR {grandTotal.toLocaleString('en-PK')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="order-checkout-form"
              disabled={submitting}
              className="w-full btn-imperial-gold font-label text-[12px] font-semibold uppercase tracking-[0.12em] py-3.5 rounded cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? 'Confirming Order...'
                : fulfillment === 'delivery'
                  ? 'Place Home Delivery Order'
                  : 'Place Pickup Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
