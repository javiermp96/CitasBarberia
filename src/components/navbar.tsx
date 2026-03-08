import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

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

                <nav className="flex items-center space-x-4">
                    {user ? (
                        <>
                            {role === 'ADMIN' && (
                                <Link href="/barber/dashboard">
                                    <Button variant="ghost">Barbero</Button>
                                </Link>
                            )}
                            {role === 'SUPERADMIN' && (
                                <Link href="/superadmin/dashboard">
                                    <Button variant="ghost">Superadmin</Button>
                                </Link>
                            )}
                            <Link href="/book">
                                <Button variant="ghost">Reservar</Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost">Mi Perfil</Button>
                            </Link>
                            <form action={signout}>
                                <Button type="submit" variant="outline">Salir</Button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button>Iniciar Sesión</Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}
