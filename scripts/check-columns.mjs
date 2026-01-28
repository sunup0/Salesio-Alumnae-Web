
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
    console.log("Checking alumnae table structure...")
    const { data, error } = await supabase.from('alumnae').select('*').limit(1)

    if (error) {
        console.error("Error fetching data:", error)
        return
    }

    if (!data || data.length === 0) {
        console.log("No data found in table. Cannot determine columns.")
        // Try inserting a dummy record with photo_url to see if it fails
        console.log("Attempting test insert...")
        const { error: insertError } = await supabase.from('alumnae').insert([{
            name: 'Schema Check',
            cohort: 999,
            photo_url: 'test'
        }])
        if (insertError) {
            console.error("Insert failed:", insertError.message)
        } else {
            console.log("Insert success! 'photo_url' column exists.")
            // Cleanup
            await supabase.from('alumnae').delete().eq('cohort', 999)
        }
        return
    }

    const firstRecord = data[0]
    console.log("Columns found:", Object.keys(firstRecord))

    if ('photo_url' in firstRecord) {
        console.log("✅ 'photo_url' column EXISTS.")
    } else {
        console.log("❌ 'photo_url' column is MISSING.")
    }
}

check()
