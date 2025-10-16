import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

/**
 * Get agent's credit balance and summary
 */
export const getAgentCreditBalance = async (req: Request, res: Response): Promise<void> => {
  const agentId = req.userId; // This is the agent ID from auth middleware

  if (!agentId) {
    throw new AppError('Agent authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    // Get agent credit information
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, agent_code, business_name, credit_balance, total_credits_received, total_credits_used, credit_limit, is_active')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.is_active) {
      throw new AppError('Agent account is inactive', 403, 'AGENT_INACTIVE');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Credit balance retrieved successfully',
      data: {
        agentId: agent.id,
        agentCode: agent.agent_code,
        businessName: agent.business_name,
        creditBalance: parseFloat(agent.credit_balance || '0'),
        totalCreditsReceived: parseFloat(agent.total_credits_received || '0'),
        totalCreditsUsed: parseFloat(agent.total_credits_used || '0'),
        creditLimit: parseFloat(agent.credit_limit || '0'),
        availableCredit: parseFloat(agent.credit_balance || '0')
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agent credit balance:', error);
    throw error;
  }
};

/**
 * Get agent's credit transaction history
 */
export const getAgentCreditTransactions = async (req: Request, res: Response): Promise<void> => {
  const agentId = req.userId;
  const { page = 1, limit = 20, type } = req.query;

  if (!agentId) {
    throw new AppError('Agent authentication required', 401, 'UNAUTHORIZED');
  }

  try {
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('agent_credit_transactions')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (type && ['credit', 'debit', 'refund', 'adjustment'].includes(type as string)) {
      query = query.eq('transaction_type', type);
    }

    const { data: transactions, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      throw new AppError(`Failed to fetch credit transactions: ${error.message}`, 500, 'DATABASE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Credit transactions retrieved successfully',
      data: transactions || [],
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    throw error;
  }
};

/**
 * Admin: Add credits to an agent
 */
export const addCreditsToAgent = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.userId;
  const userRole = req.userRole;
  const { agentId, amount, description, adminNotes } = req.body;

  // Check if user is admin
  if (!['admin', 'super_admin'].includes(userRole || '')) {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }

  if (!agentId || !amount || amount <= 0) {
    throw new AppError('Agent ID and valid amount are required', 400, 'INVALID_INPUT');
  }

  try {
    // Verify agent exists
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('id, agent_code, business_name, credit_balance, is_active')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
    }

    if (!agent.is_active) {
      throw new AppError('Cannot add credits to inactive agent', 400, 'AGENT_INACTIVE');
    }

    // Call the database function to add credits
    const { data: result, error: functionError } = await supabaseAdmin
      .rpc('add_agent_credit', {
        p_agent_id: agentId,
        p_amount: amount,
        p_admin_id: adminId,
        p_description: description || `Credits added by admin`,
        p_admin_notes: adminNotes || null
      });

    if (functionError) {
      console.error('Error calling add_agent_credit function:', functionError);
      throw new AppError(`Failed to add credits: ${functionError.message}`, 500, 'CREDIT_ADD_ERROR');
    }

    // Get updated agent balance
    const { data: updatedAgent } = await supabaseAdmin
      .from('agents')
      .select('credit_balance, total_credits_received')
      .eq('id', agentId)
      .single();

    const response: ApiResponse = {
      success: true,
      message: `Successfully added ₹${amount} credits to ${agent.business_name}`,
      data: {
        transactionId: result,
        agentId: agent.id,
        agentCode: agent.agent_code,
        businessName: agent.business_name,
        amountAdded: parseFloat(amount),
        previousBalance: parseFloat(agent.credit_balance || '0'),
        newBalance: parseFloat(updatedAgent?.credit_balance || '0'),
        totalCreditsReceived: parseFloat(updatedAgent?.total_credits_received || '0')
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error adding credits to agent:', error);
    throw error;
  }
};

/**
 * Admin: Get all agents with credit summary
 */
export const getAllAgentsCreditSummary = async (req: Request, res: Response): Promise<void> => {
  const userRole = req.userRole;
  const { page = 1, limit = 20, search } = req.query;

  // Check if user is admin
  if (!['admin', 'super_admin'].includes(userRole || '')) {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }

  try {
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('agents')
      .select(`
        id,
        agent_code,
        business_name,
        credit_balance,
        total_credits_received,
        total_credits_used,
        credit_limit,
        is_active,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`business_name.ilike.%${search}%,agent_code.ilike.%${search}%`);
    }

    const { data: agents, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      throw new AppError(`Failed to fetch agents: ${error.message}`, 500, 'DATABASE_ERROR');
    }

    // Format the data
    const formattedAgents = (agents || []).map(agent => ({
      id: agent.id,
      agentCode: agent.agent_code,
      businessName: agent.business_name,
      creditBalance: parseFloat(agent.credit_balance || '0'),
      totalCreditsReceived: parseFloat(agent.total_credits_received || '0'),
      totalCreditsUsed: parseFloat(agent.total_credits_used || '0'),
      creditLimit: parseFloat(agent.credit_limit || '0'),
      isActive: agent.is_active,
      createdAt: agent.created_at,
      updatedAt: agent.updated_at
    }));

    const response: ApiResponse = {
      success: true,
      message: 'Agents credit summary retrieved successfully',
      data: formattedAgents,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching agents credit summary:', error);
    throw error;
  }
};

/**
 * Admin: Get credit transactions for all agents or specific agent
 */
export const getAdminCreditTransactions = async (req: Request, res: Response): Promise<void> => {
  const userRole = req.userRole;
  const { page = 1, limit = 20, agentId, type } = req.query;

  // Check if user is admin
  if (!['admin', 'super_admin'].includes(userRole || '')) {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }

  try {
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('agent_credit_transactions')
      .select(`
        *,
        agent:agents(id, agent_code, business_name),
        admin:admin_id(id, full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (type && ['credit', 'debit', 'refund', 'adjustment'].includes(type as string)) {
      query = query.eq('transaction_type', type);
    }

    const { data: transactions, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      throw new AppError(`Failed to fetch credit transactions: ${error.message}`, 500, 'DATABASE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Credit transactions retrieved successfully',
      data: transactions || [],
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching admin credit transactions:', error);
    throw error;
  }
};

/**
 * Admin: Update agent credit limit
 */
export const updateAgentCreditLimit = async (req: Request, res: Response): Promise<void> => {
  const userRole = req.userRole;
  const { agentId, creditLimit } = req.body;

  // Check if user is admin
  if (!['admin', 'super_admin'].includes(userRole || '')) {
    throw new AppError('Admin access required', 403, 'FORBIDDEN');
  }

  if (!agentId || creditLimit === undefined || creditLimit < 0) {
    throw new AppError('Agent ID and valid credit limit are required', 400, 'INVALID_INPUT');
  }

  try {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .update({ credit_limit: creditLimit })
      .eq('id', agentId)
      .select('id, agent_code, business_name, credit_limit')
      .single();

    if (error || !agent) {
      throw new AppError('Failed to update credit limit', 500, 'UPDATE_ERROR');
    }

    const response: ApiResponse = {
      success: true,
      message: `Credit limit updated successfully for ${agent.business_name}`,
      data: {
        agentId: agent.id,
        agentCode: agent.agent_code,
        businessName: agent.business_name,
        newCreditLimit: parseFloat(agent.credit_limit || '0')
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating agent credit limit:', error);
    throw error;
  }
};

/**
 * Get credit statistics for dashboard
 */
export const getCreditStatistics = async (req: Request, res: Response): Promise<void> => {
  const userRole = req.userRole;
  const agentId = req.userId;

  try {
    if (['admin', 'super_admin'].includes(userRole || '')) {
      // Admin statistics - all agents
      const { data: stats } = await supabaseAdmin
        .from('agents')
        .select('credit_balance, total_credits_received, total_credits_used');

      const totalCreditBalance = stats?.reduce((sum, agent) => sum + parseFloat(agent.credit_balance || '0'), 0) || 0;
      const totalCreditsIssued = stats?.reduce((sum, agent) => sum + parseFloat(agent.total_credits_received || '0'), 0) || 0;
      const totalCreditsUsed = stats?.reduce((sum, agent) => sum + parseFloat(agent.total_credits_used || '0'), 0) || 0;

      // Get transaction counts
      const { data: transactions } = await supabaseAdmin
        .from('agent_credit_transactions')
        .select('transaction_type, amount');

      const creditTransactions = transactions?.filter(t => t.transaction_type === 'credit').length || 0;
      const debitTransactions = transactions?.filter(t => t.transaction_type === 'debit').length || 0;

      const response: ApiResponse = {
        success: true,
        message: 'Credit statistics retrieved successfully',
        data: {
          totalCreditBalance,
          totalCreditsIssued,
          totalCreditsUsed,
          creditTransactions,
          debitTransactions,
          activeAgents: stats?.length || 0
        }
      };

      res.status(200).json(response);
    } else {
      // Agent statistics - own data
      const { data: agent } = await supabaseAdmin
        .from('agents')
        .select('credit_balance, total_credits_received, total_credits_used')
        .eq('id', agentId)
        .single();

      const { data: transactions } = await supabaseAdmin
        .from('agent_credit_transactions')
        .select('transaction_type')
        .eq('agent_id', agentId);

      const creditTransactions = transactions?.filter(t => t.transaction_type === 'credit').length || 0;
      const debitTransactions = transactions?.filter(t => t.transaction_type === 'debit').length || 0;

      const response: ApiResponse = {
        success: true,
        message: 'Credit statistics retrieved successfully',
        data: {
          creditBalance: parseFloat(agent?.credit_balance || '0'),
          totalCreditsReceived: parseFloat(agent?.total_credits_received || '0'),
          totalCreditsUsed: parseFloat(agent?.total_credits_used || '0'),
          creditTransactions,
          debitTransactions
        }
      };

      res.status(200).json(response);
    }
  } catch (error) {
    console.error('Error fetching credit statistics:', error);
    throw error;
  }
};
