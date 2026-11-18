import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Authenticated Customers & Staff Profiles (linked via Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Karachi Bites Flagship Branches (Clifton, DHA Phase 6, Tariq Road)
export const branches = pgTable('branches', {
  id: text('id').primaryKey(), // 'clifton' | 'dha' | 'tariq'
  name: text('name').notNull(),
  shortLabel: text('short_label').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  hours: text('hours').notNull(),
});

// 3. Menu Catalog, Live Pricing & Kitchen Stock State
export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(), // e.g. 'wagyu-nihari'
  name: text('name').notNull(),
  category: text('category').notNull(),
  branchId: text('branch_id').references(() => branches.id),
  pricePkr: integer('price_pkr').notNull(),
  inStock: boolean('in_stock').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Customer Dispatch & Valet Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderCode: text('order_code').notNull().unique(), // e.g. '#KB-8492'
  userId: integer('user_id').references(() => users.id),
  branchId: text('branch_id')
    .references(() => branches.id)
    .notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  fulfillment: text('fulfillment').notNull().default('delivery'), // 'delivery' | 'pickup'
  deliveryAddress: text('delivery_address'),
  itemsSummary: text('items_summary').notNull(),
  totalPkr: integer('total_pkr').notNull(),
  status: text('status').notNull().default('Pending'), // 'Pending' | 'Preparing' | 'Out for Delivery' | 'Completed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Normalized Order Line Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  menuItemId: text('menu_item_id')
    .references(() => menuItems.id)
    .notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPricePkr: integer('unit_price_pkr').notNull(),
});

// 6. Evening Table & Seating Lounge Reservations
export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  reservationCode: text('reservation_code').notNull().unique(), // e.g. 'KB-4210'
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  branchId: text('branch_id')
    .references(() => branches.id)
    .notNull(),
  experience: text('experience').notNull(),
  reservationDate: text('reservation_date').notNull(), // YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // e.g. '20:30'
  guests: integer('guests').notNull(),
  guestName: text('guest_name').notNull(),
  guestPhone: text('guest_phone').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('Confirmed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reservations: many(reservations),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  menuItems: many(menuItems),
  orders: many(orders),
  reservations: many(reservations),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [orders.branchId],
    references: [branches.id],
  }),
  lineItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  branch: one(branches, {
    fields: [reservations.branchId],
    references: [branches.id],
  }),
}));
