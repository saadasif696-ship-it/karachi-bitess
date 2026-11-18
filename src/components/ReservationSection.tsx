import { useEffect, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, LogIn, LogOut, Minus, Plus } from 'lucide-react';
import { BRANCHES, type BranchId } from '../data/atelierData';
import { useAuth } from '../context/AuthContext';

export type DiningExperience = 'Main Dining Room' | "Chef's 7-Course Counter" | 'Private Salon Suite';

interface ReservationSectionProps {
  selectedBranch: BranchId;
  onSelectBranch: (branchId: BranchId) => void;
  preferredExperience: DiningExperience;
  preferredSuiteNote: string;
}

interface ConfirmedReservation {
  code: string;
  branchName: string;
  valetNote: string;
  experience: DiningExperience;
  date: string;
  time: string;
  guests: number;
  guestName: string;
  phone: string;
  notes: string;
}

const EVENING_SLOTS = ['19:00', '20:30', '22:00', '23:15'];
const EXPERIENCES: DiningExperience[] = [
  'Main Dining Room',
  "Chef's 7-Course Counter",
  'Private Salon Suite',
];

function getTomorrowIsoDate(): string {
  const tomorrow = new Date(Date.now() + 86400000);
  return tomorrow.toISOString().split('T')[0];
}

export function ReservationSection({
  selectedBranch,
  onSelectBranch,
  preferredExperience,
  preferredSuiteNote,
}: ReservationSectionProps) {
  const { user, idToken, authError, signInWithGoogle, signOutUser, refreshAccountData } = useAuth();
  const [experience, setExperience] = useState<DiningExperience>(preferredExperience);
  const [date, setDate] = useState<string>(getTomorrowIsoDate);
  const [timeSlot, setTimeSlot] = useState<string>('20:30');
  const [guests, setGuests] = useState<number>(4);
  const [guestName, setGuestName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>(preferredSuiteNote);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<ConfirmedReservation | null>(null);

  useEffect(() => {
    setExperience(preferredExperience);
  }, [preferredExperience]);

  useEffect(() => {
    if (preferredSuiteNote) {
      setNotes(preferredSuiteNote);
    }
  }, [preferredSuiteNote]);

  useEffect(() => {
    if (user?.displayName && !guestName) {
      setGuestName(user.displayName);
    }
  }, [user, guestName]);

  const activeBranch = BRANCHES.find((b) => b.id === selectedBranch) ?? BRANCHES[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = guestName.trim();
    const digitsOnly = phone.replace(/\D/g, '');

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter the primary guest name for the reservation ledger.');
      return;
    }

    if (digitsOnly.length < 10) {
      setErrorMessage('Please provide a valid contact number (at least 10 digits) for concierge confirmation.');
      return;
    }

    if (!date) {
      setErrorMessage('Please choose an evening date.');
      return;
    }

    let token = idToken;
    if (!token) {
      token = await signInWithGoogle();
      if (!token) {
        setErrorMessage('Please sign in with Google using the button above to confirm your reservation.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          branchId: selectedBranch,
          experience,
          date,
          timeSlot,
          guests,
          guestName: trimmedName,
          phone: phone.trim(),
          notes: notes.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setErrorMessage(payload.error || 'Unable to confirm reservation. Please try again.');
        return;
      }

      setConfirmed({
        code: payload.reservation?.reservationCode ?? 'KB-CONFIRMED',
        branchName: activeBranch.name,
        valetNote: activeBranch.valetNote,
        experience,
        date,
        time: timeSlot,
        guests,
        guestName: trimmedName,
        phone: phone.trim(),
        notes: notes.trim(),
      });
      await refreshAccountData(token);
    } catch {
      setErrorMessage('Network error while confirming reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reservations" className="py-16 md:py-24 border-b border-[rgba(212,175,55,0.16)]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Ledger Intro & Concierge Protocol (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="font-label text-[12px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37] mb-3">
                Table Ledger
              </p>
              <h2
                className="font-display text-3xl md:text-[40px] font-semibold text-[#F8F5F0] leading-[1.15] mb-4"
                style={{ textWrap: 'balance' }}
              >
                Reserve an Evening Seating
              </h2>
              <p className="text-[15px] leading-[1.7] text-[#A39E93]">
                Our dining rooms operate strictly by evening seating so every copper handi dum-seal and bone marrow reduction reaches your table at exact temperature.
              </p>
            </div>

            <div className="pt-6 border-t border-[rgba(212,175,55,0.16)] space-y-4">
              <div>
                <p className="font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                  Selected Enclave
                </p>
                <p className="font-display text-lg text-[#F8F5F0] mt-1">{activeBranch.name}</p>
                <p className="text-[14px] text-[#A39E93] mt-0.5">{activeBranch.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                    Service Hours
                  </p>
                  <p className="text-[14px] text-[#F8F5F0] tabular-nums mt-1">{activeBranch.hours}</p>
                </div>
                <div>
                  <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                    Direct Desk
                  </p>
                  <p className="text-[14px] text-[#F3E5AB] tabular-nums mt-1">{activeBranch.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Reservation Form / Confirmation Folio (7 cols) */}
          <div className="lg:col-span-7 bg-[#141414] border border-[rgba(212,175,55,0.24)] rounded p-6 sm:p-8 lg:p-10">
            {confirmed ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-[rgba(212,175,55,0.18)]">
                  <div>
                    <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-label text-[11px] font-semibold uppercase tracking-[0.14em]">
                        Reservation Confirmed
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#F8F5F0]">
                      Folio {confirmed.code}
                    </h3>
                  </div>
                  <span className="font-label text-[12px] font-semibold uppercase tracking-[0.12em] text-[#F3E5AB] tabular-nums">
                    {confirmed.guests} {confirmed.guests === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[14px]">
                  <div>
                    <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                      Enclave &amp; Setting
                    </p>
                    <p className="text-[#F8F5F0] font-medium mt-1">{confirmed.branchName}</p>
                    <p className="text-[#D4AF37] mt-0.5">{confirmed.experience}</p>
                  </div>
                  <div>
                    <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                      Date &amp; Seating
                    </p>
                    <p className="text-[#F8F5F0] font-medium tabular-nums mt-1">
                      {confirmed.date} at {confirmed.time}
                    </p>
                    <p className="text-[#A39E93] mt-0.5">{confirmed.valetNote}</p>
                  </div>
                  <div>
                    <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                      Primary Guest
                    </p>
                    <p className="text-[#F8F5F0] font-medium mt-1">{confirmed.guestName}</p>
                    <p className="text-[#A39E93] tabular-nums mt-0.5">{confirmed.phone}</p>
                  </div>
                  {confirmed.notes && (
                    <div>
                      <p className="font-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A39E93]">
                        Concierge Notes
                      </p>
                      <p className="text-[#D0C5AF] mt-1">{confirmed.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setConfirmed(null)}
                    className="btn-atelier-outline font-label text-[11px] font-semibold uppercase tracking-[0.12em] px-6 py-3 rounded cursor-pointer"
                  >
                    Modify or Book Another Seating
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Google Account Bar */}
                <div className="p-4 rounded bg-[#0A0A0A] border border-[rgba(212,175,55,0.22)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {user ? (
                    <>
                      <div className="min-w-0">
                        <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                          Signed In with Google
                        </p>
                        <p className="text-[13px] text-[#F8F5F0] truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={signOutUser}
                        className="btn-atelier-outline inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded font-label text-[10px] font-semibold uppercase tracking-[0.1em] shrink-0 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="font-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                          Guest Account Required
                        </p>
                        <p className="text-[13px] text-[#A39E93] mt-0.5">
                          Sign in with Google to confirm and track your table reservation.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="btn-imperial-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded font-label text-[11px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in with Google</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-3">
                    01. Select Flagship Enclave
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BRANCHES.map((branch) => {
                      const active = branch.id === selectedBranch;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => onSelectBranch(branch.id)}
                          className={`px-4 py-3 rounded text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#D4AF37]/15 border border-[#D4AF37] text-[#F8F5F0]'
                              : 'bg-[#0A0A0A] border border-[rgba(212,175,55,0.2)] text-[#A39E93] hover:text-[#F8F5F0]'
                          }`}
                        >
                          <div className="font-label text-[11px] font-semibold uppercase tracking-[0.1em]">
                            {branch.shortLabel}
                          </div>
                          <div className="text-[12px] text-[#A39E93] mt-0.5 truncate">
                            {branch.district.split(',')[0]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Experience & Party Size */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  <div className="sm:col-span-8">
                    <label
                      htmlFor="res-experience"
                      className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2"
                    >
                      02. Dining Setting
                    </label>
                    <select
                      id="res-experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value as DiningExperience)}
                      className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-4 py-3 text-[14px] text-[#F8F5F0] outline-none"
                    >
                      {EXPERIENCES.map((exp) => (
                        <option key={exp} value={exp} className="bg-[#141414] text-[#F8F5F0]">
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <span className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2">
                      Guests
                    </span>
                    <div className="flex items-center justify-between bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] rounded px-3 py-2">
                      <button
                        type="button"
                        aria-label="Decrease guests"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="p-1.5 text-[#A39E93] hover:text-[#F8F5F0] cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-display text-lg font-semibold text-[#F8F5F0] tabular-nums">
                        {guests}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase guests"
                        onClick={() => setGuests((g) => Math.min(16, g + 1))}
                        className="p-1.5 text-[#A39E93] hover:text-[#F8F5F0] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date & Evening Seating Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="res-date"
                      className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2"
                    >
                      03. Evening Date
                    </label>
                    <div className="relative">
                      <input
                        id="res-date"
                        type="date"
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-4 py-3 text-[14px] text-[#F8F5F0] tabular-nums outline-none [color-scheme:dark]"
                      />
                      <Calendar className="w-4 h-4 text-[#D4AF37] pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 hidden" />
                    </div>
                  </div>

                  <div className="sm:col-span-7">
                    <span className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2">
                      Seating Time
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {EVENING_SLOTS.map((slot) => {
                        const active = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTimeSlot(slot)}
                            className={`py-3 rounded font-label text-[12px] font-semibold tabular-nums transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#D4AF37] text-[#0A0A0A]'
                                : 'bg-[#0A0A0A] border border-[rgba(212,175,55,0.22)] text-[#A39E93] hover:text-[#F8F5F0]'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="res-name"
                      className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2"
                    >
                      Guest Name
                    </label>
                    <input
                      id="res-name"
                      type="text"
                      placeholder="e.g. Zainab Mansoor"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-4 py-3 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="res-phone"
                      className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2"
                    >
                      Mobile Concierge Number
                    </label>
                    <input
                      id="res-phone"
                      type="tel"
                      placeholder="+92 300 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-4 py-3 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 tabular-nums outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="res-notes"
                    className="block font-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#A39E93] mb-2"
                  >
                    Dietary Preferences or Occasion Notes
                  </label>
                  <input
                    id="res-notes"
                    type="text"
                    placeholder="Allergies, anniversary plating, or chauffeur staging instructions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[rgba(212,175,55,0.25)] focus:border-[#D4AF37] rounded px-4 py-3 text-[14px] text-[#F8F5F0] placeholder:text-[#A39E93]/60 outline-none"
                  />
                </div>

                {(authError || errorMessage) && (
                  <div
                    role="alert"
                    className="p-3.5 rounded bg-[#2A1215] border border-[rgba(255,180,171,0.35)] text-[13px] text-[#FFB4AB]"
                  >
                    {authError || errorMessage}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-[12px] text-[#A39E93]">
                    {user
                      ? `Booking as ${user.email}`
                      : 'Sign in with Google above or click below · No deposit required.'}
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-imperial-gold font-label text-[12px] font-semibold uppercase tracking-[0.12em] px-8 py-3.5 rounded whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {submitting
                      ? 'Confirming...'
                      : user
                        ? 'Confirm Reservation'
                        : 'Sign in & Confirm'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
