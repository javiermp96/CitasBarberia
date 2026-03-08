import { signup } from '../auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const sp = await searchParams;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md bg-background/95 backdrop-blur-md shadow-2xl border-primary/20">
                <form>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Crea tu cuenta</CardTitle>
                        <CardDescription>
                            Regístrate para reservar tu cita en Cheri Barber.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input id="name" name="name" required placeholder="Tu Nombre" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dob">Fecha de Nacimiento</Label>
                            <Input id="dob" name="dob" type="date" required className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passwordConfirm">Confirmar Contraseña</Label>
                            <Input id="passwordConfirm" name="passwordConfirm" type="password" required className="bg-background/50" />
                        </div>

                        {sp?.message && (
                            <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded font-medium">
                                {sp.message}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" formAction={signup} className="w-full h-11 text-base shadow-lg shadow-primary/20">
                            Registrarse
                        </Button>
                    </CardFooter>
                </form>
                <div className="px-6 pb-6 text-sm text-center text-muted-foreground mt-2">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                        Inicia Sesión
                    </Link>
                </div>
            </Card>
        </div>
    )
}
