import { supabase } from '../lib/supabase'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'No se pudo iniciar sesión. Verifica tus credenciales.' }
    }

    if (data?.user) {
        // Run both DB operations concurrently
        const [_, roleResponse] = await Promise.all([
            // Generate Access Log
            supabase.from('access_logs').insert({
                user_id: data.user.id,
                action: 'LOGIN'
            }),
            // Fetch role from users table
            supabase
                .from('users')
                .select('role')
                .eq('id', data.user.id)
                .single()
        ])

        const userProfile = roleResponse.data as any

        // FIRE EMAIL NOTIFICATION TO ADMIN
        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            
            if (serviceId && templateId && publicKey) {
                // Do not await this so it doesn't block login
                fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        service_id: serviceId,
                        template_id: templateId,
                        user_id: publicKey,
                        template_params: {
                            to_email: 'cheribarberr@gmail.com',
                            client_name: email,
                            appointment_date: `Inicio de sesión por: ${email} (${userProfile?.role || 'CLIENT'})`
                        }
                    })
                }).catch(err => console.error("Error sending notify:", err))
            }
        } catch (err) {
            console.error("No se pudo enviar notificacion de login", err)
        }

        if (userProfile?.role === 'SUPERADMIN') {
            return { redirect: '/superadmin/dashboard' }
        }

        if (userProfile?.role === 'ADMIN') {
            return { redirect: '/barber/dashboard' }
        }
    }

    return { redirect: '/book' }
}

export async function signup(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string
    const dob = formData.get('dob') as string

    if (password !== passwordConfirm) {
        return { error: 'Las contraseñas no coinciden' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                dob,
            }
        }
    })

    if (error) {
        return { error: 'No se pudo registrar el usuario. Es posible que el correo ya exista.' }
    }

    // FIRE EMAIL NOTIFICATION TO ADMIN
    try {
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
                        client_name: name,
                        appointment_date: 'Usuario Nuevo Registrado'
                    }
                })
            })
        }
    } catch (err) {
        console.error("No se pudo enviar notificacion de nuevo usuario", err)
    }

    return { redirect: '/book' }
}

export async function signout() {
    await supabase.auth.signOut()
    return { redirect: '/login' }
}
