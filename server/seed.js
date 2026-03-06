import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Property from './models/Property.js';
import Transaction from './models/Transaction.js';
import Maintenance from './models/Maintenance.js';
import Broker from './models/Broker.js';
import User from './models/User.js';

dotenv.config();

// Deterministic pseudo-random using a simple seed
let _seed = 42;
function rand() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Names ───
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Neha', 'Suresh', 'Kavita', 'Arun', 'Meena', 'Deepak', 'Anita', 'Manoj', 'Ritu', 'Sanjay', 'Pooja', 'Rakesh', 'Shweta', 'Naveen', 'Geeta', 'Rahul', 'Simran', 'Ashok', 'Nidhi', 'Vijay', 'Pallavi', 'Rohit', 'Divya', 'Harish', 'Komal', 'Pankaj', 'Swati', 'Gaurav', 'Isha', 'Nikhil', 'Sakshi', 'Varun', 'Tanvi', 'Ajay', 'Megha', 'Kunal', 'Rashi', 'Tarun', 'Shruti', 'Mohit', 'Aditi', 'Karan', 'Bhavna', 'Sumit', 'Jyoti', 'Arjun', 'Sneha', 'Dev', 'Mansi'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Agarwal', 'Jain', 'Mehta', 'Kapoor', 'Malhotra', 'Bansal', 'Arora', 'Sethi', 'Bhatia', 'Khanna', 'Rastogi', 'Saxena', 'Dhawan', 'Tiwari', 'Chawla', 'Goyal', 'Mittal', 'Yadav', 'Pandit', 'Chauhan', 'Reddy', 'Nair', 'Iyer'];
function fullName() { return `${pick(firstNames)} ${pick(lastNames)}`; }
function phone() { return `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`; }
function email(name) { return `${name.toLowerCase().replace(/\s/g, '.')}${randInt(1,99)}@gmail.com`; }

// ─── Vendors ───
const vendors = [
  'QuickFix Services', 'NCR Home Solutions', 'Sharma Plumbing Works', 'Bright Spark Electricals',
  'CleanPro Services', 'Capital Maintenance Co.', 'HomeCare NCR', 'Reliable Repairs',
  'UrbanFix Solutions', 'PrimeServ Facility Mgmt',
];

