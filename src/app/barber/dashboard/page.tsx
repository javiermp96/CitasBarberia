import { getAdminAppointments, getAvailabilities, getAdminServices } from './actions'
import { DashboardTabs } from './dashboard-tabs'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BarberDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'ADMIN') {
        redirect('/book') // No es admin, mandarlo a reservar
    }

    const appointments = await getAdminAppointments()
    const availabilities = await getAvailabilities()
    const services = await getAdminServices()

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Panel de Control</h1>
                    <p className="text-muted-foreground mt-2">Bienvenido, gestiona tus citas, servicios y tu horario.</p>
                </div>
            </div>

            {/* @ts-ignore - Some deep nested relationship types from Supabase */}
            <DashboardTabs appointments={appointments || []} availabilities={availabilities || []} services={services || []} />
        </div>
    )
}
