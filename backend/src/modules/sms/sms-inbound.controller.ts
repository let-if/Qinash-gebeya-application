import { Router, Request, Response } from 'express';
import prisma from '../../config/db';

const router = Router();

function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+251' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

// Inbound SMS webhook (Compatible with AfroMessage / Twilio / SMS Gateway apps)
router.post('/webhook', async (req: Request, res: Response): Promise<any> => {
  try {
    // Accommodate common gateway payload keys (from/sender/phone and text/message/body)
    const sender = req.body.from || req.body.sender || req.body.phoneNumber || req.query.from;
    const message = req.body.text || req.body.message || req.body.body || req.query.message;

    if (!sender || !message) {
      return res.status(400).json({ error: 'Sender and message body are required' });
    }

    const normalizedPhone = normalizePhone(String(sender));
    const text = String(message).trim();

    // Verify sender exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: normalizedPhone },
          { phoneNumber: String(sender) },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Unregistered sender phone' });
    }

    // Expected format: ORD#PROD_ID:QTY:UNIT,PROD_ID:QTY:UNIT#SLOT#IS_CREDIT
    // Example: ORD#p1:2:CARTON,p2:1:HALF#BATCH_6AM#0
    if (text.startsWith('ORD#')) {
      const parts = text.split('#');
      const itemsRaw = parts[1]; // "p1:2:CARTON,p2:1:HALF"
      const slotRaw = parts[2] || 'BATCH_6AM';
      const isCreditRaw = parts[3] === '1' || parts[3]?.toUpperCase() === 'CREDIT';

      const itemTokens = itemsRaw.split(',');
      let totalAmount = 0;
      const orderItemsData: any[] = [];

      for (const token of itemTokens) {
        const [productId, qtyStr, unitStr] = token.split(':');
        const quantity = parseInt(qtyStr, 10) || 1;
        const selectedUnit = unitStr === 'HALF' ? 'HALF_CARTON' : 'CARTON';

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (product) {
          const unitPrice = selectedUnit === 'HALF_CARTON' && product.priceHalfCarton
            ? Number(product.priceHalfCarton)
            : Number(product.pricePerUnit);

          totalAmount += unitPrice * quantity;
          orderItemsData.push({
            productId: product.id,
            quantity,
            selectedUnit,
            unitPrice,
          });

          // Deduct dual inventory
          const decrementCount = selectedUnit === 'HALF_CARTON' ? Math.max(1, Math.ceil(quantity * 0.5)) : quantity;
          await prisma.product.update({
            where: { id: product.id },
            data: {
              actualStock: { decrement: decrementCount },
              postedStock: { decrement: decrementCount },
              currentStock: { decrement: decrementCount },
            },
          });
        }
      }

      if (orderItemsData.length === 0) {
        return res.status(400).json({ error: 'No valid products matched payload' });
      }

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalAmount,
          deliverySlot: slotRaw === 'BATCH_12PM' ? 'BATCH_12PM' : 'BATCH_6AM',
          status: 'PENDING',
         orderSource: 'SMS' as any,
          isCreditOrder: isCreditRaw,
          creditApproved: isCreditRaw ? null : null,
          items: {
            create: orderItemsData,
          },
        },
      });

      return res.status(201).json({ success: true, message: 'Order created via SMS', orderId: order.id });
    }

    return res.status(200).json({ message: 'Non-order SMS received' });
  } catch (err: any) {
    console.error('SMS Inbound Webhook Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;