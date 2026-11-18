import 'dotenv/config';
import path from 'node:path';
import express from 'express';
import {
  createCustomerOrder,
  createCustomerReservation,
  getAllOrdersForStaff,
  getCustomerOrders,
  getCustomerReservations,
  getOrCreateUser,
  getPublicMenuCatalog,
  updateMenuItemForStaff,
  updateOrderStatusForStaff,
} from './src/db/users.ts';
import { requireAuth, requireStaffAuth, type AuthRequest } from './src/middleware/auth.ts';

const VALID_BRANCHES = new Set(['clifton', 'dha', 'tariq']);
const VALID_ORDER_STATUSES = new Set(['Pending', 'Preparing', 'Out for Delivery', 'Completed']);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Public Menu Catalog (live stock & PKR pricing from PostgreSQL)
  app.get('/api/menu', async (_req, res) => {
    try {
      const items = await getPublicMenuCatalog();
      res.json({ items });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load menu.';
      res.status(500).json({ error: message });
    }
  });

  // Authenticated Customer Profile & History
  app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email;
      if (!uid || !email) {
        res.status(401).json({ error: 'Incomplete authentication profile.' });
        return;
      }

      const dbUser = await getOrCreateUser(uid, email, req.user?.name);
      const [myOrders, myReservations] = await Promise.all([
        getCustomerOrders(uid),
        getCustomerReservations(uid),
      ]);

      res.json({ user: dbUser, orders: myOrders, reservations: myReservations });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch profile.';
      res.status(500).json({ error: message });
    }
  });

  // Authenticated Customer Order Creation
  app.post('/api/orders', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email;
      if (!uid || !email) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const { branchId, customerName, customerPhone, fulfillment, deliveryAddress, items } =
        req.body ?? {};

      if (typeof branchId !== 'string' || !VALID_BRANCHES.has(branchId)) {
        res.status(400).json({ error: 'Please select a valid Karachi Bites branch.' });
        return;
      }
      if (typeof customerName !== 'string' || customerName.trim().length < 2) {
        res.status(400).json({ error: 'Please provide recipient name.' });
        return;
      }
      if (typeof customerPhone !== 'string' || customerPhone.replace(/\D/g, '').length < 10) {
        res.status(400).json({ error: 'Please provide a valid phone number.' });
        return;
      }
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Your tasting order cannot be empty.' });
        return;
      }

      const mode = fulfillment === 'pickup' ? 'pickup' : 'delivery';
      if (mode === 'delivery' && (typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 6)) {
        res.status(400).json({ error: 'Please enter a valid delivery address.' });
        return;
      }

      const dbUser = await getOrCreateUser(uid, email, req.user?.name);
      const created = await createCustomerOrder({
        userId: dbUser.id,
        branchId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        fulfillment: mode,
        deliveryAddress: typeof deliveryAddress === 'string' ? deliveryAddress.trim() : undefined,
        items,
      });

      res.status(201).json({ order: created });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit order.';
      const status = message.includes('sold out') ? 409 : 500;
      res.status(status).json({ error: message });
    }
  });

  // Authenticated Customer Reservations
  app.post('/api/reservations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email;
      if (!uid || !email) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const { branchId, experience, date, timeSlot, guests, guestName, phone, notes } =
        req.body ?? {};

      if (typeof branchId !== 'string' || !VALID_BRANCHES.has(branchId)) {
        res.status(400).json({ error: 'Please select a valid branch.' });
        return;
      }
      if (typeof guestName !== 'string' || guestName.trim().length < 2) {
        res.status(400).json({ error: 'Please enter the primary guest name.' });
        return;
      }
      if (typeof phone !== 'string' || phone.replace(/\D/g, '').length < 10) {
        res.status(400).json({ error: 'Please provide a valid mobile number.' });
        return;
      }
      if (typeof date !== 'string' || !date) {
        res.status(400).json({ error: 'Please choose an evening date.' });
        return;
      }

      const dbUser = await getOrCreateUser(uid, email, req.user?.name);
      const created = await createCustomerReservation({
        userId: dbUser.id,
        branchId,
        experience: typeof experience === 'string' ? experience : 'Main Dining Room',
        reservationDate: date,
        timeSlot: typeof timeSlot === 'string' ? timeSlot : '20:30',
        guests: Math.max(1, Math.min(16, Number(guests) || 2)),
        guestName: guestName.trim(),
        guestPhone: phone.trim(),
        notes: typeof notes === 'string' ? notes.trim() : undefined,
      });

      res.status(201).json({ reservation: created });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to confirm reservation.';
      res.status(500).json({ error: message });
    }
  });

  // Staff Portal Authentication & Operations API
  app.post('/api/staff/verify', requireStaffAuth, (_req, res) => {
    res.json({ authenticated: true });
  });

  app.get('/api/staff/orders', requireStaffAuth, async (_req, res) => {
    try {
      const rows = await getAllOrdersForStaff();
      res.json({ orders: rows });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch orders.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/staff/orders/:orderCode/status', requireStaffAuth, async (req, res) => {
    try {
      const orderCode = decodeURIComponent(req.params.orderCode);
      const { status } = req.body ?? {};
      if (typeof status !== 'string' || !VALID_ORDER_STATUSES.has(status)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }

      const updated = await updateOrderStatusForStaff(orderCode, status);
      if (!updated) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }
      res.json({ order: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order status.';
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/staff/menu', requireStaffAuth, async (_req, res) => {
    try {
      const items = await getPublicMenuCatalog();
      res.json({ items });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load menu inventory.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/staff/menu/:menuItemId', requireStaffAuth, async (req, res) => {
    try {
      const { menuItemId } = req.params;
      const { inStock, pricePkr } = req.body ?? {};
      const patch: { inStock?: boolean; pricePkr?: number } = {};

      if (typeof inStock === 'boolean') {
        patch.inStock = inStock;
      }
      if (typeof pricePkr === 'number' && Number.isFinite(pricePkr) && pricePkr >= 100) {
        patch.pricePkr = Math.round(pricePkr);
      }

      const updated = await updateMenuItemForStaff(menuItemId, patch);
      if (!updated) {
        res.status(404).json({ error: 'Menu item not found.' });
        return;
      }
      res.json({ item: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update menu item.';
      res.status(500).json({ error: message });
    }
  });

  // Frontend Hosting (Vite dev middleware in development, static dist in production)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Karachi Bites server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Karachi Bites server:', err);
  process.exit(1);
});
