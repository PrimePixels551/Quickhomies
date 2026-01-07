# QuickHomies - Production Deployment Guide

## 🚀 Overview

QuickHomies is a full-stack service booking platform with:
- **Backend**: Node.js + Express + MongoDB
- **Mobile App**: React Native + Expo
- **Admin Panel**: React + Vite

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Update `.env.production` with real credentials
- [ ] Set up MongoDB Atlas or production MongoDB
- [ ] Generate a strong JWT_SECRET (64+ characters)
- [ ] Configure CORS with production URLs
- [ ] Set up SSL/HTTPS

### Mobile App
- [ ] Update production API URL in `config/index.ts`
- [ ] Replace test Razorpay key with live key
- [ ] Update app version in `app.json`
- [ ] Configure EAS project ID

### Admin Panel
- [ ] Update `.env.production` with production API URL
- [ ] Build for production

---

## 🔧 Backend Deployment

### Option 1: Railway / Render / Heroku

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to hosting platform and set environment variables:**
```
NODE_ENV=production
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-64-char-secret>
FRONTEND_URL=https://your-app.com
ADMIN_URL=https://admin.your-app.com
```

### Option 2: VPS (DigitalOcean, AWS EC2)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo>
cd QuickHomies/Backend
npm install --production

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name quickhomies-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/quickhomies`):
```nginx
server {
    listen 80;
    server_name api.quickhomies.com;

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

---

## 📱 Mobile App Deployment

### Build for Android (APK/AAB)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
eas login
```

2. **Configure EAS**
```bash
cd Home
eas build:configure
```

3. **Build APK (for testing)**
```bash
eas build -p android --profile preview
```

4. **Build AAB (for Play Store)**
```bash
eas build -p android --profile production
```

### Build for iOS

```bash
eas build -p ios --profile production
```

### EAS Build Profiles (`eas.json`)
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 🖥️ Admin Panel Deployment

### Build for Production

```bash
cd admin
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🔐 Security Checklist

- [x] Helmet.js for security headers
- [x] Rate limiting configured
- [x] MongoDB injection prevention
- [x] CORS properly configured
- [x] Environment variables secured
- [ ] SSL/HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring/logging set up

---

## 📊 Recommended Services

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | Database | 512MB |
| Railway | Backend hosting | $5/month credit |
| Vercel | Admin panel hosting | Free |
| Expo EAS | Mobile builds | 30 builds/month |
| Sentry | Error tracking | 5K events/month |

---

## 🔄 Update Workflow

1. Make changes locally
2. Test thoroughly
3. Update version numbers
4. Push to GitHub
5. Automatic deployment (if CI/CD configured)
6. For mobile: Run EAS build and submit to stores

---

## 📞 Support

For issues or questions, check:
- Backend logs: `pm2 logs quickhomies-api`
- Mobile issues: Expo dashboard
- Admin panel: Browser console

---

**Happy Deploying! 🎉**
