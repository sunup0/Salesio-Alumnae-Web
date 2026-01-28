
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function testFlow() {
    console.log("🚀 Starting Upload & Insert Test...")

    const bucketName = 'alumnae-photos'
    const fileName = `test-upload-${Date.now()}.txt`
    const fileBody = 'Hello Supabase'

    // 1. Test Upload
    console.log(`\n1. Attempting upload to '${bucketName}'...`)
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileBody, { upsert: true })

    if (uploadError) {
        console.error("❌ Upload Failed:", uploadError)
        return
    }
    console.log("✅ Upload Successful:", uploadData.path)

    // 2. Get URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName)

    console.log("✅ Generated Public URL:", publicUrl)

    // 3. Insert Record
    console.log("\n2. Attempting DB Insert with photo_url...")
    const testRecord = {
        name: 'Auto Test User',
        cohort: 999,
        photo_url: publicUrl,
        region: 'Test Region',
        tags: ['test']
    }

    const { data: insertData, error: insertError } = await supabase
        .from('alumnae')
        .insert([testRecord])
        .select()

    if (insertError) {
        console.error("❌ DB Insert Failed:", insertError)
        return
    }

    if (!insertData || insertData.length === 0) {
        console.error("❌ Insert returned no data!")
        return
    }

    const insertedUser = insertData[0]
    console.log("✅ Insert Successful. ID:", insertedUser.id)
    console.log("   Saved photo_url:", insertedUser.photo_url)

    // 4. Verification
    if (insertedUser.photo_url === publicUrl) {
        console.log("\n🎉 SUCCESS! Database saved the photo URL correctly.")
    } else {
        console.error("\n❌ FAILURE! Database saved:", insertedUser.photo_url, " Expected:", publicUrl)
    }

    // 5. Cleanup
    console.log("\n3. Cleaning up test data...")
    await supabase.from('alumnae').delete().eq('id', insertedUser.id)
    await supabase.storage.from(bucketName).remove([fileName])
    console.log("✅ Cleanup complete.")
}

testFlow()
