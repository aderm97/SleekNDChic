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

---

## 3. AWS EC2 (Unified Docker Compose Deployment)

This section outlines deploying the entire stack (PostgreSQL, Redis, API, and React Frontend served by Nginx) onto a single AWS EC2 instance. This is the most cost-effective self-hosted approach.

### 3.1 Prerequisites & AWS Configuration

1. **Launch an EC2 Instance:**
   - **OS**: Ubuntu 22.04 LTS or 24.04 LTS (x86_64).
   - **Instance Type**: `t3.small` (recommended, 2GB RAM). *Note: `t3.micro` may run out of memory during frontend build compilation unless a swap file is added.*
   - **Storage**: 15GB+ gp3 SSD.
2. **Configure Security Group (Firewall):**
   Add inbound rules:
   - **SSH** (Port 22): Restrict to your IP for safety.
   - **HTTP** (Port 80): Anywhere (`0.0.0.0/0` and `::/0`).
   - **HTTPS** (Port 443): Anywhere (`0.0.0.0/0` and `::/0`).
3. **Configure DNS:**
   - Go to your DNS provider (e.g., AWS Route 53, Namecheap, GoDaddy).
   - Add an **A Record** pointing `yourdomain.com` (and `www.yourdomain.com`) to the **Elastic IP** of your EC2 instance.

---

### 3.2 Server Initialization

1. SSH into your EC2 instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/your-username/SleekNDChic.git
   cd SleekNDChic/SleekNDChic
   ```
3. Run the automated setup script to install Docker, Docker Compose, Git, and Node.js:
   ```bash
   chmod +x scripts/aws-setup.sh
   ./scripts/aws-setup.sh
   ```
4. Log out and SSH back in, or run `newgrp docker` to apply docker group permissions.

---

### 3.3 Configure Environment Variables

Create a root `.env` file for Docker Compose and the API:
```bash
nano .env
```
Copy and fill out the values from `.env.production.template`.

Ensure the frontend variables in `apps/web/.env.production` are also set. Since we are serving both the frontend and API from the same domain:
```ini
VITE_API_URL="/api/v1"
VITE_PAYSTACK_PUBLIC_KEY="pk_live_..."
VITE_APP_NAME="SleekNDChic"
VITE_APP_URL="https://yourdomain.com"
```

---

### 3.4 Deploy the Application

Run the deployment script to build the frontend and launch the containers:
```bash
chmod +x deploy.sh
./deploy.sh
```

At this stage, the API and frontend will be running over HTTP. You can verify this by checking if you can load the app at `http://your-ec2-public-ip` or `http://yourdomain.com`.

---

### 3.5 Set Up SSL/HTTPS (Certbot)

1. Obtain a Let's Encrypt certificate using the Certbot container:
   ```bash
   docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d yourdomain.com -d www.yourdomain.com --email admin@yourdomain.com --agree-tos --no-eff-email
   ```
2. Once the certificates are generated successfully, update Nginx to use them:
   - Edit the production SSL configuration template:
     ```bash
     nano nginx/sites-enabled/production-ssl.conf.template
     ```
     Replace all occurrences of `yourdomain.com` with your actual domain name.
   - Replace the default HTTP configuration with the SSL configuration:
     ```bash
     cp nginx/sites-enabled/production-ssl.conf.template nginx/sites-enabled/default.conf
     ```
3. Reload Nginx to apply HTTPS:
   ```bash
   docker compose exec nginx nginx -s reload
   ```

Your site is now fully secure and running at `https://yourdomain.com`. Certbot will automatically attempt to renew the certificate every 12 hours.

