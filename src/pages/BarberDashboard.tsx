import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assertUserAuth, getAdminAppointments, getAvailabilities, getAdminServices } from '../services/api'
import { DashboardTabs } from '@/app/barber/dashboard/dashboard-tabs'

export default function BarberDashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>({ appointments: [], availabilities: [], services: [] })

    useEffect(() => {
        async function loadData() {
            try {
                const { profile } = await assertUserAuth()
                if (profile?.role !== 'ADMIN') {
                    navigate('/book')
                    return
                }

                const [appointments, availabilities, services] = await Promise.all([
                    getAdminAppointments(),
                    getAvailabilities(),
                    getAdminServices()
                ])

                setData({ appointments, availabilities, services })
            } catch {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [navigate])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando panel...</div>
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Panel de Control</h1>
                    <p className="text-muted-foreground mt-2">Bienvenido, gestiona tus citas, servicios y tu horario.</p>
                </div>
            </div>

            <DashboardTabs 
                appointments={data.appointments || []} 
                availabilities={data.availabilities || []} 
                services={data.services || []} 
            />
        </div>
    )
}
