import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const getEmailTemplate = (type: 'verification' | 'welcome' | 'booking_confirmation' | 'password_reset' | 'booking_cancellation' | 'agent_approval') => {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #FF6B35; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; background-color: #f9f9f9; }
      .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
      .button { display: inline-block; background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
      .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #FF6B35; }
      .highlight { color: #FF6B35; font-weight: bold; }
    </style>
  `;

  const templates = {
    verification: {
      subject: 'Verify Your Email - Nandighosh Bus Service',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🚌 Nandighosh Bus Service</h1>
            <h2>Welcome Aboard!</h2>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Thank you for registering with Nandighosh Bus Service! We're excited to have you on board.</p>
            <p>To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Safe travels!<br>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
            <p>Your trusted travel partner across Odisha</p>
          </div>
        </div>
      `
    },
    welcome: {
      subject: 'Welcome to Nandighosh Bus Service!',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🚌 Welcome to Nandighosh!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Your email has been verified successfully! Welcome to the Nandighosh Bus Service family.</p>
            <p>Here's what you can do now:</p>
            <ul>
              <li>🔍 Search and book bus tickets across Odisha</li>
              <li>📱 Manage your bookings and travel history</li>
              <li>🎫 Get instant e-tickets and boarding passes</li>
              <li>💰 Enjoy special offers and discounts</li>
            </ul>
            <p style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Start Booking Now</a>
            </p>
            <p>Need help? Our customer support team is available 24/7.</p>
            <p>Happy travels!<br>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
          </div>
        </div>
      `
    },
    booking_confirmation: {
      subject: 'Booking Confirmed - Your Journey with Nandighosh',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🎫 Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${data.passengerName},</p>
            <p>Great news! Your bus booking has been confirmed. Here are your booking details:</p>
            
            <div class="booking-details">
              <h3>📋 Booking Information</h3>
              <p><strong>Booking Reference:</strong> <span class="highlight">${data.bookingReference}</span></p>
              <p><strong>Journey Date:</strong> ${data.journeyDate}</p>
              <p><strong>Route:</strong> ${data.source} ➤ ${data.destination}</p>
              <p><strong>Departure:</strong> ${data.departureTime} from ${data.boardingPoint}</p>
              <p><strong>Arrival:</strong> ${data.arrivalTime} at ${data.droppingPoint}</p>
              <p><strong>Bus:</strong> ${data.busName} (${data.busNumber})</p>
              <p><strong>Seats:</strong> ${data.seatNumbers.join(', ')}</p>
              <p><strong>Total Amount:</strong> <span class="highlight">₹${data.totalAmount}</span></p>
            </div>

            <div class="booking-details">
              <h3>👥 Passenger Details</h3>
              ${data.passengers.map((passenger: any, index: number) => `
                <p><strong>Passenger ${index + 1}:</strong> ${passenger.name} (Seat ${passenger.seatNumber})</p>
              `).join('')}
            </div>

            <div class="booking-details">
              <h3>📞 Contact Information</h3>
              <p><strong>Phone:</strong> ${data.contactPhone}</p>
              <p><strong>Email:</strong> ${data.contactEmail}</p>
            </div>

            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please arrive at the boarding point at least 15 minutes before departure</li>
              <li>Carry a valid ID proof during travel</li>
              <li>Show this email or SMS confirmation to the conductor</li>
              <li>For cancellations, check our cancellation policy</li>
            </ul>

            <p>Have a safe and comfortable journey!</p>
            <p>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
            <p>For support: support@nandighosh.com | 1800-XXX-XXXX</p>
          </div>
        </div>
      `
    },
    password_reset: {
      subject: 'Reset Your Password - Nandighosh Bus Service',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>We received a request to reset your password for your Nandighosh Bus Service account.</p>
            <p>Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, never share this link with anyone.</p>
            <p>Best regards,<br>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
          </div>
        </div>
      `
    },
    booking_cancellation: {
      subject: 'Booking Cancelled - Nandighosh Bus Service',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>❌ Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${data.passengerName},</p>
            <p>Your booking has been cancelled successfully.</p>
            
            <div class="booking-details">
              <h3>📋 Cancelled Booking Details</h3>
              <p><strong>Booking Reference:</strong> <span class="highlight">${data.bookingReference}</span></p>
              <p><strong>Journey Date:</strong> ${data.journeyDate}</p>
              <p><strong>Route:</strong> ${data.source} ➤ ${data.destination}</p>
              <p><strong>Cancellation Date:</strong> ${data.cancellationDate}</p>
              <p><strong>Refund Amount:</strong> <span class="highlight">₹${data.refundAmount}</span></p>
            </div>

            <p><strong>Refund Information:</strong></p>
            <ul>
              <li>Refund will be processed within 5-7 business days</li>
              <li>Amount will be credited to your original payment method</li>
              <li>You will receive a separate notification once refund is processed</li>
            </ul>

            <p>Thank you for choosing Nandighosh Bus Service.</p>
            <p>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
            <p>For support: support@nandighosh.com | 1800-XXX-XXXX</p>
          </div>
        </div>
      `
    },
    agent_approval: {
      subject: 'Agent Application Approved - Welcome to Nandighosh Bus Service',
      html: (data: any) => `
        ${baseStyle}
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>Your Agent Application is Approved</h2>
          </div>
          <div class="content">
            <p>Dear ${data.name},</p>
            <p>Great news! Your application to become an agent with Nandighosh Bus Service has been <strong class="highlight">approved</strong>!</p>
            
            <div class="booking-details">
              <h3>🏢 Your Agent Details</h3>
              <p><strong>Agent Code:</strong> <span class="highlight">${data.agentCode}</span></p>
              <p><strong>Business Name:</strong> ${data.businessName}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Commission Rate:</strong> ${data.commissionRate}%</p>
            </div>

            <div class="booking-details">
              <h3>🔐 Login Credentials</h3>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Password:</strong> ${data.password}</p>
              <p><em>Please change your password after first login for security.</em></p>
            </div>

            <p style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Login to Agent Dashboard</a>
            </p>

            <p><strong>What's Next?</strong></p>
            <ul>
              <li>🚀 Access your agent dashboard</li>
              <li>📊 Start managing bookings and customers</li>
              <li>💰 Track your commissions and earnings</li>
              <li>📱 Use our agent tools and resources</li>
            </ul>

            <p><strong>Need Help?</strong></p>
            <p>Our support team is here to help you get started. Contact us at support@nandighosh.com or call our agent helpline.</p>

            <p>Welcome to the Nandighosh family!</p>
            <p>Best regards,<br>The Nandighosh Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Nandighosh Bus Service. All rights reserved.</p>
            <p>Agent Support: agent-support@nandighosh.com | 1800-XXX-XXXX</p>
          </div>
        </div>
      `
    }
  };

  return templates[type];
};

