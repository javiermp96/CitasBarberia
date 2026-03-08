import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function MyAppointments() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get appointments for the logged-in user
    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
      id,
      date_time,
      status,
      services(name, duration)
    `)
        .eq('user_id', user.id)
        .order('date_time', { ascending: false })

    if (!appointments || appointments.length === 0) {
        return (
            <div className="mt-12 text-center text-muted-foreground p-8 border rounded-lg bg-white/50">
                <p>Aún no tienes citas reservadas.</p>
            </div>
        )
    }

    return (
        <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Mis Citas</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointments.map(appt => {
                    const isPast = new Date(appt.date_time) < new Date()
                    return (
                        <Card key={appt.id} className={isPast ? 'opacity-70 bg-muted/50' : ''}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">
                                    {/* @ts-ignore */}
                                    {appt.services?.name}
                                </CardTitle>
                                <CardDescription>
                                    {format(new Date(appt.date_time), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    {/* @ts-ignore */}
                                    <span className="text-sm text-muted-foreground">{appt.services?.duration} min</span>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold
                    ${appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                    ${appt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                                        {appt.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
