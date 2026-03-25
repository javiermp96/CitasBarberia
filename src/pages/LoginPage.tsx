import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { login } from '../services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const messageParam = searchParams.get('message')
    const [error, setError] = useState<string | null>(messageParam)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        
        const formData = new FormData(e.currentTarget)
        const result = await login(formData)
        
        setLoading(false)
        if (result.error) {
            setError(result.error)
        } else if (result.redirect) {
            navigate(result.redirect)
        }
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md bg-background/95 backdrop-blur-md shadow-2xl border-primary/20">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Bienvenido de nuevo</CardTitle>
                        <CardDescription>
                            Inicia sesión en Cheri Barber para gestionar tus citas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="correo@ejemplo.com" className="bg-background/50 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required className="bg-background/50 h-12" />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded font-medium">
                                {error}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" disabled={loading} className="w-full h-12 text-base shadow-lg shadow-primary/20">
                            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </Button>
                    </CardFooter>
                </form>
                <div className="px-6 pb-6 text-sm text-center text-muted-foreground mt-2">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-primary font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
            </Card>
        </div>
    )
}
