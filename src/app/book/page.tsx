import { getServices } from './actions'
import { BookingForm } from './booking-form'
import { MyAppointments } from './my-appointments'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export default async function BookPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userProfile } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()

    const userName = userProfile?.name || 'Usuario'

    const services = await getServices()

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Reservar Cita</h1>
                <p className="text-muted-foreground mt-2">Sigue los pasos a continuación para agendar tu próxima visita, {userName}.</p>
            </div>

            <BookingForm services={services || []} userName={userName} />
            <Suspense fallback={
                <div className="mt-16 text-center text-muted-foreground animate-pulse p-8 border rounded-lg bg-white/10">
                    Cargando tus citas anteriores...
                </div>
            }>
                <MyAppointments />
            </Suspense>
        </div>
    )
}
