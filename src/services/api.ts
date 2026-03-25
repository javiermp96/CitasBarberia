import { supabase } from '../lib/supabase'

export async function assertUserAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')
    
    const { data } = await supabase.from('users').select('role, name, email').eq('id', user.id).single()
    return { user, profile: data }
}

export async function getAdminAppointments() {
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
    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function getAvailabilities() {
    const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('start_time', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function addAvailability(dateStr: string, startHour: string, endHour: string, status: string = 'AVAILABLE') {
    const { profile } = await assertUserAuth()
    if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPERADMIN') {
        return { error: 'Acceso denegado. Solo el barbero puede modificar descansos.' }
    }

    const startT = new Date(`${dateStr}T${startHour}:00`)
    const endT = new Date(`${dateStr}T${endHour}:00`)

    if (startT >= endT) {
        return { error: 'La hora de inicio debe ser anterior a la hora de fin.' }
    }

    const { error } = await supabase.from('availability').insert({
        start_time: startT.toISOString(),
        end_time: endT.toISOString(),
        status
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteAvailability(id: string) {
    const { profile } = await assertUserAuth()
    if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPERADMIN') {
        return { error: 'Acceso denegado.' }
    }

    const { error } = await supabase.from('availability').delete().eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteAppointment(appointmentId: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId)
    if (error) return { error: error.message }
    return { success: true }
}

export async function getAdminServices() {
    const { data, error } = await supabase.from('services').select('*').order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data?.filter(s => s.name.trim().toLowerCase() !== 'descanso') || []
}

export async function addService(name: string, duration: number) {
    if (name.trim().toLowerCase() === 'descanso') return { error: 'Los descansos se configuran en "Disponibilidad", no como un servicio.' }
    const { error } = await supabase.from('services').insert({ name, duration })
    if (error) return { error: error.message }
    return { success: true }
}

export async function updateService(id: string, name: string, duration: number) {
    if (name.trim().toLowerCase() === 'descanso') return { error: 'Los descansos se configuran en "Disponibilidad", no como un servicio.' }
    const { error } = await supabase.from('services').update({ name, duration }).eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteService(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return { error: 'No se pudo eliminar el servicio.' }
    return { success: true }
}

export async function getAccessLogs(dateFilter?: string) {
    let query = supabase
        .from('access_logs')
        .select(`
            id,
            action,
            created_at,
            users:user_id(name, email, role)
        `)
        .order('created_at', { ascending: false })

    if (dateFilter) {
        const startOfDay = new Date(dateFilter)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(dateFilter)
        endOfDay.setHours(23, 59, 59, 999)

        query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString())
    }

    query = query.limit(500)
    const { data, error } = await query

    if (error) throw new Error(error.message)

    const formattedData = data?.map(log => ({
        ...log,
        users: Array.isArray(log.users) ? log.users[0] : log.users
    }))

    return formattedData as any
}

export async function getServices() {
    return getAdminServices()
}

export async function getAvailableSlots(dateString: string, serviceDuration: number) {
    const startOfDay = new Date(`${dateString}T00:00:00`)
    const endOfDay = new Date(`${dateString}T23:59:59`)

    const { data: availabilities, error: availError } = await supabase
        .from('availability')
        .select('*')
        .in('status', ['AVAILABLE', 'BREAK'])
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())

    if (availError) throw new Error(availError.message)

    const { data: appointments, error: apptError } = await supabase
        .from('appointments')
        .select('date_time, status, service_id, services(duration)')
        .in('status', ['PENDING', 'CONFIRMED'])
        .gte('date_time', startOfDay.toISOString())
        .lte('date_time', endOfDay.toISOString())

    if (apptError) throw new Error(apptError.message)

    const slots: Date[] = []

    const onlyAvails = availabilities.filter(a => a.status === 'AVAILABLE')
    const breaks = availabilities.filter(a => a.status === 'BREAK')

    for (const avail of onlyAvails) {
        let currentSlot = new Date(avail.start_time)
        const endTime = new Date(avail.end_time)

        while (currentSlot.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000)

            const isOverlappingAppt = appointments.some(appt => {
                const apptStart = new Date(appt.date_time)
                const apptDuration = (appt.services as any)?.duration || 30 
                const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000)
                return (currentSlot < apptEnd && slotEnd > apptStart)
            })

            const isOverlappingBreak = breaks.some(br => {
                const brStart = new Date(br.start_time)
                const brEnd = new Date(br.end_time)
                return (currentSlot < brEnd && slotEnd > brStart)
            })

            if (!isOverlappingAppt && !isOverlappingBreak) {
                slots.push(new Date(currentSlot))
            }

            currentSlot = new Date(currentSlot.getTime() + 15 * 60000)
        }
    }

    return slots.map(d => d.toISOString())
}

export async function createAppointment(serviceId: string, dateTime: string) {
    const { user, profile } = await assertUserAuth()

    const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        service_id: serviceId,
        date_time: dateTime,
        status: 'PENDING'
    })

    if (error) return { error: error.message }

    try {
        const { data: admins } = await supabase.from('users').select('id, email').in('role', ['ADMIN', 'SUPERADMIN'])
        
        if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
                user_id: admin.id,
                message: `Nueva cita reservada por ${profile?.name || 'un cliente'} para el ${new Date(dateTime).toLocaleString('es-ES')}`
            }))
            await supabase.from('notifications').insert(notifications)

            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

            if (serviceId && templateId && publicKey) {
                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: serviceId,
                        template_id: templateId,
                        user_id: publicKey,
                        template_params: {
                            to_email: 'cheribarberr@gmail.com',
                            client_name: profile?.name || 'Cliente',
                            appointment_date: new Date(dateTime).toLocaleString('es-ES')
                        }
                    })
                })
            }
        }
    } catch (err) {
        console.error("No se pudo enviar notificacion", err)
    }

    return { success: true }
}

export async function updateProfile(formData: FormData) {
    const { user } = await assertUserAuth()
    const name = formData.get('name') as string

    if (!name || name.trim() === '') {
        return { error: 'El nombre es obligatorio' }
    }

    const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}
