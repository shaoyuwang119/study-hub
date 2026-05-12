import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const result = dotenv.config()

console.log(result)
console.log(process.env.SUPABASE_URL)

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
