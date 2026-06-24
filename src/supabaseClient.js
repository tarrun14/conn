import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://glggpgrmioevcfbufdro.supabase.co"
const supabaseKey = "sb_publishable_hBwUiOEVph1ROFQOBPTLPg_V__WTX8-"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // THIS IS THE FIX:
    navigatorLock: false, 
    
    // Optional: If you use Next.js or auto-refresh, 
    // keep these on as well
    autoRefreshToken: true,
    persistSession: true,
  },
})