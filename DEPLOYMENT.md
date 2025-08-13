# Deployment Guide

This guide covers multiple deployment options for your earning website using GitHub.

## 🚀 Quick Deployment Options

### Option 1: GitHub Pages (Frontend Only)
**Best for:** Static frontend hosting
**Cost:** Free
**Limitations:** Frontend only, needs separate backend

#### Steps:
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Save

3. **Deploy:**
   ```bash
   cd client
   npm run deploy
   ```

### Option 2: Vercel (Full-Stack)
**Best for:** Full-stack deployment
**Cost:** Free tier available
**Features:** Automatic deployments, serverless functions

#### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Connect to GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

### Option 3: Railway (Full-Stack)
**Best for:** Full-stack with database
**Cost:** Free tier available
**Features:** MongoDB integration, easy scaling

#### Steps:
1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Configure:**
   - Add environment variables
   - Set up MongoDB database
   - Deploy

### Option 4: Heroku (Full-Stack)
**Best for:** Traditional hosting
**Cost:** Free tier discontinued, paid plans
**Features:** Easy scaling, add-ons

#### Steps:
1. **Install Heroku CLI:**
   ```bash
   # Download from heroku.com
   ```

2. **Login and Deploy:**
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

## 🔧 GitHub Actions Setup

### 1. Repository Secrets
Add these secrets in your GitHub repository (Settings → Secrets):

#### For Frontend (GitHub Pages):
```
REACT_APP_API_URL=https://your-backend-url.com
```

#### For Backend (Heroku):
```
HEROKU_API_KEY=your_heroku_api_key
HEROKU_APP_NAME=your-app-name
HEROKU_EMAIL=your-email@example.com
```

#### For Backend (Railway):
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE=your_service_name
```

#### For Database:
```
MONGODB_URI=your_mongodb_connection_string
MONGODB_URI_TEST=your_test_database_uri
```

### 2. Environment Variables
Create `.env` files for local development:

#### Root `.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# ... other variables from .env.example
```

#### Client `.env`:
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 📱 Mobile App Deployment

### PWA Deployment
Your React app is already PWA-ready. To deploy as a mobile app:

1. **Build PWA:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to hosting:**
   - Upload `build/` folder to any web hosting
   - Or use GitHub Pages, Vercel, etc.

3. **Install on mobile:**
   - Users can "Add to Home Screen" from browser
   - Works like a native app

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use GitHub Secrets for production
- Rotate secrets regularly

### 2. SSL/HTTPS
- Enable HTTPS on all deployments
- Use Let's Encrypt for free SSL
- Configure CORS properly

### 3. Database Security
- Use MongoDB Atlas (cloud database)
- Enable IP whitelisting
- Use strong passwords

## 📊 Monitoring & Analytics

### 1. Error Tracking
- Add Sentry for error monitoring
- Configure alerts for critical errors

### 2. Performance Monitoring
- Use Vercel Analytics
- Monitor API response times
- Track user engagement

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and tested
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Email/SMS services working
- [ ] Payment gateways tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Performance optimized
- [ ] Security audit completed

## 🔄 Continuous Deployment

Once set up, every push to `main` branch will:
1. Run tests
2. Build the application
3. Deploy to production
4. Send notifications

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify environment variables
3. Test locally first
4. Check hosting provider status

## 💰 Cost Optimization

### Free Tier Limits:
- **GitHub Pages:** 1GB storage, 100GB bandwidth/month
- **Vercel:** 100GB bandwidth/month, 100 serverless function executions/day
- **Railway:** $5 credit/month
- **Heroku:** Paid plans only

### Scaling Tips:
- Use CDN for static assets
- Optimize images and code
- Monitor usage closely
- Consider paid plans for growth
