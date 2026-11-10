import { useEffect, useState, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { assertUserAuth, getServices } from '../services/api'
import { BookingForm } from '@/app/book/booking-form'
import { MyAppointments } from '@/app/book/my-appointments'

export default function BookPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState<string>('Usuario')
    const [services, setServices] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const { profile } = await assertUserAuth()
                setUserName(profile?.name || 'Usuario')
                const fetchedServices = await getServices()
                setServices(fetchedServices || [])
            } catch {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [navigate])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando reserva...</div>
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Reservar Cita</h1>
                <p className="text-muted-foreground mt-2">Sigue los pasos a continuación para agendar tu próxima visita, {userName}.</p>
            </div>

            <BookingForm services={services} userName={userName} />
            
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
