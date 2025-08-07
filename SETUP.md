# 🚌 Nandighosh Bus Service - Complete Setup Guide

This guide will help you set up both the frontend (Next.js) and backend (Node.js/Express) for the Nandighosh Bus Service project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🛠️ Services Required

You'll need accounts for these services:

1. **Supabase** (Database & Auth) - [Sign up here](https://supabase.com/)
2. **Razorpay** (Payments) - [Sign up here](https://razorpay.com/)
3. **Gmail/SMTP** (Email services) - For sending notifications
4. **Google Maps API** (Optional) - For route mapping

## 🚀 Setup Instructions

### Step 1: Project Structure

Your project should look like this:
```
Bus service/
├── app/                    # Next.js frontend
├── components/             # React components
├── backend/               # Node.js backend
├── lib/                   # Utilities
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── .env.local            # Frontend environment variables
└── README.md             # This file
```

### Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env` to create your configuration
   - Update with your actual service credentials:

   ```bash
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   
   # Supabase Configuration (get from your Supabase dashboard)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   
   # JWT Secrets (generate strong random strings)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_REFRESH_SECRET=your_refresh_secret_different_from_jwt_secret
   
   # Email Configuration (use Gmail App Password)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your_app_specific_password
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   ```

4. **Set up Supabase Database:**
   - Log into your Supabase dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `backend/database/schema.sql`
   - Run the script to create all tables and functions
   - Optionally run `backend/database/sample-data.sql` for test data

5. **Build and start the backend:**
   ```bash
   npm run build    # Build TypeScript
   npm run dev      # Start development server
   ```

   The backend will be available at: `http://localhost:5000`

### Step 3: Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up frontend environment variables:**
   Update `.env.local` in the project root:

   ```bash
   # Frontend Environment Variables
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
   
   # Supabase Configuration (same as backend)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=Nandighosh Bus Service
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:3000`

## 🔑 Service Configuration

### Supabase Setup

1. **Create a new project** in Supabase
2. **Get your credentials** from Settings > API
3. **Run the database schema** from `backend/database/schema.sql`
4. **Configure Row Level Security** policies (included in schema)
5. **Test database connection** with your backend

### Razorpay Setup

1. **Create a Razorpay account**
2. **Get your API keys** from Dashboard > Settings > API Keys
3. **Configure webhook URL** (optional): `https://yourdomain.com/api/v1/payments/webhook`
4. **Test with small amounts** in test mode first

### Email Setup (Gmail)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate password for "Mail"
3. **Use the generated password** in `EMAIL_PASS`

## 🧪 Testing the Setup

### Backend Health Check
Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-08-07T05:00:00.000Z",
  "uptime": 12.345,
  "environment": "development"
}
```

### Frontend Access
Visit: `http://localhost:3000`

You should see the Nandighosh Bus Service homepage.

### Database Test
1. Try registering a new user through the frontend
2. Check if user appears in Supabase dashboard
3. Test login functionality

## 🚀 Deployment

### Backend Deployment Options

1. **Vercel** (Recommended for Node.js):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Railway**:
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Heroku**:
   ```bash
   npm install -g heroku
   heroku create your-app-name
   git push heroku main
   ```

### Frontend Deployment

1. **Vercel** (Recommended for Next.js):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set environment variables

## 📞 Support

If you encounter issues:

1. **Check the logs** in your terminal
2. **Verify environment variables** are set correctly
3. **Test API endpoints** with tools like Postman
4. **Check Supabase logs** in the dashboard
5. **Ensure all services are running**

## 🔧 Development Tips

### Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run lint         # Check code quality

# Frontend
npm run dev          # Start Next.js development
npm run build        # Build for production
npm run start        # Start production server
```

### Debugging

1. **Backend API**: Use Postman or curl to test endpoints
2. **Database**: Check Supabase dashboard for data
3. **Frontend**: Use browser developer tools
4. **Logs**: Check console output for both servers

### Code Organization

- **Backend controllers**: Handle API logic
- **Backend services**: Business logic
- **Frontend components**: Reusable UI components
- **Frontend pages**: Route-based pages
- **Shared types**: TypeScript definitions

## 🎯 Next Steps

Once your setup is complete:

1. **Create admin user** through the API
2. **Add bus routes** and schedules
3. **Test booking flow** end-to-end
4. **Configure payment gateway**
5. **Set up email templates**
6. **Add monitoring and analytics**

## 🛡️ Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets
- Keep API keys secure
- Enable HTTPS in production
- Regular security updates
- Monitor for suspicious activities

---

**🚌 Happy coding with Nandighosh Bus Service!**

For additional support, check the individual README files in the backend directory or reach out to the development team.
