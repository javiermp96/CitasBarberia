'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const name = formData.get('name') as string

    if (!name || name.trim() === '') {
        return { error: 'El nombre es obligatorio' }
    }

    const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/profile')
    // We should also revalidate layout in case name is used there
    revalidatePath('/', 'layout')

    return { success: true }
}
