import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assertUserAuth } from '../services/api'
import { supabase } from '../lib/supabase'
import { ProfileForm } from '@/app/profile/profile-form'

export default function ProfilePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [profileData, setProfileData] = useState<any>(null)
    const [appointments, setAppointments] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const { user } = await assertUserAuth()

                // Fetch full profile info
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('name, email, date_of_birth')
                    .eq('id', user.id)
                    .single()

                // Fetch appointments
                const { data: appts } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        date_time,
                        status,
                        services:service_id(name, duration)
                    `)
                    .eq('user_id', user.id)
                    .order('date_time', { ascending: false })

                setProfileData({ ...userProfile, activeEmail: user.email })
                setAppointments(appts || [])
            } catch (err) {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [navigate])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando perfil...</div>
    }

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
                initialName={profileData?.name || ''}
                email={profileData?.email || profileData?.activeEmail || ''}
                dob={profileData?.date_of_birth || ''}
                appointments={appointments}
            />
        </div>
    )
}
