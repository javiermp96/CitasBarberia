'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { updateAppointmentStatus, addAvailability, deleteAvailability, deleteAppointment, addService, updateService, deleteService } from './actions'

type Appointment = {
    id: string
    date_time: string
    status: string
    users: { name: string; email: string }
    services: { name: string; duration: number }
}

type Availability = {
    id: string
    start_time: string
    end_time: string
    status: string
}

type Service = {
    id: string
    name: string
    duration: number
}

export function DashboardTabs({
    appointments,
    availabilities,
    services
}: {
    appointments: Appointment[]
    availabilities: Availability[]
    services: Service[]
}) {
    const [tab, setTab] = useState<'Citas' | 'Disponibilidad' | 'Servicios'>('Citas')
    const [processingId, setProcessingId] = useState<string | null>(null)

    // Dispo Form state
    const [dateStr, setDateStr] = useState('')
    const [startHour, setStartHour] = useState('10:00')
    const [endHour, setEndHour] = useState('14:00')

    // Service Form state
    const [serviceName, setServiceName] = useState('')
    const [serviceDuration, setServiceDuration] = useState('30')
    const [editingService, setEditingService] = useState<string | null>(null)

    const handleUpdateStatus = async (id: string, currentStatus: string) => {
        let newStatus = currentStatus === 'PENDING' ? 'CONFIRMED' : 'CANCELLED'
        if (currentStatus === 'CONFIRMED') newStatus = 'CANCELLED'
        if (currentStatus === 'CANCELLED') newStatus = 'CONFIRMED'

        setProcessingId(id)
        const result = await updateAppointmentStatus(id, newStatus)
        setProcessingId(null)

        if (result.error) toast.error(result.error)
        else toast.success(`Cita marcada como ${newStatus}`)
    }

    const handleAddAvailability = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!dateStr || !startHour || !endHour) {
            toast.error('Completa todos los campos')
            return
        }

        setProcessingId('add-avail')
        const result = await addAvailability(dateStr, startHour, endHour)
        setProcessingId(null)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Disponibilidad agregada')
            setDateStr('')
        }
    }

    const handleDeleteAvailability = async (id: string) => {
        setProcessingId(id)
        const result = await deleteAvailability(id)
        setProcessingId(null)

        if (result.error) toast.error(result.error)
        else toast.success('Disponibilidad eliminada')
    }

    const handleDeleteAppointment = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cita permanentemente?')) return

        setProcessingId(id)
        const result = await deleteAppointment(id)
        setProcessingId(null)

        if (result.error) toast.error(result.error)
        else toast.success('Cita eliminada')
    }

    const handleAddOrUpdateService = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!serviceName || !serviceDuration) {
            toast.error('Completa los campos del servicio')
            return
        }

        setProcessingId('service-action')
        let result;
        if (editingService) {
            result = await updateService(editingService, serviceName, parseInt(serviceDuration))
        } else {
            result = await addService(serviceName, parseInt(serviceDuration))
        }
        setProcessingId(null)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(editingService ? 'Servicio actualizado' : 'Servicio añadido')
            setServiceName('')
            setServiceDuration('30')
            setEditingService(null)
        }
    }

    const handleDeleteService = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este servicio? Puede que haya citas vinculadas a él.')) return
        setProcessingId(id)
        const result = await deleteService(id)
        setProcessingId(null)

        if (result.error) toast.error(result.error)
        else toast.success('Servicio eliminado')
    }

    const handleEditService = (srv: Service) => {
        setEditingService(srv.id)
        setServiceName(srv.name)
        setServiceDuration(srv.duration.toString())
        setTab('Servicios')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 border-b pb-2">
                <Button
                    variant={tab === 'Citas' ? 'default' : 'ghost'}
                    onClick={() => setTab('Citas')}
                >
                    Citas Reservadas
                </Button>
                <Button
                    variant={tab === 'Disponibilidad' ? 'default' : 'ghost'}
                    onClick={() => setTab('Disponibilidad')}
                >
                    Mi Disponibilidad
                </Button>
                <Button
                    variant={tab === 'Servicios' ? 'default' : 'ghost'}
                    onClick={() => { setTab('Servicios'); setEditingService(null); setServiceName(''); setServiceDuration('30') }}
                >
                    Servicios
                </Button>
            </div>

            {tab === 'Citas' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Citas de Clientes</CardTitle>
                        <CardDescription>Visualiza y administra las próximas citas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointments.length === 0 ? (
                            <p className="text-muted-foreground">No hay citas registradas todavía.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha e Hora</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Servicio</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map(appt => (
                                        <TableRow key={appt.id}>
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {format(new Date(appt.date_time), "MMM d, HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-primary">{appt.users?.name || 'Usuario'}</p>
                                                <p className="text-xs text-muted-foreground">{appt.users?.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                {appt.services?.name} ({appt.services?.duration}m)
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold
                          ${appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                          ${appt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                                                    {appt.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(appt.id, appt.status)}
                                                    disabled={processingId === appt.id}
                                                >
                                                    {appt.status === 'CANCELLED' ? 'Restaurar' : 'Cambiar Estado'}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteAppointment(appt.id)}
                                                    disabled={processingId === appt.id}
                                                >
                                                    Eliminar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {tab === 'Disponibilidad' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <form onSubmit={handleAddAvailability}>
                            <CardHeader>
                                <CardTitle>Abrir Huecos</CardTitle>
                                <CardDescription>Añade bloques de tiempo donde estás disponible.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dateStr">Fecha</Label>
                                    <Input
                                        type="date"
                                        id="dateStr"
                                        value={dateStr}
                                        onChange={e => setDateStr(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startHour">Hora Inicio</Label>
                                        <Input
                                            type="time"
                                            id="startHour"
                                            value={startHour}
                                            onChange={e => setStartHour(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endHour">Hora Fin</Label>
                                        <Input
                                            type="time"
                                            id="endHour"
                                            value={endHour}
                                            onChange={e => setEndHour(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="submit"
                                    disabled={processingId === 'add-avail'}
                                    className="w-full"
                                >
                                    Confirmar Disponibilidad
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Horarios Creados</CardTitle>
                            <CardDescription>Gestiona tus bloques actuales.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {availabilities.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No has abierto huecos.</p>
                            ) : (
                                <div className="space-y-3">
                                    {availabilities.map((av) => (
                                        <div key={av.id} className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="text-sm">
                                                <p className="font-semibold capitalize">
                                                    {format(new Date(av.start_time), 'EEEE d MMM', { locale: es })}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {format(new Date(av.start_time), 'HH:mm')} - {format(new Date(av.end_time), 'HH:mm')}
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteAvailability(av.id)}
                                                disabled={processingId === av.id}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {tab === 'Servicios' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <form onSubmit={handleAddOrUpdateService}>
                            <CardHeader>
                                <CardTitle>{editingService ? 'Editar Servicio' : 'Añadir Servicio'}</CardTitle>
                                <CardDescription>Crea o modifica los servicios ofrecidos en tu barbería.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serviceName">Nombre del Servicio</Label>
                                    <Input
                                        id="serviceName"
                                        placeholder="Ej: Corte básico"
                                        value={serviceName}
                                        onChange={e => setServiceName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serviceDuration">Duración (minutos)</Label>
                                    <Input
                                        type="number"
                                        id="serviceDuration"
                                        min="5"
                                        step="5"
                                        value={serviceDuration}
                                        onChange={e => setServiceDuration(e.target.value)}
                                        required
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Button
                                    type="submit"
                                    disabled={processingId === 'service-action'}
                                    className="w-full"
                                >
                                    {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                                </Button>
                                {editingService && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => { setEditingService(null); setServiceName(''); setServiceDuration('30'); }}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </CardFooter>
                        </form>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Servicios Actuales</CardTitle>
                            <CardDescription>Lista completa de servicios.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {services.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No hay servicios registrados.</p>
                            ) : (
                                <div className="space-y-3">
                                    {services.map((srv) => (
                                        <div key={srv.id} className="flex items-center justify-between border p-3 rounded-lg">
                                            <div className="text-sm">
                                                <p className="font-semibold">{srv.name}</p>
                                                <p className="text-muted-foreground">{srv.duration} minutos</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleEditService(srv)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteService(srv.id)}
                                                    disabled={processingId === srv.id}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
