'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type LogEntry = {
    id: string
    action: string
    created_at: string
    users: {
        name: string
        email: string
        role: string
    }
}

export function SuperadminTabs({
    initialLogs,
    currentDate
}: {
    initialLogs: LogEntry[]
    currentDate?: string
}) {
    const router = useRouter()
    const [dateFilter, setDateFilter] = useState(currentDate || '')

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value
        setDateFilter(newDate)

        // Push date to URL to trigger server action re-fetch
        if (newDate) {
            router.push(`/superadmin/dashboard?date=${newDate}`)
        } else {
            router.push(`/superadmin/dashboard`)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registro de Accesos</CardTitle>
                    <CardDescription>Visualiza e inspecciona quién ha entrado a la aplicación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <div className="flex items-center space-x-2 max-w-sm">
                            <Label htmlFor="dateFilter">Filtrar por fecha:</Label>
                            <Input
                                id="dateFilter"
                                type="date"
                                value={dateFilter}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha y Hora</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            No hay registros para la fecha indicada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    initialLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>{log.users?.name || 'Desconocido'}</TableCell>
                                            <TableCell>{log.users?.email}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${log.users?.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800' :
                                                        log.users?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'}
                                                `}>
                                                    {log.users?.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-green-600">
                                                    {log.action}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {initialLogs.length === 500 && (
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            * Mostrando los últimos 500 registros.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
