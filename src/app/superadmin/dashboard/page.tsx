import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SuperadminTabs } from './superadmin-tabs'
import { getAccessLogs } from './actions'

export default async function SuperadminDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const sp = await searchParams;
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify role
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'SUPERADMIN') {
        redirect('/')
    }

    const logs = await getAccessLogs(sp?.date)

    return (
        <div className="container px-4 py-8 mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Panel de Superadmin
                </h1>
                <p className="text-muted-foreground mt-2">
                    Control de accesos y administración global del sistema.
                </p>
            </div>

            <SuperadminTabs initialLogs={logs} currentDate={sp?.date} />
        </div>
    )
}
