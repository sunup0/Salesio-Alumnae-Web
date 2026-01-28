
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
    console.log("Checking for archive_photos table...")
    const { data, error } = await supabase.from('archive_photos').select('*').limit(1)

    if (error) {
        if (error.code === '42P01') { // relation does not exist
            console.log("✅ Table 'archive_photos' does NOT exist. Safe to create.")
        } else {
            console.error("❌ Error checking table:", error)
        }
    } else {
        console.log("⚠️ Table 'archive_photos' ALREADY EXISTS.")
        console.log("Columns:", Object.keys(data[0] || {}))
    }
}

check()
