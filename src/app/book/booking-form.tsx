import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { getAvailableSlots, createAppointment } from '@/services/api'

type Service = {
    id: string
    name: string
    duration: number
}

export function BookingForm({ services, userName }: { services: Service[], userName: string }) {
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (selectedService && date) {
            setLoadingSlots(true)
            setSelectedSlot(null)
            const dateString = format(date, 'yyyy-MM-dd')

            getAvailableSlots(dateString, selectedService.duration)
                .then(slots => {
                    setAvailableSlots(slots)
                    setLoadingSlots(false)
                })
                .catch(err => {
                    console.error("DEBUG FETCH ERROR:", err)
                    toast.error("Error: " + (err.message || "desconocido"))
                    setLoadingSlots(false)
                })
        }
    }, [selectedService, date])

    const handleBook = async () => {
        if (!selectedService || !selectedSlot) return

        setProcessing(true)
        const result = await createAppointment(selectedService.id, selectedSlot)
        setProcessing(false)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('¡Cita reservada con éxito!')
            setSelectedService(null)
            setSelectedSlot(null)
            setDate(new Date())
            window.dispatchEvent(new CustomEvent('appointment-updated'))
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>1. Servicio</CardTitle>
                    <CardDescription>Elige lo que necesitas hoy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {services.map(service => (
                        <div
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedService?.id === service.id
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent bg-muted hover:bg-muted/80'
                                }`}
                        >
                            <h3 className="font-semibold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">{service.duration} min</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className={!selectedService ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                    <CardTitle>2. Fecha</CardTitle>
                    <CardDescription>Selecciona el día de tu cita.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow"
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        locale={es}
                    />
                </CardContent>
            </Card>

            <Card className={!date || !selectedService ? 'opacity-50 pointer-events-none' : ''}>
                <CardHeader>
                    <CardTitle>3. Hora</CardTitle>
                    <CardDescription>
                        {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona una fecha'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingSlots ? (
                        <p className="text-center text-muted-foreground py-8">Cargando horas...</p>
                    ) : availableSlots.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No hay huecos disponibles este día.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 pb-6">
                            {availableSlots.map(slot => {
                                const slotDate = new Date(slot)
                                const timeStr = format(slotDate, 'HH:mm')
                                return (
                                    <Button
                                        key={slot}
                                        variant={selectedSlot === slot ? 'default' : 'outline'}
                                        onClick={() => setSelectedSlot(slot)}
                                        className="w-full"
                                    >
                                        {timeStr}
                                    </Button>
                                )
                            })}
                        </div>
                    )}

                    {selectedSlot && (
                        <div className="mt-6 space-y-4">
                            <div className="bg-muted/50 p-3 rounded-md text-sm text-center border">
                                Reservando a nombre de: <strong className="text-primary">{userName}</strong>
                            </div>
                            <Button
                                className="w-full h-11 text-base shadow-lg shadow-primary/20"
                                onClick={handleBook}
                                disabled={processing}
                            >
                                {processing ? 'Confirmando...' : 'Confirmar Reserva'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
