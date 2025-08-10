import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

// Enable CORS for all origins
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Login endpoint for testing
app.post('/api/v1/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { email, password } = req.body;
  
  // Simple test authentication
  if (email === 'admin@nandighosh.com' && password === 'Nandighosh@3211') {
    res.json({ 
      success: true, 
      message: 'Admin login successful',
      data: { 
        token: 'test-admin-token',
        user: {
          id: '1',
          email: 'admin@nandighosh.com',
          role: 'admin',
          full_name: 'Admin User'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

// Admin stats endpoint
app.get('/api/v1/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 150,
      totalBuses: 25,
      totalRoutes: 12,
      totalBookings: 89,
      recentBookings: [
        {
          id: '1',
          booking_reference: 'NB001',
          passenger_name: 'John Doe',
          route_name: 'Bhubaneswar - Cuttack',
          status: 'confirmed'
        }
      ]
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🌍 Also available on all network interfaces`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
