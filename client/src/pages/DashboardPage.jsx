// Version debug — à remplacer dès que les tables Supabase sont créées
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Icon({ name, filled = false, className = '' }) {
    return (
        <span
            className={`material-symbols-outlined select-none ${className}`}
            style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
        >
            {name}
        </span>
    )
}

function Sidebar({ displayName, initial, avatarUrl, unread, onSignOut }) {
    const links = [
        { icon: 'dashboard', label: 'Dashboard', to: '/dashboard', active: true },
        { icon: 'domain', label: 'Annonces', to: '/annonces' },
        { icon: 'chat_bubble', label: 'Messages', to: '/messages', badge: unread },
        { icon: 'auto_fix_high', label: 'Studio IA', to: '/studio' },
        { icon: 'settings', label: 'Paramètres', to: '/parametres' },
    ]
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">

                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">Espace Personnel</p>
            </div>
            <nav className="flex flex-col gap-1">
                {links.map(l => (
                    <Link key={l.to} to={l.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all
              ${l.active ? 'bg-secondary-container text-primary' : 'text-outline hover:text-on-surface hover:translate-x-1'}`}>
                        <Icon name={l.icon} className="text-[20px]" />
                        <span>{l.label}</span>
                        {l.badge > 0 && (
                            <span className="ml-auto bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {l.badge}
                            </span>
                        )}
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
                        <p className="text-[10px] text-on-surface-variant">Membre DarNa</p>
                    </div>
                    <button onClick={onSignOut} className="text-outline hover:text-error transition-colors">
                        <Icon name="logout" className="text-[18px]" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default function DashboardPage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [supabaseData, setSupabaseData] = useState({ views: 0, unread: 0, favorites: [] })
    const [dbReady, setDbReady] = useState(false)

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()

    // Tentative de chargement Supabase — ne crash pas si tables absentes
    useEffect(() => {
        if (!user) return
        async function tryLoad() {
            try {
                const { createClient } = await import('@supabase/supabase-js')
                const sb = createClient(
                    import.meta.env.VITE_SUPABASE_URL,
                    import.meta.env.VITE_SUPABASE_ANON_KEY
                )
                const [views, favs] = await Promise.all([
                    sb.from('property_views').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    sb.from('favorites').select('property_id, properties(id,title,price,city,type,status,surface,rooms,images)').eq('user_id', user.id).limit(3),
                ])
                setSupabaseData({
                    views: views.count || 0,
                    unread: 0,
                    favorites: (favs.data || []).map(f => f.properties).filter(Boolean),
                })
                setDbReady(true)
            } catch (e) {
                console.warn('Tables Supabase non encore créées:', e.message)
                setDbReady(false)
            }
        }
        tryLoad()
    }, [user])

    async function handleSignOut() {
        await signOut()
        navigate('/auth')
    }

    const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar
                displayName={displayName}
                initial={initial}
                avatarUrl={avatarUrl}
                unread={supabaseData.unread}
                onSignOut={handleSignOut}
            />

            <main className="flex-1 ml-64 p-10">

                {/* Header */}
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-3 leading-tight">
                            Bienvenue,<br />{displayName}.
                        </h2>
                        <p className="text-base text-on-surface-variant opacity-80">
                            Voici un aperçu de vos activités immobilières.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/annonces" className="p-3 bg-surface-container-highest text-on-surface rounded-full hover:bg-surface-container-high transition-colors">
                            <Icon name="search" className="text-[22px]" />
                        </Link>
                        <button className="p-3 bg-surface-container-highest text-on-surface rounded-full hover:bg-surface-container-high transition-colors">
                            <Icon name="notifications" className="text-[22px]" />
                        </button>
                    </div>
                </header>

                {/* Alerte si DB pas prête */}
                {!dbReady && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                        <Icon name="info" className="text-amber-600 text-[22px]" />
                        <div>
                            <p className="text-sm font-medium text-amber-800">Tables Supabase non détectées</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Lance le script SQL dans Supabase pour activer les données réelles. Le dashboard fonctionne en mode démo pour l'instant.
                            </p>
                        </div>
                    </div>
                )}

                {/* Bento Stats */}
                <section className="grid grid-cols-12 gap-5 mb-14">

                    {/* Card principale */}
                    <div className="col-span-12 md:col-span-8 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between min-h-[200px]">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-widest mb-1">Prochaine étape</p>
                                <h3 className="text-2xl font-headline font-bold">Trouvez votre bien idéal</h3>
                            </div>
                            <Icon name="search" className="text-primary text-[28px]" />
                        </div>
                        <p className="text-on-surface-variant text-sm mt-4 mb-5">Explorez les annonces immobilières au Maroc — vente, location, terrains.</p>
                        <Link to="/annonces"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90 w-fit">
                            <Icon name="search" className="text-[16px]" />
                            Explorer les annonces
                        </Link>
                    </div>

                    {/* Biens consultés */}
                    <div className="col-span-12 md:col-span-4 p-8 rounded-xl flex flex-col justify-between min-h-[200px] bg-primary text-white">
                        <div className="flex justify-between items-start">
                            <Icon name="visibility" className="text-white/80 text-[24px]" />
                            <span className="text-[10px] uppercase tracking-widest text-white/60">Biens consultés</span>
                        </div>
                        <div>
                            <p className="text-5xl font-headline font-extrabold">{String(supabaseData.views).padStart(2, '0')}</p>
                            <p className="text-sm text-white/60 mt-2">Total de vos consultations</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="col-span-12 md:col-span-4 p-8 rounded-xl flex flex-col justify-between min-h-[160px] bg-secondary-container">
                        <div className="flex justify-between items-start">
                            <Icon name="mail" className="text-[24px] text-on-surface" />
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Messages non lus</span>
                        </div>
                        <div>
                            <p className="text-5xl font-headline font-extrabold text-on-surface">
                                {String(supabaseData.unread).padStart(2, '0')}
                            </p>
                            <p className="text-sm text-on-surface-variant mt-2">Aucun message en attente</p>
                        </div>
                    </div>

                    {/* Favoris résumé */}
                    <div className="col-span-12 md:col-span-8 bg-surface-container-low p-8 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-surface-container-lowest rounded-full">
                                <Icon name="favorite" className="text-primary text-[24px]" />
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-widest">Favoris enregistrés</p>
                                <h4 className="text-xl font-headline font-bold">
                                    {supabaseData.favorites.length} bien{supabaseData.favorites.length !== 1 ? 's' : ''}
                                </h4>
                            </div>
                        </div>
                        <Link to="/favoris" className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors">
                            Voir les favoris
                        </Link>
                    </div>
                </section>

                {/* Section Favoris */}
                <section className="mb-14">
                    <div className="flex justify-between items-baseline mb-8">
                        <h3 className="text-3xl font-headline font-bold tracking-tight">Mes Favoris</h3>
                        <Link to="/favoris" className="text-primary font-bold text-sm hover:underline">Voir tout</Link>
                    </div>

                    {supabaseData.favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {supabaseData.favorites.map((p, i) => (
                                <div key={p.id} className={`group ${i === 1 ? 'mt-12 md:mt-0' : ''}`}>
                                    <div className="relative overflow-hidden rounded-t-xl rounded-b-md">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.title} className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 1 ? 'h-[420px]' : 'h-80'}`} />
                                            : <div className={`w-full bg-surface-container flex items-center justify-center ${i === 1 ? 'h-[420px]' : 'h-80'}`}><Icon name="home" className="text-[64px] text-outline-variant" /></div>
                                        }
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1 bg-primary/90 text-white text-[10px] rounded-full uppercase tracking-widest">Disponible</span>
                                        </div>
                                    </div>
                                    <div className="pt-5">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h4 className="text-lg font-headline font-bold">{p.title}</h4>
                                            <p className="text-base font-bold text-primary whitespace-nowrap">{fmt(p.price)}</p>
                                        </div>
                                        <p className="text-on-surface-variant text-sm">{p.city}</p>
                                        <div className="flex gap-4 mt-2">
                                            {p.rooms && <span className="text-xs text-on-surface-variant flex items-center gap-1"><Icon name="bed" className="text-[14px]" />{p.rooms} Ch.</span>}
                                            {p.surface && <span className="text-xs text-on-surface-variant flex items-center gap-1"><Icon name="square_foot" className="text-[14px]" />{p.surface} m²</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-surface-container-low rounded-xl">
                            <Icon name="favorite_border" className="text-[64px] text-outline-variant mb-3" />
                            <p className="text-on-surface-variant font-medium mb-5">Aucun favori pour l'instant</p>
                            <Link to="/annonces" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90">
                                <Icon name="search" className="text-[16px]" /> Explorer les annonces
                            </Link>
                        </div>
                    )}
                </section>

                {/* Profil */}
                <section className="mt-16 pt-12 border-t border-outline-variant/15">
                    <div className="bg-surface-container-lowest p-10 rounded-2xl flex flex-col md:flex-row items-center gap-8">
                        <div className="relative flex-shrink-0">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/10">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-primary-container flex items-center justify-center text-primary text-4xl font-bold">{initial}</div>
                                }
                            </div>
                            <Link to="/parametres" className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-md">
                                <Icon name="edit" className="text-[16px]" />
                            </Link>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                                <h5 className="text-2xl font-headline font-bold">{displayName}</h5>
                                <span className="text-xs px-4 py-1.5 border border-primary text-primary rounded-full font-bold mt-2 md:mt-0">Acheteur</span>
                            </div>
                            <p className="text-on-surface-variant text-sm">{user?.email}</p>
                            <div className="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
                                <Link to="/parametres" className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:opacity-90">Éditer le profil</Link>
                                <button onClick={handleSignOut} className="px-5 py-2.5 border border-outline-variant/30 text-on-surface rounded-full text-sm font-medium hover:bg-surface-container-low transition-colors">
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 flex justify-between items-center border-t border-outline-variant/15 mt-16 text-sm">

                    <span className="text-outline">© 2025 DarNa — Plateforme Immobilière Marocaine</span>
                    <div className="flex gap-5">
                        <a href="#" className="text-outline hover:text-on-surface">Confidentialité</a>
                        <a href="#" className="text-outline hover:text-on-surface">CGU</a>
                        <a href="#" className="text-outline hover:text-on-surface">Contact</a>
                    </div>
                </footer>

            </main>
        </div>
    )
}