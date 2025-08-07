# Nandighosh Bus Service Backend API

A comprehensive backend API for the Nandighosh Bus Service booking system built with Node.js, Express, TypeScript, and Supabase.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **User Management** - Complete user profile management with email verification
- **Bus Fleet Management** - Comprehensive bus and route management system
- **Booking System** - Real-time seat booking with payment integration
- **Payment Processing** - Secure payment handling with Razorpay integration
- **Agent System** - Partner agent management with commission tracking
- **Email Notifications** - Automated email notifications for bookings and account activities
- **Admin Dashboard** - Complete administrative controls and analytics

### Security Features
- Row-level security with Supabase
- Rate limiting and request throttling
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Password encryption with bcrypt
- JWT token-based authentication

### Database Features
- PostgreSQL with Supabase
- Full-text search capabilities
- Geospatial data support with PostGIS
- Comprehensive audit logging
- Database triggers and functions
- Optimized indexing for performance

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **Email**: Nodemailer
- **Payment**: Razorpay
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

### Project Structure
```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models (future use)
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── database/
│   └── schema.sql       # Database schema
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 📊 Database Schema

### Core Entities
- **user_profiles** - User account information
- **agents** - Partner agents and their details
- **routes** - Bus routes between cities
- **route_stops** - Individual stops on each route
- **buses** - Bus fleet information
- **bus_schedules** - Scheduled trips
- **bookings** - Passenger bookings
- **booking_passengers** - Individual passengers per booking
- **payments** - Payment transactions
- **audit_logs** - System audit trail

### Key Features
- UUID primary keys for security
- Row-level security policies
- Automatic timestamp triggers
- Comprehensive indexing
- Data validation constraints
- Audit trail for all changes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Razorpay account (for payments)
- SMTP email service

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in Supabase SQL Editor
   - Configure Row Level Security policies

5. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Other Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:3000
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication
Most endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Authentication (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `POST /auth/verify-email` - Email verification

#### Users (`/users`)
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update user profile
- `GET /users/bookings` - Get user bookings

#### Bus Search (`/buses`)
- `GET /buses/search` - Search available buses
- `GET /buses/:busId` - Get bus details
- `GET /buses/:busId/seats` - Get bus seat layout

#### Routes (`/routes`)
- `GET /routes` - Get all routes
- `GET /routes/:routeId` - Get route details
- `GET /routes/:routeId/stops` - Get route stops

#### Bookings (`/bookings`)
- `POST /bookings` - Create new booking
- `GET /bookings/:bookingId` - Get booking details
- `PATCH /bookings/:bookingId/cancel` - Cancel booking
- `GET /bookings/availability` - Check seat availability

#### Payments (`/payments`)
- `POST /payments/create` - Create payment order
- `POST /payments/verify` - Verify payment
- `GET /payments/:paymentId` - Get payment details

#### Agents (`/agents`)
- `POST /agents/register` - Register as agent
- `GET /agents/profile` - Get agent profile
- `GET /agents/bookings` - Get agent bookings
- `GET /agents/earnings` - Get agent earnings

### Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": { ... }, // Response data (optional)
  "errors": [...], // Error details (optional)
  "meta": { // Pagination info (optional)
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build production version
npm start        # Start production server
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint issues
npm test         # Run tests
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent error handling patterns
- Comprehensive input validation

## 🚀 Deployment

### Production Checklist
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure email service
5. Set up payment gateway
6. Configure CORS for production frontend
7. Set up monitoring and logging
8. Enable SSL/HTTPS
9. Configure rate limiting
10. Set up backup strategy

### Deployment Options
- **Vercel** - Serverless deployment
- **Heroku** - Container deployment
- **AWS/GCP/Azure** - Cloud deployment
- **Docker** - Containerized deployment

## 📈 Monitoring & Analytics

### Health Check
```
GET /health
```

### Logs
- Application logs with Morgan
- Error tracking and monitoring
- Performance metrics
- Database query monitoring

### Analytics Endpoints
- Booking analytics
- Revenue reports
- User engagement metrics
- Agent performance tracking

## 🔒 Security

### Implemented Security Measures
- JWT-based authentication
- Password encryption with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection
- Security headers with Helmet
- SQL injection prevention
- XSS protection
- CSRF protection

### Security Best Practices
- Regular dependency updates
- Environment variable protection
- Database access controls
- API versioning
- Audit logging
- Error handling without information leakage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure security best practices

## 📞 Support

For support and questions:
- Email: support@nandighosh.com
- Phone: 1800-XXX-XXXX
- Documentation: [API Docs](https://api.nandighosh.com/docs)

## 📄 License

This project is proprietary software owned by Nandighosh Travels.

---

**Built with ❤️ for better bus travel experience in Odisha** 🚌
