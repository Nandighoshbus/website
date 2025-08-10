import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth';
import { validateEmail, validatePhone, sanitizeInput } from '../utils/validation';
import { sendEmail } from '../services/emailService';

const router = express.Router();

// Middleware to require admin role
const requireAdmin = authorize('admin', 'super_admin');

// POST /api/agents/register - Agent registration request
router.post('/register', async (req: Request, res: Response) => {
  console.log('Agent registration request received:', req.body);
  
  try {
    if (!req.db) {
      console.error('Database connection not available on request object');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    console.log('Supabase client available');
    
    const {
      fullName,
      email,
      phone,
      password,
      branch,
      customBranch,
      address,
      emergencyContact,
      experience,
      dateOfJoining
    } = req.body;

    // Validation
    if (!validateEmail(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!validatePhone(phone)) {
      res.status(400).json({ error: 'Invalid phone number format' });
      return;
    }

    if (!fullName || !password || !address || !emergencyContact || !dateOfJoining) {
      res.status(400).json({ error: 'Please fill in all required fields' });
      return;
    }

    // Check if email already exists in agent_registrations table
    const { data: existingRegistrations, error: checkError } = await req.db
      .from('agent_registrations')
      .select('id')
      .eq('email', email);

    if (checkError) {
      console.error('Database check error:', checkError);
      return res.status(500).json({ error: 'Database error during email check' });
    }

    if (existingRegistrations && existingRegistrations.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = jwt.sign(
      { email, type: 'email_verification' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Determine actual branch location
    const actualBranch = branch === 'other' ? customBranch : branch;

    // Insert registration request
    const { data: registrationResult, error: insertError } = await req.db
      .from('agent_registrations')
      .insert([{
        full_name: sanitizeInput(fullName),
        email: email,
        phone: phone,
        password_hash: passwordHash,
        branch_location: actualBranch,
        custom_branch: branch === 'other' ? customBranch : null,
        address: sanitizeInput(address),
        emergency_contact: emergencyContact,
        experience_years: experience ? parseInt(experience) : null,
        expected_joining_date: dateOfJoining,
        email_verification_token: emailVerificationToken,
        registration_ip: req.ip,
        status: 'pending',
        email_verified: false
      }])
      .select('id');

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create registration request' });
    }

    if (!registrationResult || registrationResult.length === 0) {
      return res.status(500).json({ error: 'Failed to create registration request' });
    }

    const registrationId = registrationResult[0]!.id;

    // Send verification email
    try {
      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
      await sendEmail({
        to: email,
        template: 'agent-email-verification',
        data: {
          fullName,
          verificationLink
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      message: 'Registration request submitted successfully. Please check your email to verify your account.',
      registrationId,
      requiresEmailVerification: true
    });
  
  } catch (connectionError) {
    console.error('Database connection error:', connectionError);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// POST /api/agents/verify-email - Verify email address
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Update registration
    const { data: updateResult, error: updateError } = await req.db!
      .from('agent_registrations')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', decoded.email)
      .eq('email_verification_token', token)
      .select('id, full_name, email');

    if (updateError) {
      console.error('Email verification update error:', updateError);
      return res.status(500).json({ error: 'Email verification failed' });
    }

    if (!updateResult || updateResult.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({
      message: 'Email verified successfully',
      verified: true
    });

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// GET /api/agents/registration-status/:id - Get registration status
router.get('/registration-status/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: registration, error } = await req.db!
      .from('agent_registrations')
      .select('id, status, admin_notes, email_verified, created_at, reviewed_at')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Registration status fetch error:', error);
      return res.status(500).json({ error: 'Failed to get registration status' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get registration status' });
  }
});

// Admin routes
// GET /api/agents/pending - Get all pending registrations (Admin only)
router.get('/pending', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const offset = (pageNum - 1) * limitNum;

    // Get registrations with pagination
    const { data: registrations, error: fetchError } = await req.db!
      .from('agent_registrations')
      .select(`
        id, full_name, email, phone, branch_location, custom_branch,
        experience_years, expected_joining_date, status, email_verified, created_at
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    if (fetchError) {
      console.error('Fetch registrations error:', fetchError);
      return res.status(500).json({ error: 'Failed to get pending registrations' });
    }

    // Get total count
    const { count, error: countError } = await req.db!
      .from('agent_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);

    if (countError) {
      console.error('Count error:', countError);
      return res.status(500).json({ error: 'Failed to get registration count' });
    }

    const total = count || 0;

    res.json({
      registrations: registrations || [],
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Get pending registrations error:', error);
    res.status(500).json({ error: 'Failed to get pending registrations' });
  }
});

// GET /api/agents/registration/:id - Get registration details (Admin only)
router.get('/registration/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: registration, error } = await req.db!
      .from('agent_registrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get registration details error:', error);
      return res.status(500).json({ error: 'Failed to get registration details' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({
      registration
    });

  } catch (error) {
    console.error('Get registration details error:', error);
    res.status(500).json({ error: 'Failed to get registration details' });
  }
});

// POST /api/agents/approve/:id - Approve registration (Admin only)
router.post('/approve/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = (req as any).user.id;

    // Get registration details
    const { data: registration, error: fetchError } = await req.db!
      .from('agent_registrations')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      console.error('Registration fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch registration' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Pending registration not found' });
    }

    // Generate unique agent code for future use
    const agentCode = `AGT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Update registration status
    const { error: updateError } = await req.db!
      .from('agent_registrations')
      .update({
        status: 'approved',
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        agent_code: agentCode
      })
      .eq('id', id);

    if (updateError) {
      console.error('Registration update error:', updateError);
      return res.status(500).json({ error: 'Failed to approve registration' });
    }

    // Log admin action (if admin_actions table exists)
    try {
      await req.db!
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'approve_agent',
          target_table: 'agent_registrations',
          target_id: id,
          new_values: JSON.stringify({ status: 'approved', agent_code: agentCode }),
          reason: adminNotes,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.warn('Admin action logging failed (table may not exist):', logError);
    }

    // Send approval email
    try {
      await sendEmail({
        to: registration.email,
        subject: 'Agent Registration Approved - Welcome to Nandighosh Bus Service!',
        template: 'agent-approval',
        data: {
          fullName: registration.full_name,
          agentCode,
          loginUrl: `${process.env.FRONTEND_URL}/agents/login`
        }
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({
      message: 'Registration approved successfully',
      agentCode,
      registrationId: id
    });

  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

// POST /api/agents/reject/:id - Reject registration (Admin only)
router.post('/reject/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes, reason } = req.body;
    const adminId = (req as any).user.id;

    // Get registration details
    const { data: registration, error: fetchError } = await req.db!
      .from('agent_registrations')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single();

    if (fetchError) {
      console.error('Registration fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch registration' });
    }

    if (!registration) {
      return res.status(404).json({ error: 'Pending registration not found' });
    }

    // Update registration status
    const { error: updateError } = await req.db!
      .from('agent_registrations')
      .update({
        status: 'rejected',
        admin_notes: adminNotes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Registration update error:', updateError);
      return res.status(500).json({ error: 'Failed to reject registration' });
    }

    // Log admin action (if admin_actions table exists)
    try {
      await req.db!
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'reject_agent',
          target_table: 'agent_registrations',
          target_id: id,
          old_values: JSON.stringify({ status: 'pending' }),
          new_values: JSON.stringify({ status: 'rejected' }),
          reason: reason || adminNotes,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.warn('Admin action logging failed (table may not exist):', logError);
    }

    // Send rejection email
    try {
      await sendEmail({
        to: registration.email,
        subject: 'Agent Registration Status Update - Nandighosh Bus Service',
        template: 'agent-rejection',
        data: {
          fullName: registration.full_name,
          reason: reason || adminNotes,
          supportEmail: process.env.SUPPORT_EMAIL
        }
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({ message: 'Registration rejected successfully' });

  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
});

export default router;
