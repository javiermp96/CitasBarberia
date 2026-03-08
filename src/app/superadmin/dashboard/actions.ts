'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertSuperadmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')

    // Double check from our custom users table
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'SUPERADMIN') throw new Error('Not authorized as Superadmin')

    return supabase
}

export async function getAccessLogs(dateFilter?: string) {
    const supabase = await assertSuperadmin()

    let query = supabase
        .from('access_logs')
        .select(`
            id,
            action,
            created_at,
            users:user_id(name, email, role)
        `)
        .order('created_at', { ascending: false })

    if (dateFilter) {
        // Find logs that happened on this specific day
        const startOfDay = new Date(dateFilter)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(dateFilter)
        endOfDay.setHours(23, 59, 59, 999)

        query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
    }

    // Limits
    query = query.limit(500)

    const { data, error } = await query

    if (error) throw new Error(error.message)

    // Format the response to ensure `users` is an object, not an array
    const formattedData = data?.map(log => ({
        ...log,
        users: Array.isArray(log.users) ? log.users[0] : log.users
    }))

    return formattedData as any
}