// ─── Property Definitions ───
const propertyDefs = [
  // Gurgaon — 18 properties
  { area: 'Gurgaon', address: 'Tower B, DLF Phase 1, Sector 26', type: '3BHK', rent: 65000, size: 1800 },
  { area: 'Gurgaon', address: 'Palm Drive, Golf Course Road', type: '3BHK', rent: 78000, size: 2200 },
  { area: 'Gurgaon', address: 'Unitech Close South, Sector 50', type: '2BHK', rent: 42000, size: 1200 },
  { area: 'Gurgaon', address: 'Emerald Hills, Sector 65', type: '3BHK', rent: 55000, size: 1650 },
  { area: 'Gurgaon', address: 'Mapsko Royal Ville, Sector 82', type: '2BHK', rent: 28000, size: 1050 },
  { area: 'Gurgaon', address: 'Bestech Park View Spa, Sector 47', type: '2BHK', rent: 38000, size: 1150 },
  { area: 'Gurgaon', address: 'BPTP Park Serene, Sector 37D', type: '2BHK', rent: 25000, size: 980 },
  { area: 'Gurgaon', address: 'DLF Aralias, Golf Links', type: '3BHK', rent: 80000, size: 2500 },
  { area: 'Gurgaon', address: 'Vatika City, Sector 49', type: '2BHK', rent: 35000, size: 1100 },
  { area: 'Gurgaon', address: 'Sohna Road, Tulip Violet', type: '2BHK', rent: 26000, size: 1000 },
  { area: 'Gurgaon', address: 'Chintels Paradiso, Sector 109', type: '3BHK', rent: 48000, size: 1500 },
  { area: 'Gurgaon', address: 'M3M Merlin, Sector 67', type: '1BHK', rent: 22000, size: 650 },
  { area: 'Gurgaon', address: 'SS Hibiscus, Sector 50', type: '3BHK', rent: 52000, size: 1600 },
  { area: 'Gurgaon', address: 'Orchid Petals, Sector 49', type: '2BHK', rent: 33000, size: 1080 },
  { area: 'Gurgaon', address: 'Pioneer Urban, Sector 62', type: '1BHK', rent: 18000, size: 580 },
  { area: 'Gurgaon', address: 'DLF Phase 3, Nathupur', type: '2BHK', rent: 40000, size: 1200 },
  { area: 'Gurgaon', address: 'Microtek Greenburg, Sector 86', type: '2BHK', rent: 30000, size: 1050 },
  { area: 'Gurgaon', address: 'Ireo Grand Arch, Sector 58', type: '3BHK', rent: 60000, size: 1900 },
  // Noida — 15 properties
  { area: 'Noida', address: 'ATS Greens Village, Sector 93A', type: '3BHK', rent: 45000, size: 1500 },
  { area: 'Noida', address: 'Mahagun Moderne, Sector 78', type: '2BHK', rent: 32000, size: 1100 },
  { area: 'Noida', address: 'Supertech Capetown, Sector 74', type: '2BHK', rent: 27000, size: 1000 },
  { area: 'Noida', address: 'Amrapali Sapphire, Sector 45', type: '2BHK', rent: 25000, size: 950 },
  { area: 'Noida', address: 'Prateek Wisteria, Sector 77', type: '3BHK', rent: 40000, size: 1400 },
  { area: 'Noida', address: 'Jaypee Greens, Sector 128', type: '3BHK', rent: 50000, size: 1650 },
  { area: 'Noida', address: 'ATS Pristine, Sector 150', type: '2BHK', rent: 30000, size: 1050 },
  { area: 'Noida', address: 'Logix Blossom County, Sector 137', type: '2BHK', rent: 26000, size: 980 },
  { area: 'Noida', address: 'Antriksh Golf View, Sector 78', type: '1BHK', rent: 16000, size: 550 },
  { area: 'Noida', address: 'Stellar Jeevan, Sector 1 Noida Ext', type: '2BHK', rent: 18000, size: 900 },
  { area: 'Noida', address: 'Paramount Emotions, Sector 1 GN West', type: '2BHK', rent: 15000, size: 880 },
  { area: 'Noida', address: 'Civitech Stadia, Sector 79', type: '3BHK', rent: 42000, size: 1350 },
  { area: 'Noida', address: 'Hyde Park, Sector 78', type: '1BHK', rent: 18000, size: 600 },
  { area: 'Noida', address: 'Panchsheel Greens 2, Sector 16B', type: '2BHK', rent: 22000, size: 950 },
  { area: 'Noida', address: 'The 3C Lotus Panache, Sector 110', type: '3BHK', rent: 38000, size: 1400 },
  // Greater Noida — 8 properties
  { area: 'Greater Noida', address: 'Gaur City 1, Sector 4', type: '2BHK', rent: 16000, size: 950 },
  { area: 'Greater Noida', address: 'Gaur City 2, Sector 16C', type: '2BHK', rent: 14000, size: 900 },
  { area: 'Greater Noida', address: 'Ace Divino, Sector 1 GN West', type: '2BHK', rent: 15000, size: 920 },
  { area: 'Greater Noida', address: 'Ajnara Homes, Sector 16B', type: '1BHK', rent: 12000, size: 550 },
  { area: 'Greater Noida', address: 'Pari Chowk, Alpha 1', type: '3BHK', rent: 22000, size: 1300 },
  { area: 'Greater Noida', address: 'Eldeco Inspire, Sector 119', type: '2BHK', rent: 18000, size: 980 },
  { area: 'Greater Noida', address: 'Supertech Ecovillage 2, Sector 16B', type: '2BHK', rent: 13000, size: 870 },
  { area: 'Greater Noida', address: 'ATS Allure, Sector 22D', type: '3BHK', rent: 25000, size: 1350 },
  // Faridabad — 5 properties
  { area: 'Faridabad', address: 'BPTP Princess Park, Sector 86', type: '2BHK', rent: 20000, size: 1000 },
  { area: 'Faridabad', address: 'RPS Savana, Sector 88', type: '3BHK', rent: 28000, size: 1300 },
  { area: 'Faridabad', address: 'SRS Royal Hills, Sector 87', type: '2BHK', rent: 18000, size: 950 },
  { area: 'Faridabad', address: 'Omaxe Heights, Sector 86', type: '1BHK', rent: 14000, size: 560 },
  { area: 'Faridabad', address: 'Crown Interiorz Mall Area, Sector 35', type: '2BHK', rent: 22000, size: 1050 },
  // Ghaziabad — 4 properties
  { area: 'Ghaziabad', address: 'Mahagun Mywoods, Sector 16C', type: '2BHK', rent: 17000, size: 950 },
  { area: 'Ghaziabad', address: 'Indirapuram, Ahinsa Khand 2', type: '3BHK', rent: 32000, size: 1400 },
  { area: 'Ghaziabad', address: 'Vaishali, Sector 4', type: '2BHK', rent: 22000, size: 1000 },
  { area: 'Ghaziabad', address: 'Crossings Republik, GH-03', type: '2BHK', rent: 14000, size: 900 },
];

