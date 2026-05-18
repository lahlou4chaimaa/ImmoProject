import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

function Icon({ name, className = '' }) {
    return (
        <span
            className={`material-symbols-outlined select-none ${className}`}
            style={{ fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
        >
            {name}
        </span>
    )
}

function Sidebar({ displayName, initial, avatarUrl, onSignOut, activePage, setActivePage }) {
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <p className="text-base font-headline font-extrabold text-primary">DarNa</p>
                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">Panneau Admin</p>
            </div>
            <nav className="flex flex-col gap-1">
                {[
                    { icon: 'group', label: 'Utilisateurs', key: 'users' },
                    { icon: 'bar_chart', label: 'Analytics', key: 'analytics' },
                    { icon: 'domain', label: 'Annonces', key: 'annonces' },
                ].map(l => (
                    <button key={l.key} onClick={() => setActivePage(l.key)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all text-left w-full
                        ${activePage === l.key
                            ? 'bg-secondary-container text-primary'
                            : 'text-outline hover:text-on-surface hover:translate-x-1'
                        }`}>
                        <Icon name={l.icon} className="text-[20px]" />
                        <span>{l.label}</span>
                    </button>
                ))}
            </nav>
            <div className="mt-auto pt-6">
                <div className="p-4 bg-surface-container-low rounded-xl flex items-center gap-3">
                    {avatarUrl
                        ? <img src={avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="avatar" />
                        : <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">{initial}</div>
                    }
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                        <p className="text-[10px] text-on-surface-variant">Administrateur</p>
                    </div>
                    <button onClick={onSignOut} className="text-outline hover:text-error transition-colors">
                        <Icon name="logout" className="text-[18px]" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

const STATUS_MAP = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
    suspended: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Suspendu' },
    banned: { bg: 'bg-red-100', text: 'text-red-800', label: 'Banni' },
}

function StatusBadge({ status }) {
    const s = STATUS_MAP[status] || STATUS_MAP.active
    return <span className={`${s.bg} ${s.text} px-2.5 py-1 rounded-full text-[11px] font-semibold`}>{s.label}</span>
}

const CONFIRM_LABELS = {
    suspend: { title: 'Suspendre cet utilisateur ?', btn: 'Suspendre', color: 'bg-amber-500 hover:bg-amber-600' },
    activate: { title: 'Réactiver cet utilisateur ?', btn: 'Réactiver', color: 'bg-green-500 hover:bg-green-600' },
    ban: { title: 'Bannir définitivement ?', btn: 'Bannir', color: 'bg-red-500 hover:bg-red-600' },
    delete: { title: 'Supprimer ce compte ?', btn: 'Supprimer', color: 'bg-red-700 hover:bg-red-800' },
}

// ─── Bar Chart Component ──────────────────────────────────────────────────────
function BarChart({ data, colorClass = 'bg-primary', maxValue }) {
    const max = maxValue || Math.max(...data.map(d => d.value), 1)
    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-on-surface">{item.value}</span>
                    <div className="w-full flex items-end" style={{ height: '100px' }}>
                        <div
                            className={`w-full ${colorClass} rounded-t-lg transition-all duration-700`}
                            style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-on-surface-variant text-center leading-tight">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cityStats, setCityStats] = useState([])
    const [typeStats, setTypeStats] = useState([])
    const [weeklyUsers, setWeeklyUsers] = useState([])
    const [weeklyProperties, setWeeklyProperties] = useState([])
    const [recentUsers, setRecentUsers] = useState([])

    useEffect(() => { loadAnalytics() }, [])

    const loadAnalytics = async () => {
        setLoading(true)
        try {
            const { data: users } = await supabase.from('users').select('id, status, role, created_at')
            const { data: properties } = await supabase.from('properties').select('id, status, city, type, created_at')

            const now = new Date()
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            setStats({
                totalUsers: users?.length || 0,
                newUsersThisMonth: users?.filter(u => new Date(u.created_at) >= thisMonth).length || 0,
                activeUsers: users?.filter(u => u.status === 'active').length || 0,
                suspendedUsers: users?.filter(u => u.status === 'suspended').length || 0,
                bannedUsers: users?.filter(u => u.status === 'banned').length || 0,
                totalProperties: properties?.length || 0,
                activeProperties: properties?.filter(p => p.status === 'active').length || 0,
                newPropertiesThisMonth: properties?.filter(p => new Date(p.created_at) >= thisMonth).length || 0,
            })

            // Stats par ville
            const cityCount = {}
            properties?.forEach(p => { if (p.city) cityCount[p.city] = (cityCount[p.city] || 0) + 1 })
            setCityStats(Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ label, value })))

            // Stats par type
            setTypeStats([
                { label: 'Vente', value: properties?.filter(p => p.type === 'sale').length || 0 },
                { label: 'Location', value: properties?.filter(p => p.type === 'rent').length || 0 },
                { label: 'Terrain', value: properties?.filter(p => p.type === 'land').length || 0 },
            ])

            // Inscriptions par jour (7 derniers jours)
            const days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now)
                d.setDate(now.getDate() - (6 - i))
                d.setHours(0, 0, 0, 0)
                const end = new Date(d)
                end.setDate(d.getDate() + 1)
                return {
                    label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                    start: d,
                    end,
                }
            })

            setWeeklyUsers(days.map(d => ({
                label: d.label,
                value: users?.filter(u => new Date(u.created_at) >= d.start && new Date(u.created_at) < d.end).length || 0
            })))

            setWeeklyProperties(days.map(d => ({
                label: d.label,
                value: properties?.filter(p => new Date(p.created_at) >= d.start && new Date(p.created_at) < d.end).length || 0
            })))

            setRecentUsers(users?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5) || [])

        } catch (err) {
            toast.error('Erreur chargement analytics')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">Analytics</h2>
                <p className="text-on-surface-variant">Vue d'ensemble de la plateforme DarNa</p>
            </header>

            {/* KPIs */}
            <section className="grid grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Utilisateurs total', value: stats.totalUsers, icon: 'group', bg: 'bg-primary', text: 'text-white', sub: `+${stats.newUsersThisMonth} ce mois` },
                    { label: 'Annonces actives', value: stats.activeProperties, icon: 'domain', bg: 'bg-green-100', text: 'text-green-800', sub: `${stats.totalProperties} au total` },
                    { label: 'Comptes suspendus', value: stats.suspendedUsers, icon: 'pause_circle', bg: 'bg-amber-100', text: 'text-amber-800', sub: `${stats.bannedUsers} bannis` },
                    { label: 'Nouveaux ce mois', value: stats.newUsersThisMonth, icon: 'person_add', bg: 'bg-blue-100', text: 'text-blue-800', sub: `${stats.newPropertiesThisMonth} nouvelles annonces` },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.text} p-6 rounded-xl flex flex-col gap-2`}>
                        <Icon name={s.icon} className="text-[24px] opacity-80" />
                        <p className="text-3xl font-headline font-extrabold">{String(s.value).padStart(2, '0')}</p>
                        <p className="text-xs font-semibold opacity-80 uppercase tracking-widest">{s.label}</p>
                        <p className="text-xs opacity-60">{s.sub}</p>
                    </div>
                ))}
            </section>

            {/* Graphes par jour (7 derniers jours) */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                        <Icon name="person_add" className="text-primary text-[20px]" />
                        Inscriptions (7 derniers jours)
                    </h3>
                    <BarChart data={weeklyUsers} colorClass="bg-primary" />
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                        <Icon name="domain" className="text-green-600 text-[20px]" />
                        Annonces publiées (7 derniers jours)
                    </h3>
                    <BarChart data={weeklyProperties} colorClass="bg-green-500" />
                </div>
            </div>

            {/* Annonces par ville + Types */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                        <Icon name="location_on" className="text-primary text-[20px]" />
                        Annonces par ville
                    </h3>
                    <BarChart data={cityStats} colorClass="bg-blue-500" />
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
                    <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                        <Icon name="pie_chart" className="text-primary text-[20px]" />
                        Types d'annonces
                    </h3>
                    <BarChart data={typeStats} colorClass="bg-amber-500" />

                    {/* Santé plateforme */}
                    <div className="mt-6 pt-6 border-t border-outline-variant/10">
                        <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Santé plateforme</h4>
                        {[
                            { label: 'Taux d\'activation', value: stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0, color: 'bg-green-500' },
                            { label: 'Taux de suspension', value: stats.totalUsers > 0 ? Math.round((stats.suspendedUsers / stats.totalUsers) * 100) : 0, color: 'bg-amber-500' },
                        ].map(m => (
                            <div key={m.label} className="mb-3">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-on-surface-variant">{m.label}</span>
                                    <span className="text-xs font-bold text-on-surface">{m.value}%</span>
                                </div>
                                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Derniers inscrits */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 mb-6">
                <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                    <Icon name="person_add" className="text-primary text-[20px]" />
                    Derniers inscrits
                </h3>
                <div className="divide-y divide-outline-variant/10">
                    {recentUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-4 py-3">
                            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary text-sm font-bold">
                                {u.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-on-surface truncate">{u.email}</p>
                                <p className="text-xs text-on-surface-variant">{new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <StatusBadge status={u.status} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={loadAnalytics} className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-xs font-medium hover:bg-surface-container transition-colors">
                    <Icon name="refresh" className="text-[16px]" />
                    Rafraîchir
                </button>
            </div>
        </div>
    )
}

// ─── Annonces Page ────────────────────────────────────────────────────────────
function AnnoncesAdminPage() {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [confirmDelete, setConfirmDelete] = useState(null)

    const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }

    useEffect(() => { loadProperties() }, [])

    const loadProperties = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, title, type, price, city, status, created_at, images, user_id, users(email, full_name)')
                .order('created_at', { ascending: false })
            if (error) throw error
            setProperties(data || [])
        } catch (err) {
            toast.error('Erreur chargement annonces')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id, newStatus) => {
        const { error } = await supabase.from('properties').update({ status: newStatus }).eq('id', id)
        if (error) return toast.error('Erreur mise à jour')
        toast.success(`Annonce ${newStatus === 'active' ? 'activée' : 'archivée'}`)
        loadProperties()
    }

    const handleDelete = async () => {
        if (!confirmDelete) return
        const { error } = await supabase.from('properties').delete().eq('id', confirmDelete)
        if (error) return toast.error('Erreur suppression')
        toast.success('Annonce supprimée')
        setConfirmDelete(null)
        loadProperties()
    }

    // "sold", "archived", "inactive"... tout ce qui n'est pas "active" = archivé
    const isArchived = (status) => status !== 'active'

    const filtered = properties.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase()) ||
            p.users?.email?.toLowerCase().includes(search.toLowerCase())
        const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && p.status === 'active') ||
            (filterStatus === 'archived' && isArchived(p.status))
        return matchSearch && matchStatus
    })

    const stats = {
        total: properties.length,
        active: properties.filter(p => p.status === 'active').length,
        archived: properties.filter(p => isArchived(p.status)).length,
    }

    return (
        <div>
            <header className="mb-10">
                <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
                    Gestion des annonces
                </h2>
                <p className="text-on-surface-variant">Modérez les annonces de la plateforme</p>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-3 gap-5 mb-8">
                {[
                    { label: 'Total annonces', value: stats.total, icon: 'domain', bg: 'bg-primary', text: 'text-white' },
                    { label: 'Actives', value: stats.active, icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-800' },
                    { label: 'Archivées', value: stats.archived, icon: 'archive', bg: 'bg-surface-container', text: 'text-on-surface' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.text} p-6 rounded-xl flex flex-col gap-3`}>
                        <Icon name={s.icon} className="text-[24px] opacity-80" />
                        <div>
                            <p className="text-3xl font-headline font-extrabold">{String(s.value).padStart(2, '0')}</p>
                            <p className="text-xs font-medium opacity-70 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Filtres */}
            <div className="flex gap-3 mb-6">
                <div className="flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-full flex-1 max-w-md">
                    <Icon name="search" className="text-outline text-[20px]" />
                    <input
                        type="text"
                        placeholder="Rechercher par titre, ville, vendeur..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent flex-1 text-sm outline-none text-on-surface placeholder:text-outline"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-surface-container-low rounded-full text-sm outline-none text-on-surface"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actives</option>
                    <option value="archived">Archivées</option>
                </select>
            </div>

            {/* Tableau */}
            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-outline-variant/20">
                                {['Annonce', 'Vendeur', 'Type', 'Prix', 'Statut', 'Date', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-4 text-left text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                                    {/* Annonce */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                                                {p.images?.[0]
                                                    ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Icon name="home" className="text-outline-variant text-[20px]" /></div>
                                                }
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-on-surface truncate max-w-[180px]">{p.title}</p>
                                                <p className="text-xs text-on-surface-variant">{p.city}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Vendeur */}
                                    <td className="px-4 py-4 text-sm text-on-surface-variant">
                                        {p.users?.full_name || p.users?.email || '—'}
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-4">
                                        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                                            {typeLabel[p.type] || p.type}
                                        </span>
                                    </td>

                                    {/* Prix */}
                                    <td className="px-4 py-4 text-sm font-bold text-primary">{fmt(p.price)}</td>

                                    {/* Statut */}
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                            p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-surface-container text-outline'
                                        }`}>
                                            {p.status === 'active' ? 'Active' : 'Archivée'}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-4 text-sm text-on-surface-variant">
                                        {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {p.status === 'active' ? (
                                                <button
                                                    onClick={() => handleStatusChange(p.id, 'sold')}
                                                    title="Archiver"
                                                    className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                                >
                                                    <Icon name="archive" className="text-[18px]" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusChange(p.id, 'active')}
                                                    title="Réactiver"
                                                    className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                                >
                                                    <Icon name="unarchive" className="text-[18px]" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setConfirmDelete(p.id)}
                                                title="Supprimer"
                                                className="p-2 rounded-full bg-surface-container text-outline hover:bg-red-100 hover:text-red-600 transition-colors"
                                            >
                                                <Icon name="delete" className="text-[18px]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <Icon name="search_off" className="text-[64px] text-outline-variant mb-3" />
                        <p className="text-on-surface-variant font-medium">Aucune annonce trouvée</p>
                    </div>
                )}
            </div>

            {/* Modale suppression */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <Icon name="warning" className="text-red-600 text-[22px]" />
                            </div>
                            <h3 className="text-lg font-headline font-bold">Supprimer cette annonce ?</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-6">Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2.5 border border-outline-variant/30 text-on-surface rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-white rounded-full text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Page principale Admin ────────────────────────────────────────────────────
export default function AdminPage() {
    const { user, signOut, getAllUsers, suspendUser, activateUser, banUser, updateUserRole, deleteUser } = useAuth()
    const navigate = useNavigate()

    const [activePage, setActivePage] = useState('users')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)
    const [search, setSearch] = useState('')
    const [confirmModal, setConfirmModal] = useState(null)

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()

    useEffect(() => { loadUsers() }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (err) {
            toast.error('Impossible de charger les utilisateurs')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => { await signOut(); navigate('/auth') }

    const handleConfirm = async () => {
        if (!confirmModal) return
        const { type, userId } = confirmModal
        setActionLoading(userId)
        setConfirmModal(null)
        try {
            if (type === 'suspend') await suspendUser(userId)
            if (type === 'activate') await activateUser(userId)
            if (type === 'ban') await banUser(userId)
            if (type === 'delete') await deleteUser(userId)
            toast.success(
                type === 'suspend' ? 'Utilisateur suspendu' :
                type === 'activate' ? 'Utilisateur activé' :
                type === 'ban' ? 'Utilisateur banni' : 'Utilisateur supprimé'
            )
            loadUsers()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Une erreur est survenue')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(userId)
        try {
            await updateUserRole(userId, newRole)
            toast.success(`Rôle mis à jour : ${newRole}`)
            loadUsers()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erreur lors du changement de rôle')
        } finally {
            setActionLoading(null)
        }
    }

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        banned: users.filter(u => u.status === 'banned').length,
    }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar
                displayName={displayName}
                initial={initial}
                avatarUrl={avatarUrl}
                onSignOut={handleSignOut}
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <main className="flex-1 ml-64 p-10">

                {/* Utilisateurs */}
                {activePage === 'users' && (
                    <>
                        <header className="mb-12">
                            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
                                Utilisateurs inscrits
                            </h2>
                            <p className="text-base text-on-surface-variant opacity-80">
                                Connecté en tant que <span className="font-semibold text-on-surface">{user?.email}</span>
                            </p>
                        </header>

                        <section className="grid grid-cols-4 gap-5 mb-10">
                            {[
                                { label: 'Total', value: stats.total, icon: 'group', bg: 'bg-primary', text: 'text-white' },
                                { label: 'Actifs', value: stats.active, icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-800' },
                                { label: 'Suspendus', value: stats.suspended, icon: 'pause_circle', bg: 'bg-amber-100', text: 'text-amber-800' },
                                { label: 'Bannis', value: stats.banned, icon: 'block', bg: 'bg-red-100', text: 'text-red-800' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} ${s.text} p-6 rounded-xl flex flex-col gap-3`}>
                                    <Icon name={s.icon} className="text-[24px] opacity-80" />
                                    <div>
                                        <p className="text-3xl font-headline font-extrabold">{String(s.value).padStart(2, '0')}</p>
                                        <p className="text-xs font-medium opacity-70 uppercase tracking-widest mt-1">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <div className="mb-6 flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-full max-w-md">
                            <Icon name="search" className="text-outline text-[20px]" />
                            <input type="text" placeholder="Rechercher par email ou nom..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="bg-transparent flex-1 text-sm outline-none text-on-surface placeholder:text-outline" />
                            {search && <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface"><Icon name="close" className="text-[18px]" /></button>}
                        </div>

                        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-outline-variant/20">
                                            {['Utilisateur', 'Email', 'Statut', 'Rôle', 'Inscription', 'Actions'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                                            {(u.full_name || u.email)?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="text-sm font-medium text-on-surface">
                                                            {u.full_name || <span className="text-outline italic">Sans nom</span>}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>
                                                <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                                                <td className="px-6 py-4">
                                                    <select value={u.role || 'user'} onChange={e => handleRoleChange(u.id, e.target.value)}
                                                        disabled={actionLoading === u.id || u.id === user?.id}
                                                        className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-full text-xs font-medium text-on-surface outline-none disabled:opacity-40 disabled:cursor-not-allowed">
                                                        <option value="user">Utilisateur</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-on-surface-variant">
                                                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.id === user?.id ? (
                                                        <span className="text-xs text-outline italic">Vous</span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {u.status === 'active' ? (
                                                                <button onClick={() => setConfirmModal({ type: 'suspend', userId: u.id, userName: u.email })} disabled={actionLoading === u.id} title="Suspendre" className="p-2 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-40">
                                                                    <Icon name="pause_circle" className="text-[18px]" />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => setConfirmModal({ type: 'activate', userId: u.id, userName: u.email })} disabled={actionLoading === u.id} title="Réactiver" className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-40">
                                                                    <Icon name="check_circle" className="text-[18px]" />
                                                                </button>
                                                            )}
                                                            {u.status !== 'banned' && (
                                                                <button onClick={() => setConfirmModal({ type: 'ban', userId: u.id, userName: u.email })} disabled={actionLoading === u.id} title="Bannir" className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-40">
                                                                    <Icon name="block" className="text-[18px]" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => setConfirmModal({ type: 'delete', userId: u.id, userName: u.email })} disabled={actionLoading === u.id} title="Supprimer" className="p-2 rounded-full bg-surface-container text-outline hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-40">
                                                                <Icon name="delete" className="text-[18px]" />
                                                            </button>
                                                            {actionLoading === u.id && <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {!loading && filteredUsers.length === 0 && (
                                <div className="text-center py-20">
                                    <Icon name="search_off" className="text-[64px] text-outline-variant mb-3" />
                                    <p className="text-on-surface-variant font-medium">Aucun utilisateur trouvé</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={loadUsers} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-full text-xs font-medium hover:bg-surface-container transition-colors disabled:opacity-40">
                                <Icon name="refresh" className="text-[16px]" />
                                Rafraîchir
                            </button>
                        </div>
                    </>
                )}

                {activePage === 'analytics' && <AnalyticsPage />}
                {activePage === 'annonces' && <AnnoncesAdminPage />}

                <footer className="py-10 flex justify-between items-center border-t border-outline-variant/15 mt-12 text-sm">
                    <span className="text-outline">© 2025 DarNa — Administration</span>
                </footer>
            </main>

            {confirmModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <Icon name="warning" className="text-red-600 text-[22px]" />
                            </div>
                            <h3 className="text-lg font-headline font-bold">{CONFIRM_LABELS[confirmModal.type]?.title}</h3>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-6">
                            Cette action concerne :<br />
                            <strong className="text-on-surface">{confirmModal.userName}</strong>
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2.5 border border-outline-variant/30 text-on-surface rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                                Annuler
                            </button>
                            <button onClick={handleConfirm} className={`flex-1 px-4 py-2.5 text-white rounded-full text-sm font-medium transition-colors ${CONFIRM_LABELS[confirmModal.type]?.color}`}>
                                {CONFIRM_LABELS[confirmModal.type]?.btn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}