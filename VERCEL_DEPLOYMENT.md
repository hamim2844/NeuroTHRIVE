# Vercel Deployment Guide

## 🚀 Deploy Your Earning Website to Vercel (FREE)

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy Your Project**
```bash
# From your project root directory
vercel
```

### **Step 4: Follow the Prompts**
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **What's your project's name?** → `earning-website`
- **In which directory is your code located?** → `./` (root)
- **Want to override the settings?** → `N`

### **Step 5: Configure Environment Variables**
After deployment, go to your Vercel dashboard and add these environment variables:

#### **Required Variables:**
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret
CLIENT_URL=https://your-vercel-app.vercel.app
```

#### **Email Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### **SMS Configuration (Twilio):**
```env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

#### **Offerwall APIs:**
```env
ADGATE_API_KEY=your_adgate_key
ADGATE_PUBLISHER_ID=your_publisher_id
CPALEAD_API_KEY=your_cpalead_key
OGADS_API_KEY=your_ogads_key
```

#### **Payment Gateways:**
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYONEER_API_KEY=your_payoneer_key
```

### **Step 6: Connect to GitHub (Optional but Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables
4. Enable automatic deployments

## 🔧 Vercel-Specific Configuration

### **Custom Domain Setup:**
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### **Environment Variables by Environment:**
```bash
# Production
vercel env add MONGODB_URI production

# Preview (for pull requests)
vercel env add MONGODB_URI preview

# Development
vercel env add MONGODB_URI development
```

## 📱 PWA Configuration for Vercel

Your React app is already PWA-ready. Vercel automatically serves it with:
- HTTPS enabled
- Service worker support
- Fast loading times
- Global CDN

## 🔒 Security Best Practices

### **1. Environment Variables:**
- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate secrets regularly

### **2. CORS Configuration:**
```javascript
// In your server/index.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### **3. Rate Limiting:**
Vercel automatically provides DDoS protection, but you can add custom rate limiting in your code.

## 📊 Monitoring & Analytics

### **Vercel Analytics (Free):**
- Automatic performance monitoring
- Real user metrics
- Error tracking
- Core Web Vitals

### **Custom Monitoring:**
```javascript
// Add to your server/index.js
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## 🚀 Deployment Commands

### **Deploy to Production:**
```bash
vercel --prod
```

### **Deploy Preview:**
```bash
vercel
```

### **List Deployments:**
```bash
vercel ls
```

### **Remove Deployment:**
```bash
vercel remove
```

## 💰 Cost Optimization

### **Free Tier Limits:**
- **100GB bandwidth/month**
- **100 serverless function executions/day**
- **Unlimited static sites**
- **Custom domains**

### **Staying Within Limits:**
1. **Optimize images** - Use WebP format
2. **Enable compression** - Already configured
3. **Use CDN** - Automatic with Vercel
4. **Monitor usage** - Check Vercel dashboard

### **Scaling Up:**
If you exceed free limits:
- **Pro Plan:** $20/month
- **Enterprise:** Custom pricing

## 🔄 Continuous Deployment

### **Automatic Deployments:**
1. Connect GitHub repository
2. Every push to `main` → Production
3. Every pull request → Preview deployment

### **Manual Deployments:**
```bash
# Deploy specific branch
vercel --prod

# Deploy with specific environment
vercel --env production
```

## 🛠️ Troubleshooting

### **Common Issues:**

#### **1. Build Failures:**
```bash
# Check build logs
vercel logs

# Rebuild locally
npm run build
```

#### **2. Environment Variables:**
```bash
# List environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME
```

#### **3. Function Timeouts:**
- Increase `maxDuration` in `vercel.json`
- Optimize database queries
- Use caching strategies

### **Support:**
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status:** [vercel-status.com](https://vercel-status.com)

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB Atlas connected
- [ ] Email/SMS services working
- [ ] Payment gateways tested
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] Error monitoring set up
- [ ] Analytics configured
- [ ] Backup strategy in place

## 🚀 Quick Start Commands

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy to production
vercel --prod

# 5. Set up environment variables
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
# ... add other variables

# 6. Redeploy with new variables
vercel --prod
```

Your earning website will be live at: `https://your-app-name.vercel.app`
