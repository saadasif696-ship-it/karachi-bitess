import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface CustomerOrderRecord {
  id: number;
  orderCode: string;
  branchId: string;
  branchLabel: string;
  itemsSummary: string;
  totalPkr: number;
  status: string;
  fulfillment: string;
  createdAt: string;
}

export interface CustomerReservationRecord {
  id: number;
  reservationCode: string;
  branchId: string;
  branchName: string;
  experience: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  guestName: string;
  status: string;
}

interface AuthContextValue {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  authError: string;
  myOrders: CustomerOrderRecord[];
  myReservations: CustomerReservationRecord[];
  signInWithGoogle: () => Promise<string | null>;
  signOutUser: () => Promise<void>;
  refreshAccountData: (tokenOverride?: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [myOrders, setMyOrders] = useState<CustomerOrderRecord[]>([]);
  const [myReservations, setMyReservations] = useState<CustomerReservationRecord[]>([]);

  const refreshAccountData = useCallback(
    async (tokenOverride?: string | null) => {
      const token = tokenOverride ?? idToken;
      if (!token) return;
      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setMyOrders(Array.isArray(data.orders) ? data.orders : []);
        setMyReservations(Array.isArray(data.reservations) ? data.reservations : []);
      } catch {
        // Silent background sync error; component actions handle explicit feedback
      }
    },
    [idToken]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const token = await nextUser.getIdToken();
          setIdToken(token);
          await refreshAccountData(token);
        } catch {
          setIdToken(null);
        }
      } else {
        setIdToken(null);
        setMyOrders([]);
        setMyReservations([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [refreshAccountData]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdToken(token);
      await refreshAccountData(token);
      return token;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      let message =
        error instanceof Error ? error.message : 'Unable to complete Google sign-in.';

      if (code === 'auth/popup-blocked') {
        message =
          'Google Sign-In popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        message = 'Google Sign-In was closed before completing login. Please try again.';
      } else if (code === 'auth/unauthorized-domain') {
        message = `Domain "${window.location.hostname}" is not authorized in Firebase Authentication yet. Add it in Firebase Console → Authentication → Settings → Authorized domains.`;
      }

      setAuthError(message);
      return null;
    }
  }, [refreshAccountData]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    setIdToken(null);
    setMyOrders([]);
    setMyReservations([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        loading,
        authError,
        myOrders,
        myReservations,
        signInWithGoogle,
        signOutUser,
        refreshAccountData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
