import { supabaseAdmin } from './supabase';

export interface QueryOptions {
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  affectedRows: number;
  insertId?: string | number;
}

// Find many records with optional filters and options
export const findMany = async (
  table: string, 
  filters: Record<string, any> = {}, 
  options: QueryOptions = {}
): Promise<any[]> => {
  try {
    let query = supabaseAdmin.from(table).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    // Apply ordering
    if (options.orderBy) {
      const direction = options.orderDirection === 'DESC' ? false : true;
      query = query.order(options.orderBy, { ascending: direction });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 100)) - 1);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error(`Error in findMany for table ${table}:`, error);
    throw error;
  }
};

// Find one record by filters
export const findOne = async (
  table: string, 
  filters: Record<string, any>
): Promise<any | null> => {
  try {
    let query = supabaseAdmin.from(table).select('*');

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Database query failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error(`Error in findOne for table ${table}:`, error);
    throw error;
  }
};

// Insert one record
export const insertOne = async (
  table: string, 
  data: Record<string, any>
): Promise<QueryResult> => {
  try {
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    return {
      affectedRows: 1,
      insertId: result?.id || result?.uuid || null
    };
  } catch (error) {
    console.error(`Error in insertOne for table ${table}:`, error);
    throw error;
  }
};

// Update one record
export const updateOne = async (
  table: string, 
  data: Record<string, any>, 
  filters: Record<string, any>
): Promise<QueryResult> => {
  try {
    let query = supabaseAdmin.from(table).update(data);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data: result, error, count } = await query.select('*');

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    return {
      affectedRows: count || (result?.length || 0)
    };
  } catch (error) {
    console.error(`Error in updateOne for table ${table}:`, error);
    throw error;
  }
};

// Delete one record
export const deleteOne = async (
  table: string, 
  filters: Record<string, any>
): Promise<QueryResult> => {
  try {
    let query = supabaseAdmin.from(table).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { error, count } = await query;

    if (error) {
      throw new Error(`Database delete failed: ${error.message}`);
    }

    return {
      affectedRows: count || 0
    };
  } catch (error) {
    console.error(`Error in deleteOne for table ${table}:`, error);
    throw error;
  }
};

// Execute custom query (for complex operations)
export const executeQuery = async (_query: string, _params: any[] = []): Promise<any> => {
  try {
    // Note: Supabase doesn't support raw SQL queries in the same way
    // This would need to be implemented using stored procedures or functions
    // For now, we'll throw an error to indicate this needs custom implementation
    throw new Error('Custom queries not implemented. Use specific database functions instead.');
  } catch (error) {
    console.error('Error in executeQuery:', error);
    throw error;
  }
};
