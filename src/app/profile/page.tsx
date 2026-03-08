import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get the user's name and DOB from our users table
    const { data: userProfile } = await supabase
        .from('users')
        .select('name, email, date_of_birth')
        .eq('id', user.id)
        .single()

    // Get user's appointments
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            date_time,
            status,
            services:service_id(name, duration)
        `)
        .eq('user_id', user.id)
        .order('date_time', { ascending: false })

    return (
        <div className="container px-4 py-8 mx-auto max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                    Mi Perfil
                </h1>
                <p className="text-muted-foreground mt-2">
                    Actualiza tu información personal
                </p>
            </div>

            <ProfileForm
                initialName={userProfile?.name || ''}
                email={userProfile?.email || user.email || ''}
                dob={userProfile?.date_of_birth || ''}
                appointments={appointments || []}
            />
        </div>
    )
}
