import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_default';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_default';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export const sendContactEmail = async (formData: ContactFormData): Promise<{ success: boolean; message: string }> => {
  try {
    // Prepare template parameters for EmailJS
    const templateParams = {
      from_name: `${formData.firstName} ${formData.lastName}`,
      from_email: formData.email,
      phone: formData.phone,
      message: formData.message,
      to_email: 'hello@nandighoshbus.com',
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      reply_to: formData.email,
      // Additional context
      submitted_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      website: 'Nandighosh Bus Service'
    };

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      return {
        success: true,
        message: 'Message sent successfully! We will get back to you soon.'
      };
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error: any) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly.'
    };
  }
};

// Fallback email function using mailto (opens user's email client)
export const sendEmailFallback = (formData: ContactFormData): void => {
  const subject = encodeURIComponent(`Contact Form Submission from ${formData.firstName} ${formData.lastName}`);
  const body = encodeURIComponent(`
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
  `);

  const mailtoLink = `mailto:hello@nandighoshbus.com?subject=${subject}&body=${body}`;
  window.open(mailtoLink, '_blank');
};
