# Lumen Leaf Properties — Admin Dashboard

Full-stack admin dashboard for Lumen Leaf Properties, designed as a professional demo tool for pitching property owners and broker partners. Built with React, Express, and MongoDB.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4     |
| Routing   | react-router-dom v7                 |
| Charts    | Recharts                            |
| Icons     | Lucide React                        |
| Backend   | Express.js (Node.js)                |
| Database  | MongoDB (Atlas or local)            |
| Auth      | JWT + bcryptjs                      |

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **MongoDB** — either a local instance or a MongoDB Atlas cluster

## Project Structure

```
dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Layout, MetricCard, DemoBadge
│   │   ├── context/        # AuthContext (JWT state)
│   │   ├── lib/            # api.js (fetch wrapper)
│   │   └── pages/          # 8 pages (Login → SLA)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express API
│   ├── models/             # Mongoose schemas (5 collections)
│   ├── routes/             # API route handlers
│   ├── middleware/          # JWT auth middleware
│   ├── seed.js             # Database seeder (50 properties)
│   ├── index.js            # Express entry point
│   ├── .env                # Environment variables
│   └── package.json
└── README.md
```

## Quick Start (Local Development)

### 1. Configure environment

Edit `server/.env` with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lumen_leaf
JWT_SECRET=your-secret-key
PORT=5000
```

For a local MongoDB instance, use:

```
MONGODB_URI=mongodb://localhost:27017/lumen_leaf
```

### 2. Install dependencies

```bash
cd dashboard/server && npm install
cd ../client && npm install
```

### 3. Seed the database

This creates 50 properties, 500+ transactions, 120+ maintenance tickets, 9 broker partners, and an admin user.

```bash
cd dashboard/server
node seed.js
```

You should see:

```
✓ Seed complete!
  Properties: 50
  Transactions: 521
  Maintenance: 122
  Brokers: 9
  Login: admin@lumenleaf.com / demo2025
```

### 4. Start the servers

**Terminal 1 — API server:**

```bash
cd dashboard/server
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd dashboard/client
npm run dev
```

### 5. Open the dashboard

Navigate to `http://localhost:5173` (or the port Vite assigns).

**Login credentials:**

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@lumenleaf.com    |
| Password | demo2025               |

## Deploying to a Server

### Option A: VPS / Cloud VM (Recommended for demos)

#### 1. Provision a server

Any Linux VPS works — DigitalOcean, AWS EC2, Hetzner, etc. Ubuntu 22.04+ recommended.

#### 2. Install dependencies on server

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v && npm -v
```

#### 3. Clone and install

```bash
git clone <your-repo-url> lumen-leaf
cd lumen-leaf/dashboard

cd server && npm install
cd ../client && npm install
```

#### 4. Configure environment

```bash
cd server
cp .env.example .env   # or create manually
nano .env              # set MONGODB_URI, JWT_SECRET, PORT
```

#### 5. Build the frontend

```bash
cd ../client
npm run build
```

This creates a `dist/` folder with static files.

#### 6. Serve frontend from Express (production)

Add static file serving to the Express server. Create or edit `server/index.js` to add these lines before the listen call:

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve built frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```

#### 7. Seed and start

```bash
cd server
node seed.js
node index.js
```

The dashboard will be available at `http://<your-server-ip>:5000`.

#### 8. Keep it running with PM2

```bash
npm install -g pm2
cd server
pm2 start index.js --name lumenleaf-dashboard
pm2 save
pm2 startup   # follow the printed command to enable on boot
```

#### 9. (Optional) Nginx reverse proxy with HTTPS

```nginx
server {
    listen 80;
    server_name dashboard.lumenleafproperties.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable HTTPS with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.lumenleafproperties.com
```

### Option B: Platform Deployment (Zero-ops)

| Service   | What to deploy        | Free tier |
|-----------|-----------------------|-----------|
| Render    | server/ as Web Service | Yes      |
| Vercel    | client/ as Static Site | Yes      |
| Railway   | server/ as Service     | Yes      |
| Fly.io    | server/ as App         | Yes      |

For Render/Railway, set environment variables in their dashboard and add a build command:

```
Build: cd client && npm install && npm run build
Start: cd server && node index.js
```

## Dashboard Pages

| Page             | URL              | Purpose                                           |
|------------------|------------------|----------------------------------------------------|
| Login            | /login           | Auth screen with demo credentials                  |
| Overview         | /                | KPI cards, revenue chart, status donut, activity    |
| Properties       | /properties      | Filterable table of all 50 managed properties       |
| Property Detail  | /properties/:id  | Owner, tenant, rent history, maintenance, financials|
| Financials       | /financials      | Revenue vs expenses, collection trend, breakdown    |
| Maintenance      | /maintenance     | Ticket tracker, SLA compliance, category breakdown  |
| Partners         | /partners        | Broker revenue share, partnership models, earnings  |
| SLA Performance  | /sla             | Progress rings, NPS, retention, SLA definitions     |

## Seeded Data Overview

- **50 properties** across NCR (Gurgaon, Noida, Greater Noida, Faridabad, Ghaziabad)
- **500+ rent transactions** spanning 12 months with realistic payment patterns
- **120+ maintenance tickets** weighted toward plumbing and electrical
- **9 broker partners** across revenue share, referral, and area partner models
- **92% occupancy rate**, realistic collection rates with some overdue payments
- **Revenue growth trend** showing business scaling over 12 months

## Re-seeding

To reset and regenerate all data:

```bash
cd dashboard/server
node seed.js
```

This drops all existing collections and creates fresh deterministic data.

## API Endpoints

| Method | Endpoint                 | Auth | Description                          |
|--------|--------------------------|------|--------------------------------------|
| POST   | /api/auth/login          | No   | Returns JWT token                    |
| GET    | /api/stats/overview      | Yes  | Aggregated dashboard metrics         |
| GET    | /api/stats/revenue-trend | Yes  | 12-month revenue and expense data    |
| GET    | /api/properties          | Yes  | List with filters (area, status, type, search) |
| GET    | /api/properties/:id      | Yes  | Single property with full history    |
| GET    | /api/transactions        | Yes  | Filterable transaction list          |
| GET    | /api/transactions/summary| Yes  | Monthly aggregations                 |
| GET    | /api/maintenance         | Yes  | Filterable maintenance tickets       |
| GET    | /api/maintenance/stats   | Yes  | SLA metrics, category breakdown      |
| GET    | /api/brokers             | Yes  | Partner list with earnings           |
| GET    | /api/brokers/stats       | Yes  | Aggregated partner metrics           |

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Notes

- The "Demo Mode" badge appears in the sidebar and login screen — this is intentional for honest pitching
- Seed data uses deterministic randomness so re-running `seed.js` produces consistent results
- The Vite dev server proxies `/api` requests to the Express server (configured in `vite.config.js`)
- For production, build the client and serve static files from Express as described above
