import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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

function Sidebar({ displayName, initial, avatarUrl, onSignOut }) {
    const links = [
        { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
        { icon: 'domain', label: 'Annonces', to: '/annonces' },
        { icon: 'favorite', label: 'Mes Favoris', to: '/favoris', active: true },
        { icon: 'chat_bubble', label: 'Messages', to: '/messages' },
        { icon: 'auto_fix_high', label: 'Studio IA', to: '/studio' },
        { icon: 'settings', label: 'Paramètres', to: '/parametres' },
    ]
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <p className="text-base font-headline font-extrabold text-primary">DarNa</p>
                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">Espace Personnel</p>
            </div>
            <nav className="flex flex-col gap-1">
                {links.map(l => (
                    <Link key={l.to} to={l.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all
                            ${l.active ? 'bg-secondary-container text-primary' : 'text-outline hover:text-on-surface hover:translate-x-1'}`}>
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

// ─── Carte favori ─────────────────────────────────────────────────────────────
function FavoriteCard({ property, onRemove, onToggleCompare, isSelected, compareCount }) {
    const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }
    const typeColor = { sale: 'bg-blue-500', rent: 'bg-teal-500', land: 'bg-amber-500' }
    const isUnavailable = property.status === 'sold' || property.status === 'rented'

    return (
        <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden border transition-all duration-200 ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/10 hover:border-primary/20 hover:shadow-lg'}`}>
            {/* Image */}
            <div className="relative overflow-hidden h-52">
                {property.images?.[0] ? (
                    <img src={property.images[0]} alt={property.title}
                        className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${isUnavailable ? 'opacity-60' : ''}`} />
                ) : (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <Icon name="home" className="text-[56px] text-outline-variant" />
                    </div>
                )}

                {/* Badge type */}
                <span className={`absolute top-3 left-3 px-3 py-1 ${typeColor[property.type] || 'bg-primary'} text-white text-[10px] font-medium rounded-full uppercase tracking-wider`}>
                    {typeLabel[property.type] || property.type}
                </span>

                {/* Badge vendu/loué */}
                {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-white font-extrabold text-xl uppercase tracking-widest rotate-[-15deg] border-4 border-white px-4 py-1 rounded-lg ${property.status === 'sold' ? 'bg-red-600/85' : 'bg-purple-600/85'}`}>
                            {property.status === 'sold' ? 'Vendu' : 'Loué'}
                        </span>
                    </div>
                )}

                {/* Checkbox comparaison */}
                <button
                    onClick={() => onToggleCompare(property)}
                    disabled={!isSelected && compareCount >= 3}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md
                        ${isSelected
                            ? 'bg-primary text-white'
                            : compareCount >= 3
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white/90 text-outline-variant hover:bg-white'}`}
                    title={isSelected ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
                >
                    <Icon name={isSelected ? 'check' : 'compare'} className="text-[16px]" />
                </button>
            </div>

            {/* Contenu */}
            <div className="p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-headline font-bold text-on-surface leading-tight line-clamp-1">{property.title}</h4>
                    <p className={`font-bold whitespace-nowrap text-sm ${isUnavailable ? 'text-outline line-through' : 'text-primary'}`}>
                        {fmt(property.price)}
                    </p>
                </div>
                <p className="text-on-surface-variant text-sm flex items-center gap-1 mb-3">
                    <Icon name="location_on" className="text-[14px]" />
                    {property.city}
                </p>

                {/* Caractéristiques */}
                <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/10 mb-4">
                    {property.surface && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Icon name="square_foot" className="text-[14px]" />{property.surface} m²
                        </span>
                    )}
                    {property.rooms && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Icon name="bed" className="text-[14px]" />{property.rooms} ch.
                        </span>
                    )}
                    {property.has_elevator && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Icon name="elevator" className="text-[14px]" />Asc.
                        </span>
                    )}
                    {property.has_parking && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Icon name="local_parking" className="text-[14px]" />Park.
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link to={`/annonce/${property.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 border border-outline-variant/20 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-low hover:border-primary/30 transition-all">
                        <Icon name="open_in_new" className="text-[14px]" />
                        Voir la fiche
                    </Link>
                    <button
                        onClick={() => onRemove(property.id)}
                        className="p-2 bg-surface-container text-outline hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors"
                        title="Retirer des favoris"
                    >
                        <Icon name="favorite" filled className="text-[16px] text-error" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Modal de comparaison ─────────────────────────────────────────────────────
function CompareModal({ properties, onClose }) {
    const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }

    const rows = [
        { label: 'Prix', key: 'price', render: (v) => fmt(v) },
        { label: 'Type', key: 'type', render: (v) => typeLabel[v] || v },
        { label: 'Ville', key: 'city', render: (v) => v || '—' },
        { label: 'Surface', key: 'surface', render: (v) => v ? `${v} m²` : '—' },
        { label: 'Chambres', key: 'rooms', render: (v) => v || '—' },
        { label: 'Étage', key: 'floor', render: (v) => v != null ? `Étage ${v}` : '—' },
        { label: 'Ascenseur', key: 'has_elevator', render: (v) => v ? '✅ Oui' : '❌ Non' },
        { label: 'Parking', key: 'has_parking', render: (v) => v ? '✅ Oui' : '❌ Non' },
        { label: 'Statut', key: 'status', render: (v) => ({ active: '🟢 Disponible', sold: '🔴 Vendu', rented: '🟣 Loué', inactive: '⚫ Inactif' }[v] || v) },
    ]

    // Trouver le meilleur prix
    const prices = properties.map(p => p.price).filter(Boolean)
    const minPrice = Math.min(...prices)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="font-headline font-bold text-xl text-gray-900">Comparaison des biens</h2>
                        <p className="text-xs text-gray-500 mt-0.5">{properties.length} biens sélectionnés</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Icon name="close" className="text-[22px] text-gray-500" />
                    </button>
                </div>

                {/* Tableau */}
                <div className="overflow-auto flex-1 p-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left py-3 pr-4 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">Critère</th>
                                {properties.map(p => (
                                    <th key={p.id} className="text-center pb-4 px-3">
                                        <div className="w-full h-32 rounded-xl overflow-hidden mb-2">
                                            {p.images?.[0]
                                                ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <Icon name="home" className="text-[32px] text-gray-300" />
                                                  </div>
                                            }
                                        </div>
                                        <p className="font-bold text-gray-900 text-xs line-clamp-2 text-center">{p.title}</p>
                                        <p className="text-gray-400 text-[10px] mt-0.5">{p.city}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rows.map(row => (
                                <tr key={row.key} className="hover:bg-gray-50/50">
                                    <td className="py-3 pr-4 text-xs font-medium text-gray-500">{row.label}</td>
                                    {properties.map(p => {
                                        const val = p[row.key]
                                        const isBestPrice = row.key === 'price' && val === minPrice && prices.length > 1
                                        return (
                                            <td key={p.id} className="py-3 px-3 text-center">
                                                <span className={`text-sm font-medium ${isBestPrice ? 'text-green-600 font-bold' : 'text-gray-800'}`}>
                                                    {row.render(val)}
                                                    {isBestPrice && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Meilleur prix</span>}
                                                </span>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400">Sélectionnez jusqu'à 3 biens pour comparer</p>
                    <div className="flex gap-3">
                        {properties.map(p => (
                            <Link key={p.id} to={`/annonce/${p.id}`}
                                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all">
                                Voir {p.title.substring(0, 20)}...
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Page principale Favoris ──────────────────────────────────────────────────
export default function FavorisPage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [compareList, setCompareList] = useState([])
    const [showCompare, setShowCompare] = useState(false)
    const [sortBy, setSortBy] = useState('date')
    const [filterType, setFilterType] = useState('')

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()

    const fetchFavorites = async () => {
        if (!user) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('property_id, created_at, properties(id,title,price,city,type,status,surface,rooms,floor,has_elevator,has_parking,images,created_at)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setFavorites((data || []).map(f => ({ ...f.properties, favoritedAt: f.created_at })).filter(Boolean))
        } catch (e) {
            toast.error('Erreur chargement des favoris')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFavorites() }, [user])

    const handleRemove = async (propertyId) => {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId)
        setFavorites(prev => prev.filter(p => p.id !== propertyId))
        setCompareList(prev => prev.filter(p => p.id !== propertyId))
        toast.success('Retiré des favoris')
    }

    const handleToggleCompare = (property) => {
        const isIn = compareList.some(p => p.id === property.id)
        if (isIn) {
            setCompareList(prev => prev.filter(p => p.id !== property.id))
        } else {
            if (compareList.length >= 3) { toast.error('Maximum 3 biens à comparer'); return }
            setCompareList(prev => [...prev, property])
        }
    }

    const handleSignOut = async () => { await signOut(); navigate('/auth') }

    // Tri + filtre
    const sorted = [...favorites]
        .filter(p => filterType ? p.type === filterType : true)
        .sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price
            if (sortBy === 'price_desc') return b.price - a.price
            if (sortBy === 'surface') return (b.surface || 0) - (a.surface || 0)
            return new Date(b.favoritedAt) - new Date(a.favoritedAt) // date
        })

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar displayName={displayName} initial={initial} avatarUrl={avatarUrl} onSignOut={handleSignOut} />

            <main className="flex-1 ml-64 p-10">

                {/* Header */}
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
                            Mes Favoris
                        </h2>
                        <p className="text-on-surface-variant text-sm">
                            {loading ? '...' : `${sorted.length} bien${sorted.length !== 1 ? 's' : ''} sauvegardé${sorted.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>

                    {/* Bouton comparer */}
                    {compareList.length >= 2 && (
                        <button
                            onClick={() => setShowCompare(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
                        >
                            <Icon name="compare" className="text-[18px]" />
                            Comparer ({compareList.length})
                        </button>
                    )}
                </header>

                {/* Filtres + tri */}
                {favorites.length > 0 && (
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="text-xs text-on-surface-variant font-medium">Type :</span>
                        {[
                            { value: '', label: 'Tous' },
                            { value: 'sale', label: 'Vente' },
                            { value: 'rent', label: 'Location' },
                            { value: 'land', label: 'Terrain' },
                        ].map(t => (
                            <button key={t.value}
                                onClick={() => setFilterType(t.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                                    ${filterType === t.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40'}`}>
                                {t.label}
                            </button>
                        ))}

                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs text-on-surface-variant">Trier :</span>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-xs outline-none cursor-pointer">
                                <option value="date">Date d'ajout</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="surface">Surface</option>
                            </select>
                        </div>

                        {compareList.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                                <Icon name="compare" className="text-primary text-[14px]" />
                                <span className="text-xs text-primary font-medium">{compareList.length} sélectionné{compareList.length > 1 ? 's' : ''}</span>
                                <button onClick={() => setCompareList([])} className="text-primary/60 hover:text-primary ml-1 text-xs">✕</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Contenu */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-surface-container rounded-xl h-52 mb-4" />
                                <div className="bg-surface-container rounded h-4 w-3/4 mb-2" />
                                <div className="bg-surface-container rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="text-center py-24 bg-surface-container-low rounded-2xl">
                        <Icon name="favorite_border" className="text-[72px] text-outline-variant mb-4" />
                        <h3 className="font-headline font-bold text-xl mb-2">
                            {filterType ? 'Aucun favori dans cette catégorie' : "Aucun favori pour l'instant"}
                        </h3>
                        <p className="text-on-surface-variant text-sm mb-6">
                            {filterType ? 'Essayez un autre filtre.' : 'Explorez les annonces et cliquez sur ❤️ pour sauvegarder des biens.'}
                        </p>
                        {!filterType && (
                            <Link to="/annonces"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
                                <Icon name="search" className="text-[16px]" />
                                Explorer les annonces
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sorted.map(p => (
                            <FavoriteCard
                                key={p.id}
                                property={p}
                                onRemove={handleRemove}
                                onToggleCompare={handleToggleCompare}
                                isSelected={compareList.some(c => c.id === p.id)}
                                compareCount={compareList.length}
                            />
                        ))}
                    </div>
                )}

                {/* Barre de comparaison flottante */}
                {compareList.length >= 1 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-on-surface text-surface px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
                        <Icon name="compare" className="text-primary text-[20px]" />
                        <span className="text-sm font-medium">
                            {compareList.length === 1 ? 'Sélectionnez au moins 1 autre bien' : `${compareList.length} biens sélectionnés`}
                        </span>
                        {compareList.length >= 2 && (
                            <button onClick={() => setShowCompare(true)}
                                className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-medium hover:opacity-90">
                                Comparer
                            </button>
                        )}
                        <button onClick={() => setCompareList([])} className="text-outline hover:text-error transition-colors">
                            <Icon name="close" className="text-[18px]" />
                        </button>
                    </div>
                )}

            </main>

            {/* Modal comparaison */}
            {showCompare && compareList.length >= 2 && (
                <CompareModal properties={compareList} onClose={() => setShowCompare(false)} />
            )}
        </div>
    )
}