import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
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
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
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

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => {
                   setOpen(!open)
                   if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                       Notification.requestPermission()
                   }
                }} 
                className="relative p-2 rounded-full hover:bg-muted text-foreground transition-colors"
                title="Notificaciones"
                aria-label="Abrir panel de notificaciones"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            
            {open && (
                <>
                    {/* Backdrop para cerrar al hacer clic afuera */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpen(false)} 
                    />
                    
                    <div className="absolute top-12 right-0 w-80 md:w-96 max-h-96 overflow-y-auto bg-card/95 backdrop-blur-md border shadow-2xl rounded-xl z-50 p-3">
                        <div className="flex justify-between items-center px-1 pb-2 mb-2 border-b">
                            <h3 className="font-semibold text-sm">Notificaciones</h3>
                            <button 
                                onClick={() => setOpen(false)} 
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                aria-label="Cerrar notificaciones"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {notifications.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-6">No hay novedades por ahora.</p>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map(n => (
                                    <div 
                                      key={n.id} 
                                      onClick={() => handleRead(n.id)}
                                      className={`text-sm p-3 rounded-lg cursor-pointer border-l-4 transition-colors hover:bg-muted/80 ${n.is_read ? 'border-transparent text-muted-foreground bg-muted/30' : 'border-primary bg-primary/10 text-foreground font-medium shadow-sm'}`}
                                    >
                                        <p>{n.message}</p>
                                        <span className="text-[11px] text-muted-foreground block mt-1">
                                            {new Date(n.created_at).toLocaleString('es-ES')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
