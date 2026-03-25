import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function BarberNotifications({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([])
    const [open, setOpen] = useState(false)

    useEffect(() => {
        async function fetchNotifs() {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)
            if (data) setNotifications(data)
        }
        fetchNotifs()

        const channel = supabase.channel('realtime_notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
                setNotifications(prev => [payload.new, ...prev])
                if (Notification.permission === 'granted') {
                    new Notification("Nueva Cita", { body: payload.new.message })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleRead = async (id: string) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const unreadClass = unreadCount > 0 ? "text-red-600 animate-pulse" : "text-muted-foreground"

    return (
        <div className="relative">
            <button 
                onClick={() => {
                   setOpen(!open)
                   if (Notification.permission === 'default') {
                       Notification.requestPermission()
                   }
                }} 
                className={`p-2 rounded-full hover:bg-muted font-bold flex items-center gap-1 ${unreadClass}`}
                title="Notificaciones"
            >
                🔔 {unreadCount > 0 && <span>({unreadCount})</span>}
            </button>
            
            {open && (
                <div className="absolute top-12 right-0 w-80 max-h-96 overflow-y-auto bg-background/95 backdrop-blur border shadow-xl rounded-xl z-50 p-2">
                    <div className="flex justify-between items-center px-2 py-1 mb-2 border-b">
                        <h3 className="font-bold text-sm">Notificaciones</h3>
                        <button onClick={() => setOpen(false)} className="text-muted-foreground text-xs hover:text-primary">X</button>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No hay novedades.</p>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(n => (
                                <div 
                                  key={n.id} 
                                  onClick={() => handleRead(n.id)}
                                  className={`text-sm p-3 rounded-md cursor-pointer border-l-4 transition-colors hover:bg-muted ${n.is_read ? 'border-transparent text-muted-foreground' : 'border-primary bg-primary/5 font-medium shadow-sm'}`}
                                >
                                    {n.message}
                                    <div className="text-[10px] opacity-70 mt-1">
                                        {new Date(n.created_at).toLocaleString('es-ES')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
