import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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

export default function Sidebar({ activePage = '' }) {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()
    const isAdmin = profile?.role === 'admin'

    const links = [
        { icon: 'dashboard',     label: 'Dashboard',       to: '/dashboard' },
        { icon: 'domain',        label: 'Annonces',        to: '/annonces' },
        { icon: 'map',           label: 'Carte',           to: '/carte' },
        { icon: 'chat_bubble',   label: 'Messages',        to: '/messages' },
        { icon: 'auto_fix_high', label: 'Studio IA',       to: '/studio' },
        ...(isAdmin ? [{ icon: 'shield_person', label: 'Administration', to: '/admin' }] : []),
        { icon: 'settings',      label: 'Paramètres',      to: '/parametres' },
    ]

    const handleSignOut = async () => {
        await signOut()
        navigate('/auth')
    }

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">
                    {isAdmin ? 'Espace Admin' : 'Espace Personnel'}
                </p>
            </div>

            <nav className="flex flex-col gap-1">
                {links.map(l => (
                    <Link key={l.to} to={l.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all
                        ${activePage === l.to
                            ? 'bg-secondary-container text-primary'
                            : 'text-outline hover:text-on-surface hover:translate-x-1'
                        }`}>
                        <Icon name={l.icon} className="text-[20px]" />
                        <span>{l.label}</span>
                    </Link>
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
                        <p className="text-[10px] text-on-surface-variant">
                            {isAdmin ? 'Administrateur' : 'Membre DarNa'}
                        </p>
                    </div>
                    <button onClick={handleSignOut} className="text-outline hover:text-error transition-colors">
                        <Icon name="logout" className="text-[18px]" />
                    </button>
                </div>
            </div>
        </aside>
    )
}