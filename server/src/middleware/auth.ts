import type { Request, Response, NextFunction } from 'express'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase'

export interface AuthedRequest extends Request {
  user?: User
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  console.log(user)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = user
  next()
}
