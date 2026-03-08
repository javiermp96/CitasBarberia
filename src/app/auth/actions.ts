'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect('/login?message=Could not authenticate user')
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

        const userProfile = roleResponse.data

        if (userProfile?.role === 'SUPERADMIN') {
            revalidatePath('/', 'layout')
            redirect('/superadmin/dashboard')
        }

        if (userProfile?.role === 'ADMIN') {
            revalidatePath('/', 'layout')
            redirect('/barber/dashboard')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/book')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string
    const dob = formData.get('dob') as string

    if (password !== passwordConfirm) {
        redirect('/register?message=Las contraseñas no coinciden')
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
        redirect('/register?message=Could not sign up user')
    }

    revalidatePath('/', 'layout')
    redirect('/book')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
