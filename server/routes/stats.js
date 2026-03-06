import { Router } from 'express';
import Property from '../models/Property.js';
import Transaction from '../models/Transaction.js';
import Maintenance from '../models/Maintenance.js';
import Broker from '../models/Broker.js';

const router = Router();

router.get('/overview', async (req, res) => {
  try {
    const [properties, totalProps] = await Promise.all([
      Property.find({}).lean(),
      Property.countDocuments(),
    ]);

    const occupied = properties.filter(p => p.status === 'occupied').length;
    const vacant = properties.filter(p => p.status === 'vacant').length;
    const maintenance = properties.filter(p => p.status === 'maintenance').length;
    const occupancyRate = totalProps > 0 ? ((occupied / totalProps) * 100).toFixed(1) : 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTx = await Transaction.find({
      type: 'rent_collected',
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    const monthlyRevenue = monthlyTx.reduce((sum, t) => sum + t.amount, 0);
    const paidCount = monthlyTx.filter(t => t.status === 'paid').length;
    const collectionRate = monthlyTx.length > 0 ? ((paidCount / monthlyTx.length) * 100).toFixed(1) : 100;

    const totalRevenue = (await Transaction.aggregate([
      { $match: { type: 'rent_collected', status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]))[0]?.total || 0;

    const openTickets = await Maintenance.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const activeBrokers = await Broker.countDocuments({ status: 'active' });

    // Recent activity
    const recentTx = await Transaction.find({}).sort({ date: -1 }).limit(5).populate('propertyId', 'name area').lean();
    const recentMaint = await Maintenance.find({}).sort({ createdAt: -1 }).limit(5).populate('propertyId', 'name area').lean();

    const activity = [
      ...recentTx.map(t => ({
        type: t.type,
        description: t.description,
        property: t.propertyId?.name,
        amount: t.amount,
        date: t.date,
        status: t.status,
      })),
      ...recentMaint.map(m => ({
        type: 'maintenance',
        description: m.description,
        property: m.propertyId?.name,
        amount: m.cost,
        date: m.createdAt,
        status: m.status,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      totalProperties: totalProps,
      occupied, vacant, maintenance,
      occupancyRate: +occupancyRate,
      monthlyRevenue,
      totalRevenue,
      collectionRate: +collectionRate,
      openTickets,
      activeBrokers,
      activity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/revenue-trend', async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: d,
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      });
    }

    const data = await Promise.all(months.map(async (m) => {
      const [revenue, expenses] = await Promise.all([
        Transaction.aggregate([
          { $match: { type: 'rent_collected', status: 'paid', date: { $gte: m.start, $lte: m.end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          { $match: { type: 'maintenance_expense', date: { $gte: m.start, $lte: m.end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);
      return {
        month: m.label,
        revenue: revenue[0]?.total || 0,
        expenses: expenses[0]?.total || 0,
      };
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
