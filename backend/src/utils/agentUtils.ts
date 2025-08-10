import crypto from 'crypto';
import { PoolClient } from 'pg';

// Type definitions
interface AgentPerformanceMetrics {
  successRate: number;
  averageRating: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ActionResult {
  allowed: boolean;
  reason?: string;
}

interface AgentDashboardStats {
  total_bookings: number;
  successful_bookings: number;
  rating: number;
  status: string;
  documents_verified: boolean;
  background_check_status: string;
  training_completed: boolean;
  joined_at: Date;
  last_active_at: Date;
  recent_bookings: number;
  pending_documents: number;
  unread_notifications: number;
  performance: AgentPerformanceMetrics;
}

interface AgentRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  branchLocation: string;
  address: string;
  emergencyContact: string;
  experienceYears?: number;
}

interface Agent {
  id: string;
  status: string;
  documents_verified: boolean;
  background_check_status: string;
  training_completed: boolean;
  [key: string]: any;
}

interface NotificationData {
  fullName?: string;
  email?: string;
  agentCode?: string;
  reason?: string;
  documentType?: string;
}

/**
 * Generate a unique agent code
 * Format: AGT-YYYY-XXXXX (e.g., AGT-2025-00001)
 */
export async function generateAgentCode(client: PoolClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AGT-${year}-`;
  
  // Get the latest agent code for this year
  const result = await client.query(`
    SELECT agent_code FROM agents 
    WHERE agent_code LIKE $1 
    ORDER BY agent_code DESC 
    LIMIT 1
  `, [`${prefix}%`]);

  let nextNumber = 1;
  
  if (result.rows.length > 0) {
    const lastCode = result.rows[0].agent_code;
    const lastNumber = parseInt(lastCode.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  const agentCode = `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  return agentCode;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate agent document types
 */
export function validateDocumentType(documentType: string): boolean {
  const allowedTypes = ['profile_photo', 'id_proof', 'license', 'experience_certificate'];
  return allowedTypes.includes(documentType);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.'));
}

/**
 * Check if file type is allowed for agent documents
 */
export function isAllowedFileType(filename: string): boolean {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const extension = getFileExtension(filename).toLowerCase();
  return allowedExtensions.includes(extension);
}

/**
 * Calculate agent performance metrics
 */
export function calculatePerformanceMetrics(
  totalBookings: number,
  successfulBookings: number,
  totalRating: number,
  ratingCount: number
): AgentPerformanceMetrics {
  const successRate = totalBookings > 0 ? (successfulBookings / totalBookings) * 100 : 0;
  const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
  
  return {
    successRate: Math.round(successRate * 100) / 100,
    averageRating: Math.round(averageRating * 100) / 100
  };
}

/**
 * Format agent status for display
 */
export function formatAgentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending Approval',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'under_review': 'Under Review',
    'active': 'Active',
    'inactive': 'Inactive',
    'suspended': 'Suspended',
    'terminated': 'Terminated'
  };
  
  return statusMap[status] || status;
}

/**
 * Validate agent registration data
 */
export function validateAgentRegistration(data: AgentRegistrationData): ValidationResult {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields: (keyof AgentRegistrationData)[] = [
    'fullName', 'email', 'phone', 'password',
    'branchLocation', 'address', 'emergencyContact'
  ];

  requiredFields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Phone format validation (Indian phone numbers)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\D/g, '').slice(-10))) {
    errors.push('Invalid phone number format');
  }

  // Password strength validation
  if (data.password) {
    if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(data.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one number');
    }
  }

  // Experience years validation
  if (data.experienceYears !== undefined) {
    const exp = parseInt(data.experienceYears.toString());
    if (isNaN(exp) || exp < 0 || exp > 50) {
      errors.push('Experience years must be a number between 0 and 50');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate notification message for different events
 */
export function generateNotificationMessage(type: string, data: NotificationData): string {
  const messages: Record<string, string> = {
    'registration_request': `New agent registration request from ${data.fullName} (${data.email})`,
    'approval': `Congratulations! Your agent registration has been approved. Your agent code is: ${data.agentCode}`,
    'rejection': `Your agent registration has been rejected. ${data.reason ? 'Reason: ' + data.reason : ''}`,
    'document_verification_required': `Document verification required for ${data.documentType}`,
    'document_approved': `Your ${data.documentType} has been approved`,
    'document_rejected': `Your ${data.documentType} has been rejected. ${data.reason ? 'Reason: ' + data.reason : ''}`
  };

  return messages[type] || 'New notification';
}

/**
 * Check if agent can perform certain actions based on status and verification
 */
export function canAgentPerformAction(agent: Agent, action: string): ActionResult {
  const { status } = agent;

  // Agent must be active
  if (status !== 'active') {
    return { allowed: false, reason: 'Agent account is not active' };
  }

  const actionRequirements: Record<string, string[]> = {
    'create_booking': ['documents_verified'],
    'manage_routes': ['documents_verified', 'training_completed'],
    'handle_payments': ['documents_verified', 'background_check_status:approved', 'training_completed'],
    'access_dashboard': [],
    'update_profile': []
  };

  const requirements = actionRequirements[action] || [];

  for (const requirement of requirements) {
    if (requirement.includes(':')) {
      const parts = requirement.split(':');
      const field = parts[0];
      const value = parts[1];
      if (field && value && agent[field] !== value) {
        return { 
          allowed: false, 
          reason: `${field.replace('_', ' ')} must be ${value}` 
        };
      }
    } else {
      if (!agent[requirement]) {
        return { 
          allowed: false, 
          reason: `${requirement.replace('_', ' ')} is required` 
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Get agent dashboard statistics
 */
export async function getAgentDashboardStats(client: PoolClient, agentId: string): Promise<AgentDashboardStats> {
  try {
    // Get basic stats
    const statsResult = await client.query(`
      SELECT 
        total_bookings,
        successful_bookings,
        rating,
        status,
        documents_verified,
        background_check_status,
        training_completed,
        joined_at,
        last_active_at
      FROM agents 
      WHERE id = $1
    `, [agentId]);

    if (statsResult.rows.length === 0) {
      throw new Error('Agent not found');
    }

    const agent = statsResult.rows[0];

    // Get recent bookings count (last 30 days)
    const recentBookingsResult = await client.query(`
      SELECT COUNT(*) as recent_bookings
      FROM bookings b
      JOIN agents a ON b.agent_id = a.id
      WHERE a.id = $1 AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [agentId]);

    // Get pending documents count
    const pendingDocsResult = await client.query(`
      SELECT COUNT(*) as pending_documents
      FROM agent_documents
      WHERE agent_id = (SELECT id FROM agents WHERE id = $1)
      AND verification_status = 'pending'
    `, [agentId]);

    // Get notifications count
    const notificationsResult = await client.query(`
      SELECT COUNT(*) as unread_notifications
      FROM notifications
      WHERE recipient_id = (SELECT user_id FROM agents WHERE id = $1)
      AND is_read = FALSE
    `, [agentId]);

    return {
      ...agent,
      recent_bookings: parseInt(recentBookingsResult.rows[0].recent_bookings) || 0,
      pending_documents: parseInt(pendingDocsResult.rows[0].pending_documents) || 0,
      unread_notifications: parseInt(notificationsResult.rows[0].unread_notifications) || 0,
      performance: calculatePerformanceMetrics(
        agent.total_bookings || 0,
        agent.successful_bookings || 0,
        agent.rating || 0,
        1 // Assuming single rating for now
      )
    };

  } catch (error) {
    console.error('Error getting agent dashboard stats:', error);
    throw error;
  }
}
