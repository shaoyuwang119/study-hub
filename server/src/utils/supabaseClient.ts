import { createClient } from '@supabase/supabase-js'
import type { AuthedRequest } from '@/middleware/auth'

function getRequestScopedClient(req: AuthedRequest) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: req.headers.authorization! } } }
  )
}

export { getRequestScopedClient }
