import { Router } from 'express';
import Broker from '../models/Broker.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const brokers = await Broker.find({}).sort({ propertiesReferred: -1 }).lean();
    res.json(brokers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const brokers = await Broker.find({}).lean();
    const active = brokers.filter(b => b.status === 'active').length;
    const totalReferred = brokers.reduce((s, b) => s + b.propertiesReferred, 0);
    const totalEarnings = brokers.reduce((s, b) => s + b.monthlyEarnings.reduce((ss, e) => ss + e.amount, 0), 0);

    // Monthly trend (aggregate across all brokers)
    const monthlyTrend = {};
    brokers.forEach(b => {
      b.monthlyEarnings.forEach(e => {
        if (!monthlyTrend[e.month]) monthlyTrend[e.month] = 0;
        monthlyTrend[e.month] += e.amount;
      });
    });
    const trend = Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => {
        const d = new Date(month + '-01');
        return { month: d.toLocaleString('default', { month: 'short', year: '2-digit' }), amount };
      });

    res.json({ active, totalReferred, totalEarnings, trend });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
