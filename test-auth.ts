import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gepveswygczjgcdnnxhy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcHZlc3d5Z2N6amdjZG5ueGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ0NjIsImV4cCI6MjA4ODQ4MDQ2Mn0.T47H0pJuBPEmXuEJjfxLCkyHFcjytxS0XZPdGhsnwSM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testFetchAsUser() {
    console.log("Creating dummy user...")
    const email = `testuser_${Date.now()}@example.com`
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'TestPassword123'
    })

    if (authError) {
        console.error("Auth Error:", authError)
        return
    }

    console.log("Logged in as user:", authData.user?.id)

    const dateString = '2026-04-01'
    const startOfDay = new Date(`${dateString}T00:00:00`)
    const endOfDay = new Date(`${dateString}T23:59:59`)

    console.log("Fetching availabilities...")
    const { data: availabilities, error: availError } = await supabase
        .from('availability')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())

    if (availError) {
        console.error("availError:", availError)
    } else {
        console.log("availabilities:", availabilities?.length)
    }

    console.log("Fetching appointments...")
    const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('date_time, status, service_id, services(duration)')
        .in('status', ['PENDING', 'CONFIRMED'])
        .gte('date_time', startOfDay.toISOString())
        .lte('date_time', endOfDay.toISOString())

    if (apptError) {
        console.error("apptError:", apptError)
    } else {
        console.log("appointments:", appointments?.length)
    }
}

testFetchAsUser()
