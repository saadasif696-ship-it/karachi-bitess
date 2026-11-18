import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const STAFF_PASSKEY = process.env.STAFF_PORTAL_PASSKEY || 'saadasif0098';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sign in with Google to continue.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }
};

export const requireStaffAuth = (req: Request, res: Response, next: NextFunction) => {
  const passkey = req.headers['x-staff-passkey'];
  if (typeof passkey !== 'string' || passkey !== STAFF_PASSKEY) {
    res.status(401).json({ error: 'Invalid Credentials. Access Denied.' });
    return;
  }
  next();
};
