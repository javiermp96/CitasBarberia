'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')

    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (data?.role !== 'ADMIN') throw new Error('Not authorized')
    return supabase
}

export async function getAdminAppointments() {
    const supabase = await assertAdmin()
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      id,
      date_time,
      status,
      users:user_id(name, email),
      services:service_id(name, duration)
    `)
        .order('date_time', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
    const supabase = await assertAdmin()
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

    if (error) return { error: error.message }
    revalidatePath('/barber/dashboard')
    return { success: true }
}

export async function getAvailabilities() {
    const supabase = await assertAdmin()
    const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('start_time', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function addAvailability(dateStr: string, startHour: string, endHour: string) {
    const supabase = await assertAdmin()

    const startT = new Date(`${dateStr}T${startHour}:00`)
    const endT = new Date(`${dateStr}T${endHour}:00`)

    if (startT >= endT) {
        return { error: 'La hora de inicio debe ser anterior a la hora de fin.' }
    }

    const { error } = await supabase.from('availability').insert({
        start_time: startT.toISOString(),
        end_time: endT.toISOString(),
        status: 'AVAILABLE'
    })

    if (error) return { error: error.message }

    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}

export async function deleteAvailability(id: string) {
    const supabase = await assertAdmin()
    const { error } = await supabase.from('availability').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}

export async function deleteAppointment(appointmentId: string) {
    const supabase = await assertAdmin()
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

    if (error) return { error: error.message }
    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}

export async function getAdminServices() {
    const supabase = await assertAdmin()
    const { data, error } = await supabase.from('services').select('*').order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export async function addService(name: string, duration: number) {
    const supabase = await assertAdmin()
    const { error } = await supabase.from('services').insert({ name, duration })
    if (error) return { error: error.message }
    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}

export async function updateService(id: string, name: string, duration: number) {
    const supabase = await assertAdmin()
    const { error } = await supabase.from('services').update({ name, duration }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}

export async function deleteService(id: string) {
    const supabase = await assertAdmin()
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return { error: 'No se pudo eliminar el servicio.' }
    revalidatePath('/barber/dashboard')
    revalidatePath('/book')
    return { success: true }
}
