'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateProfile } from './actions'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function ProfileForm({
    initialName,
    email,
    dob,
    appointments
}: {
    initialName: string,
    email: string,
    dob: string,
    appointments: any[]
}) {
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)

    // Process appointments
    const now = new Date()
    const upcomingAppointments = appointments.filter(app => new Date(app.date_time) > now && app.status !== 'CANCELLED')
    const pastAppointments = appointments.filter(app => new Date(app.date_time) <= now || app.status === 'CANCELLED')

    // Sort upcoming (soonest first)
    upcomingAppointments.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())

    const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        setIsSaving(true)
        const formData = new FormData()
        formData.append('name', name)

        const result = await updateProfile(formData)

        setIsSaving(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Perfil actualizado correctamente')
        }
    }

    return (
        <div className="space-y-8">
            <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-primary/20">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Datos de la Cuenta</CardTitle>
                        <CardDescription>
                            El correo electrónico no se puede cambiar aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Fecha de Nacimiento</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={dob}
                                disabled
                                className="bg-muted text-muted-foreground"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={isSaving || name === initialName}
                            className="w-full sm:w-auto shadow-lg shadow-primary/20"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {
                nextAppointment && (
                    <Card className="bg-primary/5 border-primary/20 mt-8">
                        <CardHeader>
                            <CardTitle className="text-xl text-primary">Próxima Cita</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-lg border shadow-sm">
                                <div>
                                    <p className="font-semibold text-lg">{format(new Date(nextAppointment.date_time), "EEEE d 'de' MMMM, HH:mm", { locale: es })}</p>
                                    <p className="text-muted-foreground">{nextAppointment.services?.name} ({nextAppointment.services?.duration} min)</p>
                                </div>
                                <div className="mt-4 sm:mt-0">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                        Confirmada
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Historial de Citas</CardTitle>
                    <CardDescription>Resumen de tus visitas anteriores y canceladas.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pastAppointments.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-4">No tienes citas anteriores.</p>
                    ) : (
                        <div className="space-y-3">
                            {pastAppointments.map((app) => (
                                <div key={app.id} className="flex justify-between items-center p-3 border rounded-lg bg-muted/30">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {format(new Date(app.date_time), "dd MMM yyyy, HH:mm", { locale: es })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{app.services?.name}</p>
                                    </div>
                                    <div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${app.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {app.status === 'CANCELLED' ? 'Cancelada' : 'Completada'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
