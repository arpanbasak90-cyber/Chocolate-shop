import { db } from '../services/database.js';

export async function getDashboardStats(req, res) {
  try {
    const stats = await db.getAdminStats();
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
}

export async function getAdminOrders(req, res) {
  try {
    const { status, search } = req.query;
    const orders = await db.getAllOrders({ status, search });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error('Error in getAdminOrders:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
}

export async function getAdminCustomers(req, res) {
  try {
    const customers = await db.getAllCustomers();
    return res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    console.error('Error in getAdminCustomers:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customer accounts.' });
  }
}

export async function getRevenueAnalytics(req, res) {
  try {
    const orders = await db.getAllOrders();
    const paidOrders = orders.filter(o =>
      o.paymentStatus === 'Paid' ||
      (o.paymentMethod === 'COD' && o.orderStatus === 'Delivered')
    );

    const totalCollected = paidOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const onlineCollected = paidOrders
      .filter(o => o.paymentMethod === 'RAZORPAY' || o.paymentMethod === 'UPI')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const codCollected = paidOrders
      .filter(o => o.paymentMethod === 'COD')
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return res.status(200).json({
      success: true,
      report: {
        totalCollected,
        onlineCollected,
        codCollected,
        paidOrdersCount: paidOrders.length,
        recentPaidTransactions: paidOrders.slice(0, 20).map(o => ({
          orderId: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name,
          amount: o.grandTotal,
          paymentMethod: o.paymentMethod,
          date: o.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to compile revenue report.' });
  }
}

export async function getStoreSettings(req, res) {
  try {
    const settings = await db.getSettings();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
}

export async function updateStoreSettings(req, res) {
  try {
    const updated = await db.updateSettings(req.body);
    return res.status(200).json({ success: true, message: 'Store settings updated.', settings: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}
