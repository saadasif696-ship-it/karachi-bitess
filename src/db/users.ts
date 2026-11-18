import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { branches, menuItems, orderItems, orders, reservations, users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName ?? null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw new Error('Unable to verify user profile.', { cause: error });
  }
}

export async function getPublicMenuCatalog() {
  try {
    return await db.select().from(menuItems).orderBy(menuItems.category, menuItems.name);
  } catch (error) {
    console.error('Failed to fetch menu catalog:', error);
    throw new Error('Unable to load menu catalog.', { cause: error });
  }
}

export interface CreateOrderInput {
  userId: number;
  branchId: string;
  customerName: string;
  customerPhone: string;
  fulfillment: 'delivery' | 'pickup';
  deliveryAddress?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export async function createCustomerOrder(input: CreateOrderInput) {
  try {
    const catalog = await db.select().from(menuItems);
    const catalogMap = new Map(catalog.map((item) => [item.id, item]));

    let subtotal = 0;
    const verifiedLines: Array<{
      menuItemId: string;
      itemName: string;
      quantity: number;
      unitPricePkr: number;
    }> = [];

    for (const line of input.items) {
      const dbItem = catalogMap.get(line.menuItemId);
      if (!dbItem) {
        throw new Error(`Unknown menu item: ${line.menuItemId}`);
      }
      if (!dbItem.inStock) {
        throw new Error(`${dbItem.name} is currently sold out.`);
      }
      const qty = Math.max(1, Math.min(25, Math.floor(line.quantity)));
      subtotal += dbItem.pricePkr * qty;
      verifiedLines.push({
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        quantity: qty,
        unitPricePkr: dbItem.pricePkr,
      });
    }

    const deliveryFee = input.fulfillment === 'delivery' && subtotal < 12000 ? 650 : 0;
    const totalPkr = subtotal + deliveryFee;
    const itemsSummary = verifiedLines.map((l) => `${l.quantity}x ${l.itemName}`).join(', ');
    const orderCode = `#KB-${Math.floor(1000 + (Date.now() % 9000))}`;

    const inserted = await db
      .insert(orders)
      .values({
        orderCode,
        userId: input.userId,
        branchId: input.branchId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        fulfillment: input.fulfillment,
        deliveryAddress: input.fulfillment === 'delivery' ? input.deliveryAddress ?? null : 'Valet Pickup',
        itemsSummary,
        totalPkr,
        status: 'Pending',
      })
      .returning();

    const createdOrder = inserted[0];

    await db.insert(orderItems).values(
      verifiedLines.map((line) => ({
        orderId: createdOrder.id,
        menuItemId: line.menuItemId,
        itemName: line.itemName,
        quantity: line.quantity,
        unitPricePkr: line.unitPricePkr,
      }))
    );

    return createdOrder;
  } catch (error) {
    console.error('Failed to create order:', error);
    if (error instanceof Error && (error.message.includes('sold out') || error.message.includes('Unknown menu'))) {
      throw error;
    }
    throw new Error('Unable to record order. Please try again.', { cause: error });
  }
}

export async function getCustomerOrders(uid: string) {
  try {
    return await db
      .select({
        id: orders.id,
        orderCode: orders.orderCode,
        branchId: orders.branchId,
        branchLabel: branches.shortLabel,
        itemsSummary: orders.itemsSummary,
        totalPkr: orders.totalPkr,
        status: orders.status,
        fulfillment: orders.fulfillment,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    throw new Error('Unable to load your orders.', { cause: error });
  }
}

export interface CreateReservationInput {
  userId: number;
  branchId: string;
  experience: string;
  reservationDate: string;
  timeSlot: string;
  guests: number;
  guestName: string;
  guestPhone: string;
  notes?: string;
}

export async function createCustomerReservation(input: CreateReservationInput) {
  try {
    const reservationCode = `KB-${Math.floor(1000 + (Date.now() % 9000))}`;
    const inserted = await db
      .insert(reservations)
      .values({
        reservationCode,
        userId: input.userId,
        branchId: input.branchId,
        experience: input.experience,
        reservationDate: input.reservationDate,
        timeSlot: input.timeSlot,
        guests: input.guests,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        notes: input.notes ?? null,
        status: 'Confirmed',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create reservation:', error);
    throw new Error('Unable to confirm reservation. Please try again.', { cause: error });
  }
}

export async function getCustomerReservations(uid: string) {
  try {
    return await db
      .select({
        id: reservations.id,
        reservationCode: reservations.reservationCode,
        branchId: reservations.branchId,
        branchName: branches.name,
        experience: reservations.experience,
        reservationDate: reservations.reservationDate,
        timeSlot: reservations.timeSlot,
        guests: reservations.guests,
        guestName: reservations.guestName,
        status: reservations.status,
        createdAt: reservations.createdAt,
      })
      .from(reservations)
      .innerJoin(users, eq(reservations.userId, users.id))
      .innerJoin(branches, eq(reservations.branchId, branches.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(reservations.createdAt));
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    throw new Error('Unable to load your reservations.', { cause: error });
  }
}

export async function getAllOrdersForStaff() {
  try {
    return await db
      .select({
        id: orders.id,
        orderCode: orders.orderCode,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        branchId: orders.branchId,
        branch: branches.shortLabel,
        itemsSummary: orders.itemsSummary,
        totalPkr: orders.totalPkr,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Staff orders query failed:', error);
    throw new Error('Failed to load active orders.', { cause: error });
  }
}

export async function updateOrderStatusForStaff(orderCode: string, status: string) {
  try {
    const updated = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.orderCode, orderCode))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Staff order status update failed:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

export async function updateMenuItemForStaff(
  menuItemId: string,
  patch: { inStock?: boolean; pricePkr?: number }
) {
  try {
    const updated = await db
      .update(menuItems)
      .set({
        ...(typeof patch.inStock === 'boolean' ? { inStock: patch.inStock } : {}),
        ...(typeof patch.pricePkr === 'number' ? { pricePkr: patch.pricePkr } : {}),
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, menuItemId))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Staff menu update failed:', error);
    throw new Error('Failed to update menu item.', { cause: error });
  }
}
