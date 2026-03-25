import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assertUserAuth } from '../services/api'
import NavLinks from './nav-links'
import { BarberNotifications } from './BarberNotifications'

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string>('CLIENT')
    const location = useLocation()

    useEffect(() => {
        async function fetchUser() {
            try {
                const { user, profile } = await assertUserAuth()
                setUser(user)
                if (profile) setRole(profile.role)
            } catch (err) {
                setUser(null)
                setRole('CLIENT')
            }
        }
        fetchUser()
    }, [location.pathname])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between px-4 md:px-8">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl uppercase tracking-tighter">Cheri Barber</span>
                </Link>

                <div className="flex items-center gap-4">
                    {(role === 'ADMIN' || role === 'SUPERADMIN') && user && (
                        <BarberNotifications userId={user.id} />
                    )}
                    <nav className="flex items-center">
                        <NavLinks user={user} role={role} />
                    </nav>
                </div>
            </div>
        </header>
    )
}
