import { Router } from 'express';
import Maintenance from '../models/Maintenance.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await Maintenance.find(filter)
      .populate('propertyId', 'name area address')
      .sort({ createdAt: -1 })
      .lean();

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const all = await Maintenance.find({}).lean();
    const open = all.filter(t => t.status === 'open').length;
    const inProgress = all.filter(t => t.status === 'in_progress').length;
    const resolved = all.filter(t => t.status === 'resolved').length;

    const resolvedTickets = all.filter(t => t.status === 'resolved' && t.responseTimeHrs != null);
    const avgResponseTime = resolvedTickets.length > 0
      ? (resolvedTickets.reduce((s, t) => s + t.responseTimeHrs, 0) / resolvedTickets.length).toFixed(1)
      : 0;

    const withinSla = resolvedTickets.filter(t => {
      if (t.priority === 'emergency') return t.responseTimeHrs <= 4;
      return t.responseTimeHrs <= 24;
    }).length;
    const slaCompliance = resolvedTickets.length > 0
      ? ((withinSla / resolvedTickets.length) * 100).toFixed(1) : 100;

    const totalCost = all.reduce((s, t) => s + (t.cost || 0), 0);

    // Category breakdown
    const categoryBreakdown = {};
    all.forEach(t => {
      if (!categoryBreakdown[t.category]) categoryBreakdown[t.category] = { count: 0, cost: 0, avgResponse: [] };
      categoryBreakdown[t.category].count++;
      categoryBreakdown[t.category].cost += t.cost || 0;
      if (t.responseTimeHrs) categoryBreakdown[t.category].avgResponse.push(t.responseTimeHrs);
    });
    const categories = Object.entries(categoryBreakdown).map(([cat, d]) => ({
      category: cat,
      count: d.count,
      cost: d.cost,
      avgResponseHrs: d.avgResponse.length > 0
        ? +(d.avgResponse.reduce((s, v) => s + v, 0) / d.avgResponse.length).toFixed(1)
        : 0,
    }));

    res.json({ open, inProgress, resolved, avgResponseTime: +avgResponseTime, slaCompliance: +slaCompliance, totalCost, categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
