# SleekNDChic Local Setup Guide

## Quick Start

The system is already running in development mode! Access it at:
- **Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin
- **API**: http://localhost:3000

## Making It Accessible on Your Network

### Option 1: Access from Same Computer
Just open your browser and go to: **http://localhost:5173**

### Option 2: Access from Other Devices on Same Network

#### Step 1: Find Your Computer's IP Address
Open Command Prompt and run:
```cmd
ipconfig
```
Look for "IPv4 Address" - it will look like `192.168.1.xxx`

#### Step 2: Update Frontend Configuration
Edit `apps/web/vite.config.ts` and update the server section:
```javascript
server: {
  port: 5173,
  host: '0.0.0.0',  // Add this line
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

#### Step 3: Update API Configuration  
Edit `apps/api/.env` and update:
```env
FRONTEND_URL=http://192.168.1.xxx:5173  # Your IP address
API_URL=http://192.168.1.xxx:3000       # Your IP address
```

#### Step 4: Access from Other Devices
Now other devices on your network can access:
- **Frontend**: http://192.168.1.xxx:5173
- **API**: http://192.168.1.xxx:3000

### Option 3: Local Production Mode

To test the production build locally:

```bash
# Build the frontend
cd apps/web
npm run build

# The build output is in apps/web/dist/
# You can serve it with any static server
npx serve dist -l 4173
```

## Default Admin Credentials

After seeding the database (already done), you can login with:
- **Email**: admin@sleekndchic.com
- **Password**: admin123

**⚠️ Important**: Change this password immediately in production!

## Testing Checklist

### Public Store (http://localhost:5173)
- [ ] Homepage loads with products
- [ ] Click on a product to see details
- [ ] Select size/color variants
- [ ] Add to cart
- [ ] View cart
- [ ] Proceed to checkout
- [ ] Complete order (use Stripe test card: 4242 4242 4242 4242)

### Admin Panel (http://localhost:5173/admin)
- [ ] Login with admin credentials
- [ ] View dashboard statistics
- [ ] Navigate to Analytics page
- [ ] View revenue charts
- [ ] Check order status distribution
- [ ] View top products
- [ ] Manage products
- [ ] View orders list

### API Endpoints (http://localhost:3000)
- [ ] Health check: http://localhost:3000/health
- [ ] Products: http://localhost:3000/api/v1/products
- [ ] Categories: http://localhost:3000/api/v1/categories

## Troubleshooting

### Port Already in Use
If port 5173 or 3000 is busy:

**Frontend (change port):**
```bash
cd apps/web
npm run dev -- --port 3001
```

**API (change port):**
Edit `apps/api/.env`:
```env
PORT=3002
```

### Database Issues
Reset the database:
```bash
cd apps/api
npx prisma migrate reset
npx prisma db seed
```

### Clear Redis Cache
If using Redis:
```bash
redis-cli FLUSHALL
```

Or restart the API (it uses memory fallback if Redis is unavailable)

## Production Build Test

To test how the app will work in production:

```bash
# 1. Build frontend
cd apps/web
npm run build

# 2. Serve the production build
npx serve dist

# 3. In another terminal, run API in production mode
cd apps/api
npm run build
npm start
```

## Stopping the System

To stop the development servers:
- Press `Ctrl+C` in each terminal running the apps
- Or close the terminal windows

## System Requirements Met

✅ Node.js 18+ installed  
✅ All npm packages installed  
✅ Database (SQLite/Prisma) configured  
✅ Redis available (or using memory fallback)  
✅ Frontend built and running  
✅ API server running  

---

**The system is ready to use! Open http://localhost:5173 in your browser.**
