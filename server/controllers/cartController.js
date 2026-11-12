import { db } from '../services/database.js';

export const PROMO_RULES = {
  'SWEET10': { type: 'PERCENT', value: 10, minOrder: 500, label: '10% off orders above ₹500' },
  'ZORA100': { type: 'FLAT', value: 100, minOrder: 1000, label: '₹100 flat off orders above ₹1000' },
  'FESTIVE15': { type: 'PERCENT', value: 15, minOrder: 1500, label: '15% off festive orders above ₹1500' }
};

/**
 * Server-Side Price & Totals Verification
 * Never trust prices or totals submitted by the client browser!
 */
export async function calculateVerifiedCart(items, promoCode = '') {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of (items || [])) {
    const productId = item.productId || item.id;
    const product = await db.getProductByIdOrSlug(productId);

    if (!product) {
      throw new Error(`Product with ID "${productId}" not found in store catalog.`);
    }
    if (!product.isAvailable) {
      throw new Error(`"${product.name}" is currently out of stock.`);
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const isPiece = item.packageType === 'piece';
    const unitPrice = isPiece ? product.piecePrice : product.boxPrice;
    const itemTotal = unitPrice * qty;

    subtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      packageType: isPiece ? 'piece' : 'pack250g',
      packageName: isPiece ? 'Per Piece' : '250g Box',
      price: unitPrice,
      quantity: qty,
      total: itemTotal,
      image: product.image
    });
  }

  // Delivery fee rule: Free delivery above ₹500, else ₹40
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 40;

  // Promo discount verification
  let discount = 0;
  let appliedPromo = null;
  const cleanPromo = (promoCode || '').trim().toUpperCase();

  if (cleanPromo && PROMO_RULES[cleanPromo]) {
    const rule = PROMO_RULES[cleanPromo];
    if (subtotal >= rule.minOrder) {
      if (rule.type === 'PERCENT') {
        discount = Math.round((subtotal * rule.value) / 100);
      } else if (rule.type === 'FLAT') {
        discount = rule.value;
      }
      appliedPromo = { code: cleanPromo, label: rule.label, discount };
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  return {
    verifiedItems,
    subtotal,
    deliveryFee,
    discount,
    appliedPromo,
    grandTotal
  };
}

/**
 * POST /api/cart/verify
 * Allows frontend to display verified calculations from the server
 */
export async function verifyCartEndpoint(req, res) {
  try {
    const { items, promoCode } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({
        success: true,
        breakdown: {
          verifiedItems: [],
          subtotal: 0,
          deliveryFee: 0,
          discount: 0,
          grandTotal: 0
        }
      });
    }

    const breakdown = await calculateVerifiedCart(items, promoCode);
    return res.status(200).json({ success: true, breakdown });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

