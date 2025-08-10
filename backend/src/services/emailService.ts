import nodemailer from 'nodemailer';

// Interface definitions
interface EmailData {
  [key: string]: string | number | boolean | undefined;
  html?: string;
  message?: string;
}

interface EmailOptions {
  to: string;
  subject?: string;
  template?: string;
  data?: EmailData;
  attachments?: any[];
}

interface BulkEmailOptions {
  subject: string;
  template?: string;
  data?: EmailData;
}

interface BulkRecipient {
  email: string;
  data?: EmailData;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BulkEmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailTemplate {
  subject: string;
  template: string;
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Email templates
const emailTemplates: Record<string, EmailTemplate> = {
  'agent-email-verification': {
    subject: 'Verify Your Email - Nandighosh Bus Service Agent Registration',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nandighosh Bus Service" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #2563eb; text-align: center;">Email Verification Required</h1>
        
        <p>Dear {{fullName}},</p>
        
        <p>Thank you for registering as an agent with Nandighosh Bus Service. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationLink}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If you can't click the button, please copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #666;">{{verificationLink}}</p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>If you didn't request this registration, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent by Nandighosh Bus Service<br>
          If you have any questions, please contact us at support@nandighosh.com
        </p>
      </div>
    `
  },

  'agent-approval': {
    subject: 'Agent Registration Approved - Welcome to Nandighosh Bus Service!',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nandighosh Bus Service" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #16a34a; text-align: center;">🎉 Registration Approved!</h1>
        
        <p>Dear {{fullName}},</p>
        
        <p>Congratulations! Your agent registration with Nandighosh Bus Service has been approved.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2563eb; margin-top: 0;">Your Agent Details:</h3>
          <p><strong>Agent Code:</strong> {{agentCode}}</p>
          <p><strong>Status:</strong> Active</p>
        </div>
        
        <p>You can now log in to your agent dashboard using your email and password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" style="background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Dashboard
          </a>
        </div>
        
        <h3>Next Steps:</h3>
        <ul>
          <li>Complete your profile information</li>
          <li>Upload any remaining required documents</li>
          <li>Review the agent guidelines and policies</li>
          <li>Start managing bus routes and bookings</li>
        </ul>
        
        <p>Welcome to the Nandighosh Bus Service family! We look forward to working with you.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent by Nandighosh Bus Service<br>
          If you have any questions, please contact us at support@nandighosh.com
        </p>
      </div>
    `
  },

  'agent-rejection': {
    subject: 'Agent Registration Status Update - Nandighosh Bus Service',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nandighosh Bus Service" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #dc2626; text-align: center;">Registration Status Update</h1>
        
        <p>Dear {{fullName}},</p>
        
        <p>Thank you for your interest in becoming an agent with Nandighosh Bus Service. After careful review, we regret to inform you that your registration application has not been approved at this time.</p>
        
        {{#if reason}}
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #dc2626; margin-top: 0;">Reason:</h3>
          <p>{{reason}}</p>
        </div>
        {{/if}}
        
        <p>We encourage you to review the requirements and consider reapplying in the future. If you believe this decision was made in error or if you have additional information that might affect this decision, please don't hesitate to contact us.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:{{supportEmail}}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Contact Support
          </a>
        </div>
        
        <p>Thank you for your understanding.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This email was sent by Nandighosh Bus Service<br>
          If you have any questions, please contact us at {{supportEmail}}
        </p>
      </div>
    `
  },

  'admin-registration-notification': {
    subject: 'New Agent Registration Request - Admin Action Required',
    template: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.FRONTEND_URL}/images/logo.png" alt="Nandighosh Bus Service" style="max-height: 60px;">
        </div>
        
        <h1 style="color: #f59e0b; text-align: center;">⚠️ New Agent Registration</h1>
        
        <p>Hello Admin,</p>
        
        <p>A new agent registration request has been submitted and requires your review.</p>
        
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #f59e0b; margin-top: 0;">Registration Details:</h3>
          <p><strong>Name:</strong> {{fullName}}</p>
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Phone:</strong> {{phone}}</p>
          <p><strong>Branch Location:</strong> {{branchLocation}}</p>
          <p><strong>Experience:</strong> {{experienceYears}} years</p>
          <p><strong>Registration Date:</strong> {{registrationDate}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{adminDashboardUrl}}" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Registration
          </a>
        </div>
        
        <p>Please log in to the admin dashboard to review the application and supporting documents.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated notification from Nandighosh Bus Service Admin System
        </p>
      </div>
    `
  }
};

/**
 * Replace template variables with actual data
 */
function replaceTemplateVariables(template: string, data: EmailData): string {
  let result = template;
  
  // Simple variable replacement
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(data[key] || ''));
  });

  // Handle conditional blocks (simplified Handlebars-like syntax)
  result = result.replace(/{{#if (\w+)}}(.*?){{\/if}}/gs, (_match, condition, content) => {
    return data[condition] ? content : '';
  });

  return result;
}

/**
 * Send email using the configured transporter
 */
export async function sendEmail({ to, subject, template, data = {}, attachments = [] }: EmailOptions): Promise<EmailResult> {
  try {
    let htmlContent = '';
    let emailSubject = subject || '';

    // Use template if provided
    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      htmlContent = replaceTemplateVariables(templateData.template, data);
      emailSubject = templateData.subject;
    } else if (data.html) {
      htmlContent = data.html;
    } else {
      htmlContent = `<p>${data.message || 'No content provided'}</p>`;
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Nandighosh Bus Service'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailSubject,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send notification email to multiple recipients
 */
export async function sendBulkEmail(recipients: BulkRecipient[], options: BulkEmailOptions): Promise<BulkEmailResult[]> {
  const results: BulkEmailResult[] = [];
  const { subject, template, data = {} } = options;

  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject,
        ...(template && { template }),
        data: {
          ...data,
          ...recipient.data // Allow per-recipient data
        }
      });
      
      results.push({
        email: recipient.email,
        success: true,
        ...(result.messageId && { messageId: result.messageId })
      });
    } catch (error: any) {
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Send system notification emails to admins
 */
export async function notifyAdmins(subject: string, _message: string, data: EmailData = {}): Promise<BulkEmailResult[]> {
  try {
    // This should be called from a context where you have access to the database
    // For now, we'll use environment variables for admin emails
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured for notifications');
      return [];
    }

    const recipients = adminEmails.map(email => ({
      email: email.trim(),
      data
    }));

    return await sendBulkEmail(recipients, {
      subject,
      template: 'admin-registration-notification',
      data
    });

  } catch (error) {
    console.error('Failed to notify admins:', error);
    throw error;
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
}

/**
 * Test email sending
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  try {
    return await sendEmail({
      to,
      subject: 'Test Email from Nandighosh Bus Service',
      data: {
        html: `
          <h1>Test Email</h1>
          <p>This is a test email to verify the email configuration.</p>
          <p>If you received this, the email system is working correctly!</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      }
    });
  } catch (error) {
    console.error('Test email failed:', error);
    throw error;
  }
}
