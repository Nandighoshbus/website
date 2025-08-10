import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Database middleware to attach Supabase client to request
export const databaseMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.db = supabaseAdmin;
  next();
};

export default supabaseAdmin;
