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
| Process   | PM2                                 |

## Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas cluster (or local MongoDB)
- PM2 (`npm install -g pm2`)

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
├── server/                 # Express API + static file server
│   ├── models/             # Mongoose schemas (5 collections)
│   ├── routes/             # API route handlers
│   ├── middleware/          # JWT auth middleware
│   ├── seed.js             # Database seeder (50 properties)
│   ├── index.js            # Express entry point
│   ├── .env                # Environment variables
│   └── package.json
├── ecosystem.config.cjs    # PM2 configuration
└── README.md
```

---

## Local Development

### 1. Install dependencies

```bash
cd dashboard/server && npm install
cd ../client && npm install
```

### 2. Configure environment

Edit `server/.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lumen_leaf
JWT_SECRET=your-secret-key
PORT=5000
```

### 3. Seed the database

```bash
cd dashboard/server
node seed.js
```

### 4. Start dev servers (two terminals)

```bash
# Terminal 1 — API
cd dashboard/server && npm run dev

# Terminal 2 — Frontend
cd dashboard/client && npm run dev
```

Open `http://localhost:5173`. Login: `admin@lumenleaf.com` / `demo2025`

---

## Production Deployment

Everything below runs from the `dashboard/` directory.

### Step 1 — Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### Step 2 — Configure environment

Create or edit `server/.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lumen_leaf
JWT_SECRET=change-this-to-a-strong-secret
PORT=5000
```

### Step 3 — Seed the database

```bash
cd server
node seed.js
```

Expected output:

```
✓ Seed complete!
  Properties: 50
  Transactions: 521
  Maintenance: 122
  Brokers: 9
  Login: admin@lumenleaf.com / demo2025
```

### Step 4 — Build the frontend

```bash
cd ../client
npm run build
```

This creates `client/dist/` — the Express server serves these files automatically in production.

### Step 5 — Install PM2

```bash
npm install -g pm2
```

### Step 6 — Start with PM2

```bash
cd ..   # back to dashboard/
pm2 start ecosystem.config.cjs
```

Verify it is running:

```bash
pm2 status
```

You should see:

```
│ lumenleaf-dashboard │ online │
```

The dashboard is now live at `http://localhost:5000` (or `http://<your-server-ip>:5000`).

### Step 7 — Save and enable auto-start on reboot

```bash
pm2 save
pm2 startup
```

Follow the command PM2 prints to enable boot startup.

---

## PM2 Commands

| Command                              | What it does                         |
|--------------------------------------|--------------------------------------|
| `pm2 status`                         | Check running processes              |
| `pm2 logs lumenleaf-dashboard`       | Stream live logs                     |
| `pm2 restart lumenleaf-dashboard`    | Restart after changes                |
| `pm2 stop lumenleaf-dashboard`       | Stop the app                         |
| `pm2 delete lumenleaf-dashboard`     | Remove from PM2                      |
| `pm2 save`                           | Persist process list                 |
| `pm2 startup`                        | Enable auto-start on boot            |

---

## After Code Changes

```bash
cd dashboard/client && npm run build
pm2 restart lumenleaf-dashboard
```

---

## Re-seeding Data

To reset and regenerate all demo data:

```bash
cd dashboard/server
node seed.js
pm2 restart lumenleaf-dashboard
```

---

## (Optional) Nginx Reverse Proxy + HTTPS

If you want to serve the dashboard on a domain with SSL:

### Nginx config

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

### Enable HTTPS with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.lumenleafproperties.com
```

---

## VPS Setup from Scratch (Ubuntu 22.04+)

If starting from a fresh server:

```bash
# 1. Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install PM2
npm install -g pm2

# 3. Clone the repo
git clone <your-repo-url> lumen-leaf
cd lumen-leaf/dashboard

# 4. Install, configure, seed, build, start
cd server && npm install
nano .env                          # add MONGODB_URI, JWT_SECRET, PORT
node seed.js
cd ../client && npm install && npm run build
cd ..
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

Dashboard is live at `http://<server-ip>:5000`.

---

## Login Credentials

| Field    | Value               |
|----------|---------------------|
| Email    | admin@lumenleaf.com |
| Password | demo2025            |

## Dashboard Pages

| Page             | URL              | Purpose                                            |
|------------------|------------------|-----------------------------------------------------|
| Login            | /login           | Auth screen with demo credentials                   |
| Overview         | /                | KPI cards, revenue chart, status donut, activity     |
| Properties       | /properties      | Filterable table of all 50 managed properties        |
| Property Detail  | /properties/:id  | Owner, tenant, rent history, maintenance, financials |
| Financials       | /financials      | Revenue vs expenses, collection trend, breakdown     |
| Maintenance      | /maintenance     | Ticket tracker, SLA compliance, category breakdown   |
| Partners         | /partners        | Broker revenue share, partnership models, earnings   |
| SLA Performance  | /sla             | Progress rings, NPS, retention, SLA definitions      |

## API Endpoints

| Method | Endpoint                  | Auth | Description                                     |
|--------|---------------------------|------|-------------------------------------------------|
| POST   | /api/auth/login           | No   | Returns JWT token                               |
| GET    | /api/stats/overview       | Yes  | Aggregated dashboard metrics                    |
| GET    | /api/stats/revenue-trend  | Yes  | 12-month revenue and expense data               |
| GET    | /api/properties           | Yes  | List with filters (area, status, type, search)  |
| GET    | /api/properties/:id       | Yes  | Single property with full history               |
| GET    | /api/transactions         | Yes  | Filterable transaction list                     |
| GET    | /api/transactions/summary | Yes  | Monthly aggregations                            |
| GET    | /api/maintenance          | Yes  | Filterable maintenance tickets                  |
| GET    | /api/maintenance/stats    | Yes  | SLA metrics, category breakdown                 |
| GET    | /api/brokers              | Yes  | Partner list with earnings                      |
| GET    | /api/brokers/stats        | Yes  | Aggregated partner metrics                      |

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Seeded Data

- 50 properties across NCR (Gurgaon, Noida, Greater Noida, Faridabad, Ghaziabad)
- 500+ rent transactions spanning 12 months
- 120+ maintenance tickets weighted toward plumbing and electrical
- 9 broker partners (revenue share, referral, area partner models)
- 92% occupancy, realistic collection rates with some overdue payments
- Revenue growth trend showing business scaling over 12 months
