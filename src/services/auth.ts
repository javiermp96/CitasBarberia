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

    return { redirect: '/book' }
}

export async function signout() {
    await supabase.auth.signOut()
    return { redirect: '/login' }
}
