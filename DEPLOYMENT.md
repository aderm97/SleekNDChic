# SleekNDChic Production Deployment Guide (Vercel + VPS)

This guide outlines deploying the **Frontend to Vercel** and the **API to a Hostinger VPS** (or any cloud VPS). This split architecture takes advantage of Vercel's global CDN for the React SPA, while keeping the persistent PostgreSQL/Redis/Node.js backend on your own server.

---

## 1. Frontend Deployment (Vercel)

### Prerequisites
- A GitHub/GitLab/Bitbucket account
- A Vercel account
- The project pushed to a Git repository

### Steps
1. Push your code to a Git repository.
2. Log into Vercel and click **Add New... > Project**.
3. Import your Git repository.
4. **Configure the Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:**
   Add the variables from `apps/web/.env.production` (or `.env.production.template`):
   - `VITE_API_URL`: `https://api.yourdomain.com/api/v1` (URL of your deployed backend)
   - `VITE_PAYSTACK_PUBLIC_KEY`: `pk_live_your_key_here`
   - `VITE_APP_NAME`: `SleekNDChic`
   - `VITE_APP_URL`: `https://yourdomain.com`
6. Click **Deploy**. Vercel will automatically read the `vercel.json` we created to handle SPA routing and security headers.

---

## 2. Backend Deployment (Hostinger VPS)

### Prerequisites
- Hostinger VPS (Ubuntu 22.04 LTS recommended)
- Domain name pointed to your VPS IP (e.g., `api.yourdomain.com`)
- SSH access

### 2.1 Server Setup

```bash
# Update System
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL, Redis, and Nginx
sudo apt install postgresql postgresql-contrib redis-server nginx -y
sudo systemctl enable postgresql redis nginx
sudo systemctl start postgresql redis nginx

# Install PM2
sudo npm install -g pm2
```

### 2.2 Database Setup

```bash
sudo -u postgres psql
```
Inside psql:
```sql
CREATE DATABASE sleekndchic;
CREATE USER sleekndchic_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE sleekndchic TO sleekndchic_user;
\q
```

### 2.3 Deploy Application Code

1. Create directory and upload the `apps/api` code and `package.json` to the server:
```bash
sudo mkdir -p /var/www/sleekndchic/apps/api
sudo chown -R $USER:$USER /var/www/sleekndchic
```
2. Clone your repo or upload files via SCP.
3. Install dependencies:
```bash
cd /var/www/sleekndchic/apps/api
npm ci --production
```

### 2.4 Configure Environment

Create the `.env` file for the API:
```bash
nano /var/www/sleekndchic/apps/api/.env
```
Copy the contents of `.env.production.template` (the API section) and fill in your actual production values (Postgres URL, JWT secrets, Paystack Live keys, etc.). Ensure `FRONTEND_URL` matches your Vercel URL.

### 2.5 Run Migrations

```bash
npx prisma migrate deploy
npx prisma db seed # Optional: first time only
```

### 2.6 Start API with PM2

Create `ecosystem.config.js` in `/var/www/sleekndchic`:
```javascript
module.exports = {
  apps: [{
    name: 'sleekndchic-api',
    cwd: './apps/api',
    script: 'npm',
    args: 'start',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
```
Start it:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2.7 Configure Nginx Reverse Proxy

Create a server block for your API domain:
```bash
sudo nano /etc/nginx/sites-available/api.yourdomain.com
```
Add:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable it and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install certbot and get SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

---

## Maintenance

**View Backend Logs:**
```bash
pm2 logs sleekndchic-api
```

**Restart Backend:**
```bash
pm2 restart sleekndchic-api
```

**Update Backend Code:**
```bash
cd /var/www/sleekndchic/apps/api
git pull origin main
npm ci --production
npx prisma migrate deploy
pm2 restart sleekndchic-api
```
*(Frontend updates automatically via Vercel when you push to GitHub).*
