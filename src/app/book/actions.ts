'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getServices() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('services').select('*').order('name')
    if (error) throw new Error(error.message)
    return data
}

export async function getAvailableSlots(dateString: string, serviceDuration: number) {
    // dateString should be YYYY-MM-DD
    const supabase = await createClient()

    const startOfDay = new Date(`${dateString}T00:00:00`)
    const endOfDay = new Date(`${dateString}T23:59:59`)

    // 1. Get barber availabilities for this day
    const { data: availabilities, error: availError } = await supabase
        .from('availability')
        .select('*')
        .eq('status', 'AVAILABLE')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())

    if (availError) throw new Error(availError.message)

    // 2. Get booked appointments for this day
    const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('date_time, status, service_id, services(duration)')
        .in('status', ['PENDING', 'CONFIRMED'])
        .gte('date_time', startOfDay.toISOString())
        .lte('date_time', endOfDay.toISOString())

    if (apptError) throw new Error(apptError.message)

    // 3. Calculate free slots
    const slots: Date[] = []

    for (const avail of availabilities) {
        let currentSlot = new Date(avail.start_time)
        const endTime = new Date(avail.end_time)

        while (currentSlot.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
            // Check if this slot overlaps with any appointment
            const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000)

            const isOverlapping = appointments.some(appt => {
                const apptStart = new Date(appt.date_time)
                // @ts-ignore - Supabase nested relationship typing
                const apptDuration = appt.services?.duration || 30 // Fallback
                const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000)

                return (currentSlot < apptEnd && slotEnd > apptStart)
            })

            if (!isOverlapping) {
                slots.push(new Date(currentSlot))
            }

            // Increment by 15 mins for the next possible slot
            currentSlot = new Date(currentSlot.getTime() + 15 * 60000)
        }
    }

    return slots.map(d => d.toISOString())
}

export async function createAppointment(serviceId: string, dateTime: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Basic validation can go here to check if the slot is still free

    const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        service_id: serviceId,
        date_time: dateTime,
        status: 'PENDING'
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/book')
    revalidatePath('/barber/dashboard')
    return { success: true }
}
