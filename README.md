# Earning Website - Complete Platform

A comprehensive earning website platform designed for both Bangladeshi and international users. Built with Node.js, Express, MongoDB, and React.

## 🌟 Features

### User Management
- **Registration & Login**: Email/password and social authentication
- **Country-specific verification**: Phone verification for Bangladesh users, email verification for international users
- **Multi-language support**: English and Bengali
- **Theme support**: Light and dark mode

### Earning System
- **Offerwall Integration**: AdGateMedia, CPALead, OGAds
- **Multiple earning methods**:
  - Surveys and questionnaires
  - App installations
  - Video watching
  - Daily quizzes
  - Content locking offers
- **Referral system**: 10% commission on referral earnings
- **Daily bonus**: Streak-based bonus system

### Points & Rewards
- **Flexible point system**: 100 points = $1 (configurable)
- **Country-specific minimums**: 
  - Bangladesh: 200 points (50 টাকা)
  - International: 500 points ($5)
- **Automatic point tracking** via API integration

### Payout System
- **Bangladesh**: bKash, Nagad, Rocket
- **International**: PayPal, Payoneer, Wise
- **Admin approval system**: Manual or automated processing
- **Transaction history**: Complete audit trail

### Security & Fraud Prevention
- **VPN/Proxy detection**: Blocks suspicious IPs
- **Duplicate account detection**: Prevents multiple accounts
- **Device fingerprinting**: Advanced fraud detection
- **Rate limiting**: Prevents abuse
- **SSL encryption**: Secure data transmission

### Admin Panel
- **User management**: View, edit, ban users
- **Offer management**: Add, edit, remove offers
- **Payout processing**: Approve/reject withdrawals
- **Analytics dashboard**: Comprehensive reporting
- **Notification system**: Send announcements to users

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd earning-website
```

2. **Install dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env
cp client/.env.example client/.env
```

4. **Configure environment variables**
```env
# Server (.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/earning-website
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Client URL
CLIENT_URL=http://localhost:3000

# Offerwall API Keys
ADGATEMEDIA_API_KEY=your-adgatemedia-key
CPALEAD_API_KEY=your-cpalead-key
OGADS_API_KEY=your-ogads-key
```

5. **Start the development servers**
```bash
# Start both server and client
npm run dev

# Or start them separately
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

## 📁 Project Structure

```
earning-website/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static files
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 Configuration

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `earning-website`
3. Update `MONGODB_URI` in your `.env` file

### Email Setup
1. Create a Gmail account or use your existing email
2. Enable 2-factor authentication
3. Generate an app password
4. Update SMTP settings in `.env`

### SMS Setup (for Bangladesh users)
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Update Twilio settings in `.env`

### Offerwall Integration
1. Sign up for AdGateMedia, CPALead, and OGAds
2. Get your API keys
3. Configure webhook URLs in your offerwall accounts
4. Update API keys in `.env`

## 🚀 Deployment

### Production Build
```bash
# Build the client
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
CLIENT_URL=https://yourdomain.com
```

### Deployment Options

#### Option 1: VPS/Cloud Server
1. Set up a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js and MongoDB
3. Clone the repository
4. Configure environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server/index.js --name "earning-website"
pm2 startup
```

#### Option 2: Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new app
4. Add MongoDB add-on
5. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

#### Option 3: Shared Hosting
1. Upload files to your hosting provider
2. Set up a subdomain for the API
3. Configure environment variables
4. Set up cron jobs for maintenance tasks

## 🔒 Security Considerations

1. **Change default secrets**: Update JWT_SECRET and SESSION_SECRET
2. **Use HTTPS**: Always use SSL in production
3. **Rate limiting**: Configure appropriate rate limits
4. **Input validation**: All user inputs are validated
5. **SQL injection protection**: Using Mongoose ODM
6. **XSS protection**: React automatically escapes content
7. **CSRF protection**: Implemented in forms

## 📊 Monitoring & Analytics

### Built-in Analytics
- User registration and activity tracking
- Offer completion rates
- Payout processing statistics
- Referral performance metrics

### Recommended Monitoring Tools
- **Application monitoring**: New Relic, DataDog
- **Error tracking**: Sentry
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Database monitoring**: MongoDB Atlas monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@yourdomain.com
- Documentation: [Link to docs]

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks
- Database backups (daily)
- Log rotation (weekly)
- Security updates (monthly)
- Performance monitoring (continuous)

### Update Process
1. Backup database
2. Pull latest changes
3. Update dependencies
4. Run database migrations
5. Test thoroughly
6. Deploy to production

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ User authentication system
- ✅ Basic earning features
- ✅ Payout system
- ✅ Admin panel

### Phase 2 (Next)
- 🔄 Mobile app development
- 🔄 Advanced analytics
- 🔄 AI-powered fraud detection
- 🔄 Multi-currency support

### Phase 3 (Future)
- 📋 Blockchain integration
- 📋 DeFi earning options
- 📋 NFT marketplace
- 📋 Social features

---

**Note**: This is a production-ready earning website platform. Make sure to comply with local laws and regulations regarding online earning platforms in your target markets.
