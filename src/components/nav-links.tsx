'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavLinksProps {
    user: any;
    role: string;
    signoutAction: () => Promise<void>;
}

export default function NavLinks({ user, role, signoutAction }: NavLinksProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    // Main links mapped depending on the user status and role
    const links = []

    if (user) {
        if (role === 'ADMIN') links.push({ href: '/barber/dashboard', label: 'Barbero' })
        if (role === 'SUPERADMIN') links.push({ href: '/superadmin/dashboard', label: 'Superadmin' })

        links.push({ href: '/book', label: 'Reservar' })
        links.push({ href: '/profile', label: 'Mi Perfil' })
    }

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
                {user ? (
                    <>
                        {links.map((link) => (
                            <Link key={link.href} href={link.href}>
                                <Button variant="ghost">{link.label}</Button>
                            </Link>
                        ))}
                        <form action={signoutAction}>
                            <Button type="submit" variant="outline">Salir</Button>
                        </form>
                    </>
                ) : (
                    <Link href="/login">
                        <Button>Iniciar Sesión</Button>
                    </Link>
                )}
            </div>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden flex items-center">
                <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
                <div className="absolute top-14 left-0 w-full border-b bg-background/95 backdrop-blur shadow-md md:hidden flex flex-col items-center py-4 space-y-4">
                    {user ? (
                        <>
                            {links.map((link) => (
                                <Link key={link.href} href={link.href} onClick={closeMenu} className="w-full text-center px-4">
                                    <Button variant="ghost" className="w-full justify-center h-12 text-lg">{link.label}</Button>
                                </Link>
                            ))}
                            <form action={signoutAction} className="w-full px-4">
                                <Button type="submit" variant="outline" className="w-full justify-center h-12 text-lg" onClick={closeMenu}>
                                    Salir
                                </Button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login" onClick={closeMenu} className="w-full text-center px-4">
                            <Button className="w-full justify-center h-12 text-lg">Iniciar Sesión</Button>
                        </Link>
                    )}
                </div>
            )}
        </>
    )
}
