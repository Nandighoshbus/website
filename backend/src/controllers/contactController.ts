import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

// Contact form submission interface
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

// Validate contact form data
const validateContactForm = (data: ContactFormData): string[] => {
  const errors: string[] = [];

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Invalid phone number format');
  }

  if (!data.message?.trim()) {
    errors.push('Message is required');
  } else if (data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  return errors;
};

// Send contact form email (mock implementation)
const sendContactEmail = async (formData: ContactFormData): Promise<void> => {
  // In a real implementation, you would use an email service like:
  // - NodeMailer with SMTP
  // - SendGrid
  // - AWS SES
  // - Mailgun
  
  const emailContent = `
    New Contact Form Submission - Nandighosh Bus Service
    
    From: ${formData.firstName} ${formData.lastName}
    Email: ${formData.email}
    Phone: ${formData.phone}
    
    Message:
    ${formData.message}
    
    Submitted at: ${new Date().toISOString()}
  `;

  // For now, we'll log the email content
  console.log('=== EMAIL TO SEND TO hello@nandighoshbus.com ===');
  console.log(emailContent);
  console.log('=== END EMAIL ===');

  // TODO: Implement actual email sending
  // Example with NodeMailer:
  /*
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@nandighoshbus.com',
    to: 'hello@nandighoshbus.com',
    subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
    text: emailContent,
    html: emailContent.replace(/\n/g, '<br>')
  });
  */
};

// Handle contact form submission
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const formData: ContactFormData = req.body;

    // Validate form data
    const validationErrors = validateContactForm(formData);
    if (validationErrors.length > 0) {
      throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    // Send email
    await sendContactEmail(formData);

    // Store in database (optional - for record keeping)
    // TODO: Implement database storage if needed
    /*
    await supabase.from('contact_submissions').insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      submitted_at: new Date().toISOString()
    });
    */

    const response: ApiResponse = {
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: {
        submittedAt: new Date().toISOString(),
        email: formData.email
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Contact form submission error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send your message. Please try again later.'
    });
  }
};

// Get contact information
export const getContactInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const contactInfo = {
      email: 'hello@nandighoshbus.com',
      phone: '+91 12345 67890',
      address: 'Balasore, Odisha, India',
      businessHours: '24/7 Service Available',
      socialMedia: {
        facebook: 'https://www.facebook.com/nandighoshbus',
        instagram: 'https://www.instagram.com/nandighoshbus',
        linkedin: 'https://www.linkedin.com/company/nandighoshbus'
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Contact information retrieved successfully',
      data: contactInfo
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to retrieve contact information'
    });
  }
};