// Send verification email
export const sendVerificationEmail = async (email: string, name: string, verificationToken: string): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new AppError('Email service not configured', 500, 'EMAIL_CONFIG_ERROR');
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('verification');
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html({ name, verificationUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new AppError('Failed to send verification email', 500, 'EMAIL_SEND_ERROR');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return; // Don't throw error for welcome email
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('welcome');
  
  const loginUrl = `${process.env.FRONTEND_URL}/signin`;
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html({ name, loginUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new AppError('Email service not configured', 500, 'EMAIL_CONFIG_ERROR');
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('password_reset');
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html({ name, resetUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new AppError('Failed to send password reset email', 500, 'EMAIL_SEND_ERROR');
  }
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (bookingData: any): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return; // Don't throw error for booking confirmation
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('booking_confirmation');
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: bookingData.contactEmail,
    subject: template.subject,
    html: template.html(bookingData)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to ${bookingData.contactEmail}`);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }
};

// Send booking cancellation email
export const sendBookingCancellationEmail = async (cancellationData: any): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return; // Don't throw error for cancellation email
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('booking_cancellation');
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: cancellationData.contactEmail,
    subject: template.subject,
    html: template.html(cancellationData)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking cancellation email sent to ${cancellationData.contactEmail}`);
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
  }
};

// Send agent approval email
export const sendAgentApprovalEmail = async (agentData: any): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email service not configured, skipping agent approval email');
    return; // Don't throw error for approval email
  }

  const transporter = createTransporter();
  const template = getEmailTemplate('agent_approval');
  
  const loginUrl = `${process.env.FRONTEND_URL}/agent/login`;
  
  const mailOptions = {
    from: `"Nandighosh Bus Service" <${process.env.EMAIL_USER}>`,
    to: agentData.email,
    subject: template.subject,
    html: template.html({ ...agentData, loginUrl })
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Agent approval email sent to ${agentData.email}`);
  } catch (error) {
    console.error('Failed to send agent approval email:', error);
  }
};
