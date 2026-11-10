import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { assertUserAuth, updateAppointmentStatus } from '@/services/api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type UserAppointment = {
    id: string
    date_time: string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | string
    services: {
        name: string
        duration: number
    } | null
}

export function MyAppointments() {
    const [appointments, setAppointments] = useState<UserAppointment[]>([])
    const [loading, setLoading] = useState(true)
    const [cancellingId, setCancellingId] = useState<string | null>(null)

    const loadAppointments = useCallback(async () => {
        try {
            const { user } = await assertUserAuth()
            const { data } = await supabase
                .from('appointments')
                .select(`
                  id,
                  date_time,
                  status,
                  services(name, duration)
                `)
                .eq('user_id', user.id)
                .order('date_time', { ascending: false })

            // Supabase returns services either as object or array depending on relation setup
            const formatted = (data || []).map((appt: any) => ({
                ...appt,
                services: Array.isArray(appt.services) ? appt.services[0] : appt.services
            })) as UserAppointment[]

            setAppointments(formatted)
        } catch {
            // handle error silently
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadAppointments()

        const handleRefresh = () => {
            loadAppointments()
        }

        window.addEventListener('appointment-updated', handleRefresh)
        return () => {
            window.removeEventListener('appointment-updated', handleRefresh)
        }
    }, [loadAppointments])

    const handleCancelAppointment = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return
        setCancellingId(id)
        const result = await updateAppointmentStatus(id, 'CANCELLED')
        setCancellingId(null)

        if (result?.error) {
            toast.error('No se pudo cancelar la cita: ' + result.error)
        } else {
            toast.success('Cita cancelada con éxito')
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
        }
    }

    if (loading) {
        return (
            <div className="mt-12 text-center text-muted-foreground p-8 border rounded-lg bg-card/50 backdrop-blur animate-pulse">
                <p>Cargando tus citas anteriores...</p>
            </div>
        )
    }

    if (!appointments || appointments.length === 0) {
        return (
            <div className="mt-12 text-center text-muted-foreground p-8 border rounded-lg bg-card/50 backdrop-blur">
                <p className="text-base font-medium">Aún no tienes citas reservadas.</p>
                <p className="text-sm mt-1">Selecciona un servicio y fecha arriba para agendar tu primera visita.</p>
            </div>
        )
    }

    return (
        <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Mis Citas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map(appt => {
                    const isPast = new Date(appt.date_time) < new Date()
                    const canCancel = !isPast && (appt.status === 'PENDING' || appt.status === 'CONFIRMED')

                    const statusStyles: Record<string, string> = {
                        PENDING: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20',
                        CONFIRMED: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20',
                        CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
                        COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    }

                    const statusTranslations: Record<string, string> = {
                        PENDING: 'Pendiente',
                        CONFIRMED: 'Confirmada',
                        CANCELLED: 'Cancelada',
                        COMPLETED: 'Completada'
                    }

                    return (
                        <Card key={appt.id} className={`transition-all ${isPast ? 'opacity-70 bg-muted/40' : 'bg-card/80 backdrop-blur hover:shadow-md'}`}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                                    <span>{appt.services?.name || 'Servicio de Barbería'}</span>
                                </CardTitle>
                                <CardDescription className="capitalize">
                                    {format(new Date(appt.date_time), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{appt.services?.duration || 30} min</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[appt.status] || 'bg-muted text-muted-foreground'}`}>
                                        {statusTranslations[appt.status] || appt.status}
                                    </span>
                                </div>
                                {canCancel && (
                                    <div className="pt-2 border-t">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
                                            onClick={() => handleCancelAppointment(appt.id)}
                                            disabled={cancellingId === appt.id}
                                        >
                                            {cancellingId === appt.id ? 'Cancelando...' : 'Cancelar Cita'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
