import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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

function Sidebar({ displayName, initial, avatarUrl, onSignOut }) {
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <p className="text-base font-headline font-extrabold text-primary">DarNa</p>
                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">Panneau Admin</p>
            </div>
            <nav className="flex flex-col gap-1">
                {[
                    { icon: 'group', label: 'Utilisateurs' },
                    { icon: 'bar_chart', label: 'Statistiques' },
                    { icon: 'settings', label: 'Paramètres' },
                ].map(l => (
                    <div key={l.label}
                        className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-outline cursor-default">
                        <Icon name={l.icon} className="text-[20px]" />
                        <span>{l.label}</span>
                    </div>
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
                    <button onClick={onSignOut} className="text-outline hover:text-error transition-colors" title="Déconnexion">
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

export default function AdminPage() {
    const { user, signOut, getAllUsers, suspendUser, activateUser, banUser, updateUserRole, deleteUser } = useAuth()
    const navigate = useNavigate()

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
            toast.error('Impossible de charger les utilisateurs : ' + (err.response?.data?.error || err.message))
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

            <Sidebar displayName={displayName} initial={initial} avatarUrl={avatarUrl} onSignOut={handleSignOut} />

            <main className="flex-1 ml-64 p-10">

                <header className="mb-12">
                    <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2 leading-tight">
                        Utilisateurs inscrits
                    </h2>
                    <p className="text-base text-on-surface-variant opacity-80">
                        Connecté en tant que <span className="font-semibold text-on-surface">{user?.email}</span>
                    </p>
                </header>

                {/* Stats */}
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

                {/* Recherche */}
                <div className="mb-6 flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-full max-w-md">
                    <Icon name="search" className="text-outline text-[20px]" />
                    <input
                        type="text"
                        placeholder="Rechercher par email ou nom..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent flex-1 text-sm outline-none text-on-surface placeholder:text-outline"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-outline hover:text-on-surface">
                            <Icon name="close" className="text-[18px]" />
                        </button>
                    )}
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
                                    {['Utilisateur', 'Email', 'Statut', 'Rôle', 'Inscription', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-4 text-left text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-surface-container-low transition-colors">

                                        {/* Nom */}
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

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-on-surface-variant">{u.email}</td>

                                        {/* Statut */}
                                        <td className="px-6 py-4"><StatusBadge status={u.status} /></td>

                                        {/* Rôle */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.role || 'user'}
                                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                                disabled={actionLoading === u.id || u.id === user?.id}
                                                className="px-3 py-1.5 bg-surface-container border border-outline-variant/30 rounded-full text-xs font-medium text-on-surface outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <option value="user">Utilisateur</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                                            {new Date(u.created_at).toLocaleDateString('fr-FR')}
                                        </td>

                                        {/* Actions */}
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
                                                    {actionLoading === u.id && (
                                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                    )}
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

                <footer className="py-10 flex justify-between items-center border-t border-outline-variant/15 mt-12 text-sm">
                    <span className="text-outline">© 2025 DarNa — Administration</span>
                </footer>
            </main>

            {/* Modale confirmation */}
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