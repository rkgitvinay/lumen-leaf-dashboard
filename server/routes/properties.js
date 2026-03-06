import { Router } from 'express';
import Property from '../models/Property.js';
import Transaction from '../models/Transaction.js';
import Maintenance from '../models/Maintenance.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { area, status, type, search } = req.query;
    const filter = {};
    if (area) filter.area = area;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { tenantName: { $regex: search, $options: 'i' } },
      ];
    }

    const properties = await Property.find(filter)
      .populate('referredBy', 'name area')
      .sort({ managedSince: -1 })
      .lean();

    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('referredBy', 'name area partnerModel')
      .lean();
    if (!property) return res.status(404).json({ error: 'Not found' });

    const [transactions, tickets] = await Promise.all([
      Transaction.find({ propertyId: property._id }).sort({ date: -1 }).lean(),
      Maintenance.find({ propertyId: property._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const totalCollected = transactions
      .filter(t => t.type === 'rent_collected' && t.status === 'paid')
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'maintenance_expense')
      .reduce((s, t) => s + t.amount, 0);

    res.json({
      ...property,
      transactions,
      maintenanceTickets: tickets,
      financials: { totalCollected, totalExpenses, net: totalCollected - totalExpenses },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
