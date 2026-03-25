import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { assertUserAuth, getAccessLogs } from '../services/api'
import { SuperadminTabs } from '@/app/superadmin/dashboard/superadmin-tabs'

export default function SuperadminDashboard() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const dateParam = searchParams.get('date') || undefined
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const { profile } = await assertUserAuth()
                if (profile?.role !== 'SUPERADMIN') {
                    navigate('/')
                    return
                }

                const fetchedLogs = await getAccessLogs(dateParam)
                setLogs(fetchedLogs)
            } catch (err) {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [navigate, dateParam])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando superadmin...</div>
    }

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Panel de Superadmin
                </h1>
                <p className="text-muted-foreground mt-2">
                    Control de accesos y administración global del sistema.
                </p>
            </div>

            <SuperadminTabs initialLogs={logs} currentDate={dateParam} />
        </div>
    )
}
