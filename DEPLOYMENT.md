# 🚀 Deployment Guide

Guide for deploying the Hospital Management System to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups created
- [ ] SSL certificates obtained
- [ ] Domain name ready
- [ ] Hosting provider selected
- [ ] Database hosting setup
- [ ] Security audit completed
- [ ] Performance tested

---

## 🔐 Security Hardening

### Backend (.env Production)
```
PORT=80/443
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hospital_prod
JWT_SECRET=<strong-random-key-256-bits>
JWT_EXPIRE=7d
NODE_ENV=production
```

### Security Headers
```javascript
// Add to server.js
const helmet = require('helmet');
app.use(helmet());
```

### HTTPS Setup
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🖥️ Backend Deployment

### Option 1: Heroku (Easiest)

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Create Heroku App
```bash
cd backend
heroku create your-app-name
```

#### 3. Add MongoDB Atlas
- Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get connection string
- Set environment variable:
```bash
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret-key
```

#### 4. Deploy
```bash
git push heroku main
heroku logs --tail
```

---

### Option 2: AWS/EC2

#### 1. Launch EC2 Instance
```bash
# Ubuntu 20.04 LTS
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 2. Clone Repository
```bash
git clone <repo-url>
cd backend
npm install
npm run seed
```

#### 3. Setup PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 start server.js --name "hospital-api"
pm2 startup
pm2 save
```

#### 4. Setup Nginx (Reverse Proxy)
```bash
sudo apt-get install nginx
sudo systemctl start nginx
```

**Nginx Config** (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

### Option 3: DigitalOcean

#### 1. Create Droplet
- Select Ubuntu 20.04
- Size: 2GB RAM minimum

#### 2. SSH into Droplet
```bash
ssh root@your_droplet_ip
```

#### 3. Setup (Similar to AWS)
Follow the AWS/EC2 steps above

#### 4. Setup SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Build Production
```bash
cd frontend
npm run build
```

#### 2. Install Vercel CLI
```bash
npm i -g vercel
vercel
```

#### 3. Configure
- Select project directory
- Build Command: `npm run build`
- Output Directory: `dist`
- Set environment variables in Vercel dashboard

#### 4. Deploy
```bash
vercel --prod
```

---

### Option 2: Netlify

#### 1. Build
```bash
npm run build
```

#### 2. Connect to Netlify
- Go to [netlify.com](https://netlify.com)
- Connect GitHub repository
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`

#### 3. Deploy
Push to GitHub, Netlify auto-deploys

---

### Option 3: AWS S3 + CloudFront

#### 1. Create S3 Bucket
```bash
aws s3 mb s3://hospital-management-app
```

#### 2. Build and Deploy
```bash
npm run build
aws s3 sync dist/ s3://hospital-management-app
```

#### 3. Setup CloudFront
- Create distribution
- Point to S3 bucket
- Configure SSL

---

## 📱 Production Environment Variables

### Backend
```
PORT=443
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hospital_prod
JWT_SECRET=generate-strong-256bit-secret
JWT_EXPIRE=7d
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend
```
VITE_API_URL=https://api.your-domain.com/api
VITE_ENV=production
```

---

## 🔍 Monitoring & Logging

### Backend Monitoring
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});
```

### Frontend Monitoring
```javascript
// Add to App.jsx
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Frontend Error:', event.error);
    // Send to error tracking service
  });
}
```

---

## 📊 Performance Optimization

### Backend
1. **Database Indexing**
   ```javascript
   userSchema.index({ email: 1 });
   bedSchema.index({ bedNumber: 1 });
   ```

2. **Caching**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   
   // Cache frequently accessed data
   ```

3. **Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Frontend
1. **Code Splitting**
   ```javascript
   const Dashboard = React.lazy(() => import('./pages/DashboardPage'));
   ```

2. **Image Optimization**
   - Compress images
   - Use WebP format
   - Lazy load images

3. **Bundle Analysis**
   ```bash
   npm run build -- --analyze
   ```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Heroku
        uses: AkhileshNS/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

---

## 🚨 Backup & Recovery

### Database Backup
```bash
# MongoDB Atlas automatic backups (enabled by default)
# Manual backup:
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/hospital_prod"
```

### Code Backup
```bash
git push origin main  # Push to GitHub
```

### Recovery Process
1. Restore database from backup
2. Redeploy latest code
3. Run data validation checks
4. Verify all services

---

## ✅ Post-Deployment Checklist

- [ ] Test all endpoints
- [ ] Verify SSL certificate
- [ ] Check database connection
- [ ] Test authentication
- [ ] Verify CORS settings
- [ ] Monitor error logs
- [ ] Check response times
- [ ] Test with real users
- [ ] Monitor server resources
- [ ] Setup automated backups

---

## 🆘 Troubleshooting

### Connection Issues
```bash
# Check logs
pm2 logs hospital-api

# Verify port
lsof -i :5000

# Check firewall
sudo ufw status
```

### Database Issues
```bash
# Test connection
mongo "mongodb+srv://user:pass@cluster.mongodb.net/hospital_prod"

# Check indexes
db.users.getIndexes()
```

### Performance Issues
```bash
# Check CPU
top

# Check memory
free -m

# Check disk
df -h
```

---

## 📞 Support Services

- **Error Tracking**: Sentry, Rollbar
- **Monitoring**: New Relic, DataDog
- **Analytics**: Google Analytics
- **CDN**: Cloudflare, AWS CloudFront
- **Email**: SendGrid, AWS SES

---

## 🔐 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials encrypted
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Security headers set

---

## 📈 Scaling Strategy

### Horizontal Scaling
1. Load balancer (Nginx, AWS ELB)
2. Multiple server instances
3. Shared database
4. Redis cache

### Vertical Scaling
1. Upgrade server resources
2. Optimize code
3. Cache frequently accessed data

---

**Happy Deploying! 🚀**