// ─── Broker Definitions ───
const brokerDefs = [
  { name: 'Rajendra Arora', area: 'Gurgaon — DLF / Golf Course', model: 'revenue_share', sharePercent: 25 },
  { name: 'Pawan Sethi', area: 'Gurgaon — Sohna Road / New Gurgaon', model: 'revenue_share', sharePercent: 20 },
  { name: 'Meenakshi Kapoor', area: 'Noida — Sector 75-150', model: 'area_partner', sharePercent: 30 },
  { name: 'Sanjiv Malhotra', area: 'Noida — Sector 44-78', model: 'revenue_share', sharePercent: 25 },
  { name: 'Anil Bansal', area: 'Greater Noida — Gaur City', model: 'referral', sharePercent: 0 },
  { name: 'Rekha Goyal', area: 'Faridabad — Sector 80-90', model: 'referral', sharePercent: 0 },
  { name: 'Dinesh Tiwari', area: 'Ghaziabad — Indirapuram', model: 'revenue_share', sharePercent: 25 },
  { name: 'Harpreet Chawla', area: 'Gurgaon — Sector 47-67', model: 'area_partner', sharePercent: 30 },
  { name: 'Nitin Rastogi', area: 'Noida Expressway', model: 'revenue_share', sharePercent: 20 },
];

const ownerTypes = ['NRI', 'Investor', 'Professional', 'Senior Citizen'];
const categories = ['plumbing', 'electrical', 'appliance', 'painting', 'carpentry', 'cleaning'];
const categoryWeights = [30, 25, 18, 10, 9, 8];
const priorities = ['emergency', 'high', 'medium', 'low'];
const priorityWeights = [5, 15, 50, 30];

