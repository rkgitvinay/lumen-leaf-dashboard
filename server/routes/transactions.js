import { Router } from 'express';
import Transaction from '../models/Transaction.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { type, status, propertyId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (propertyId) filter.propertyId = propertyId;

    const transactions = await Transaction.find(filter)
      .populate('propertyId', 'name area type monthlyRent')
      .sort({ date: -1 })
      .limit(200)
      .lean();

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      months.push({ start, end, label: start.toLocaleString('default', { month: 'short', year: '2-digit' }) });
    }

    const data = await Promise.all(months.map(async (m) => {
      const txs = await Transaction.find({ date: { $gte: m.start, $lte: m.end } }).lean();
      const rent = txs.filter(t => t.type === 'rent_collected');
      const paid = rent.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
      const pending = rent.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
      const overdue = rent.filter(t => t.status === 'overdue').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'maintenance_expense').reduce((s, t) => s + t.amount, 0);
      const placement = txs.filter(t => t.type === 'placement_fee').reduce((s, t) => s + t.amount, 0);
      const collectionRate = rent.length > 0 ? ((rent.filter(t => t.status === 'paid').length / rent.length) * 100).toFixed(1) : 100;

      return { month: m.label, paid, pending, overdue, expenses, placement, collectionRate: +collectionRate };
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
