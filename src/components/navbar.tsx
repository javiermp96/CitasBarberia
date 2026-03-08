import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import NavLinks from './nav-links'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'CLIENT'
    if (user) {
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (data) role = data.role
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl uppercase tracking-tighter">Cheri Barber</span>
                </Link>

                <nav className="flex items-center">
                    <NavLinks user={user} role={role} signoutAction={signout} />
                </nav>
            </div>
        </header>
    )
}