function weightedPick(items, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

const maintenanceDescs = {
  plumbing: ['Kitchen sink leak repair', 'Bathroom tap replacement', 'Water heater leak fix', 'Toilet flush mechanism repair', 'Pipe joint sealing', 'Drain blockage clearing'],
  electrical: ['Switchboard replacement', 'MCB tripping issue', 'Fan regulator repair', 'Wiring insulation check', 'Geyser electrical fault', 'Light fixture replacement'],
  appliance: ['AC gas refill and service', 'Washing machine drain issue', 'Refrigerator compressor check', 'RO water purifier service', 'Microwave door latch repair', 'Chimney motor replacement'],
  painting: ['Living room wall touch-up', 'Bedroom ceiling patch paint', 'Bathroom waterproof coating', 'Balcony railing repaint', 'Full flat repainting'],
  carpentry: ['Wardrobe door hinge repair', 'Kitchen cabinet shelf fix', 'Door lock replacement', 'Window latch repair', 'Bed frame support fix'],
  cleaning: ['Deep cleaning — full flat', 'Post-painting cleanup', 'Bathroom deep clean', 'Kitchen exhaust and chimney clean', 'Balcony and window cleaning'],
};

// ─── Main Seed ───
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear
  await Promise.all([
    Property.deleteMany({}), Transaction.deleteMany({}),
    Maintenance.deleteMany({}), Broker.deleteMany({}), User.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Users
  const hash = await bcrypt.hash('demo2025', 10);
  await User.create({ email: 'admin@lumenleaf.com', passwordHash: hash, name: 'Admin', role: 'admin' });
  console.log('Admin user created');

  // Brokers
  const now = new Date();
  const months12 = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const brokers = [];
  for (const bd of brokerDefs) {
    const joinMonth = randInt(0, 6);
    const monthlyEarnings = months12.map((m, idx) => ({
      month: m,
      amount: idx < joinMonth ? 0 : (bd.model === 'referral' ? randInt(2000, 5000) * (idx < joinMonth + 1 ? 1 : 0) : randInt(400, 2500)),
    }));
    const broker = await Broker.create({
      name: bd.name,
      phone: phone(),
      email: email(bd.name),
      area: bd.area,
      partnerModel: bd.model,
      revenueSharePercent: bd.sharePercent,
      propertiesReferred: 0,
      monthlyEarnings,
      joinedAt: new Date(now.getFullYear(), now.getMonth() - 11 + joinMonth, randInt(1, 28)),
      status: 'active',
    });
    brokers.push(broker);
  }
  console.log(`${brokers.length} brokers created`);

  // Properties
  const statusDist = [
    ...Array(46).fill('occupied'),
    ...Array(3).fill('vacant'),
    ...Array(1).fill('maintenance'),
  ];
  const shuffledStatuses = shuffle(statusDist);

  const properties = [];
  for (let i = 0; i < propertyDefs.length; i++) {
    const def = propertyDefs[i];
    const status = shuffledStatuses[i];
    const ownerType = pick(ownerTypes);
    const managedMonthsAgo = randInt(3, 14);
    const managedSince = new Date(now.getFullYear(), now.getMonth() - managedMonthsAgo, randInt(1, 28));
    const referredBroker = rand() < 0.6 ? pick(brokers) : null;

    const moveInDate = status !== 'vacant'
      ? new Date(now.getFullYear(), now.getMonth() - randInt(2, 11), randInt(1, 28))
      : null;
    const leaseEnd = moveInDate
      ? new Date(moveInDate.getFullYear() + 1, moveInDate.getMonth(), moveInDate.getDate())
      : null;

    const oName = fullName();
    const tName = status !== 'vacant' ? fullName() : null;

    const prop = await Property.create({
      name: `${def.type} — ${def.area} ${def.address.split(',')[0]}`,
      address: def.address,
      area: def.area,
      type: def.type,
      sizeSqft: def.size,
      monthlyRent: def.rent,
      securityDeposit: def.rent * 2,
      status,
      ownerName: oName,
      ownerPhone: phone(),
      ownerEmail: email(oName),
      ownerType,
      tenantName: tName,
      tenantPhone: tName ? phone() : null,
      tenantEmail: tName ? email(tName) : null,
      moveInDate,
      leaseEnd,
      verificationStatus: status !== 'vacant' ? (rand() < 0.9 ? 'verified' : 'pending') : 'not_started',
      managedSince,
      referredBy: referredBroker?._id || null,
    });
    properties.push(prop);

    if (referredBroker) {
      await Broker.updateOne({ _id: referredBroker._id }, { $inc: { propertiesReferred: 1 } });
    }
  }
  console.log(`${properties.length} properties created`);

  // Transactions — 12 months of rent + expenses
  let txCount = 0;
  for (const prop of properties) {
    const managedFrom = new Date(Math.max(prop.managedSince.getTime(), new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime()));
    const startMonth = managedFrom.getMonth();
    const startYear = managedFrom.getFullYear();

    for (let m = 0; m < 12; m++) {
      const txDate = new Date(now.getFullYear(), now.getMonth() - 11 + m, randInt(1, 5));
      if (txDate < managedFrom) continue;
      if (txDate > now) continue;

      // Skip rent for vacant months
      if (prop.status === 'vacant' && m >= 10) continue;

      const isCurrentMonth = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      let status = 'paid';
      if (isCurrentMonth && rand() < 0.15) status = 'pending';
      else if (rand() < 0.03) status = 'overdue';

      await Transaction.create({
        propertyId: prop._id,
        type: 'rent_collected',
        amount: prop.monthlyRent,
        status,
        date: txDate,
        description: `Rent — ${txDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      });
      txCount++;

      // Occasional maintenance expense
      if (rand() < 0.15) {
        const cat = weightedPick(categories, categoryWeights);
        const cost = randInt(500, 8000);
        await Transaction.create({
          propertyId: prop._id,
          type: 'maintenance_expense',
          amount: cost,
          status: 'paid',
          date: new Date(txDate.getFullYear(), txDate.getMonth(), randInt(5, 25)),
          description: pick(maintenanceDescs[cat]),
        });
        txCount++;
      }
    }

    // Placement fee for occupied properties
    if (prop.status !== 'vacant' && prop.moveInDate) {
      await Transaction.create({
        propertyId: prop._id,
        type: 'placement_fee',
        amount: randInt(8000, 15000),
        status: 'paid',
        date: prop.moveInDate,
        description: 'Tenant placement fee',
      });
      txCount++;
    }
  }
  console.log(`${txCount} transactions created`);

  // Maintenance tickets
  let maintCount = 0;
  for (const prop of properties) {
    const numTickets = randInt(1, 5);
    for (let t = 0; t < numTickets; t++) {
      const category = weightedPick(categories, categoryWeights);
      const priority = weightedPick(priorities, priorityWeights);
      const createdAt = new Date(now.getFullYear(), now.getMonth() - randInt(0, 10), randInt(1, 28));
      const isRecent = (now - createdAt) < 14 * 24 * 60 * 60 * 1000;
      let status, resolvedAt, responseTimeHrs;

      if (isRecent && rand() < 0.3) {
        status = 'open';
        resolvedAt = null;
        responseTimeHrs = null;
      } else if (isRecent && rand() < 0.3) {
        status = 'in_progress';
        resolvedAt = null;
        responseTimeHrs = priority === 'emergency' ? randInt(1, 4) : randInt(4, 24);
      } else {
        status = 'resolved';
        const resolutionDays = priority === 'emergency' ? randInt(0, 1) : priority === 'high' ? randInt(1, 3) : randInt(1, 7);
        resolvedAt = new Date(createdAt.getTime() + resolutionDays * 24 * 60 * 60 * 1000);
        responseTimeHrs = priority === 'emergency' ? randInt(1, 5) : priority === 'high' ? randInt(4, 24) : randInt(8, 48);
      }

      const cost = status === 'resolved' ? randInt(300, 12000) : 0;

      await Maintenance.create({
        propertyId: prop._id,
        category,
        priority,
        status,
        description: pick(maintenanceDescs[category]),
        vendor: pick(vendors),
        cost,
        responseTimeHrs,
        resolvedAt,
        createdAt,
      });
      maintCount++;
    }
  }
  console.log(`${maintCount} maintenance tickets created`);

  // Update broker monthly earnings with actual data
  for (const broker of brokers) {
    const referredProps = properties.filter(p => p.referredBy?.toString() === broker._id.toString());
    if (referredProps.length === 0 || broker.partnerModel === 'referral') continue;

    const updatedEarnings = months12.map((month) => {
      let total = 0;
      for (const prop of referredProps) {
        const fee = prop.monthlyRent * 0.05;
        total += fee * (broker.revenueSharePercent / 100);
      }
      const monthDate = new Date(month + '-01');
      if (monthDate < broker.joinedAt) total = 0;
      // slight variation
      total = Math.round(total * (0.9 + rand() * 0.2));
      return { month, amount: total };
    });

    await Broker.updateOne({ _id: broker._id }, { monthlyEarnings: updatedEarnings });
  }
  console.log('Broker earnings updated');

  console.log('\n✓ Seed complete!');
  console.log(`  Properties: ${properties.length}`);
  console.log(`  Transactions: ${txCount}`);
  console.log(`  Maintenance: ${maintCount}`);
  console.log(`  Brokers: ${brokers.length}`);
  console.log(`  Login: admin@lumenleaf.com / demo2025`);
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
