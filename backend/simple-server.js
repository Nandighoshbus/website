const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 5000;

// Initialize Supabase client (mock for now - replace with real credentials)
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseKey = 'placeholder-key';
// Comment out Supabase for now to avoid connection errors
// const supabase = createClient(supabaseUrl, supabaseKey);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Admin login endpoint
app.post('/api/v1/auth/admin/login', (req, res) => {
  console.log('Admin login request:', req.body);
  
  const { email, password } = req.body;
  
  if (email === 'saurav@nandighoshbus.com') {
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        access_token: 'dummy_admin_token_12345',
        refresh_token: 'dummy_refresh_token_67890',
        user: {
          id: 1,
          email: 'saurav@nandighoshbus.com',
          role: 'admin',
          name: 'Admin User'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

console.log('⚠️  simple-server.js is DISABLED');
console.log('✅ Use TypeScript backend: cd backend && npm run dev');
