import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// ─── Icône ───────────────────────────────────────────────────────────────────
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

// ─── Sidebar (même que Dashboard) ────────────────────────────────────────────
function Sidebar({ displayName, initial, avatarUrl, onSignOut }) {
    const links = [
        { icon: 'dashboard', label: 'Dashboard', to: '/dashboard' },
        { icon: 'domain', label: 'Annonces', to: '/annonces', active: true },
        { icon: 'chat_bubble', label: 'Messages', to: '/messages' },
        { icon: 'auto_fix_high', label: 'Studio IA', to: '/studio' },
        { icon: 'settings', label: 'Paramètres', to: '/parametres' },
    ]
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <h1 className="text-xl font-headline font-bold text-primary tracking-tighter">🏠 DarNa</h1>
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

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="bg-surface-container rounded-xl h-56 mb-4" />
            <div className="bg-surface-container rounded h-4 w-3/4 mb-2" />
            <div className="bg-surface-container rounded h-4 w-1/2 mb-2" />
            <div className="bg-surface-container rounded h-4 w-1/3" />
        </div>
    )
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ property, isFavorite, onToggleFavorite }) {
    const fmt = (n) =>
        new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)

    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }
    const typeColor = { sale: 'bg-blue-500', rent: 'bg-teal-500', land: 'bg-amber-500' }

    return (
        <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            {/* Image */}
            <div className="relative overflow-hidden h-52">
                {property.images?.[0] ? (
                    <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <Icon name="home" className="text-[56px] text-outline-variant" />
                    </div>
                )}

                {/* Badge type */}
                <span className={`absolute top-3 left-3 px-3 py-1 ${typeColor[property.type] || 'bg-primary'} text-white text-[10px] font-medium rounded-full uppercase tracking-wider`}>
                    {typeLabel[property.type] || property.type}
                </span>

                {/* Bouton favori */}
                <button
                    onClick={(e) => { e.preventDefault(); onToggleFavorite(property.id) }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                >
                    <Icon
                        name="favorite"
                        filled={isFavorite}
                        className={`text-[18px] ${isFavorite ? 'text-error' : 'text-outline-variant'}`}
                    />
                </button>

                {/* Badge statut */}
                {(property.status === 'sold' || property.status === 'rented') && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-4 py-2 bg-error text-white text-sm font-bold rounded-full uppercase tracking-wider">
                            {property.status === 'sold' ? 'Vendu' : 'Loué'}
                        </span>
                    </div>
                )}
            </div>

            {/* Contenu */}
            <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-headline font-bold text-on-surface leading-tight line-clamp-1">{property.title}</h4>
                    <p className="text-primary font-bold whitespace-nowrap text-sm">{fmt(property.price)}</p>
                </div>
                <p className="text-on-surface-variant text-sm flex items-center gap-1 mb-3">
                    <Icon name="location_on" className="text-[14px]" />
                    {property.city}{property.address ? `, ${property.address}` : ''}
                </p>

                {/* Caractéristiques */}
                <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/10">
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
                    {property.floor != null && (
                        <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                            <Icon name="stairs" className="text-[14px]" />Ét. {property.floor}
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

                {/* Lien vers fiche */}
                <Link
                    to={`/annonce/${property.id}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-outline-variant/20 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container-low hover:border-primary/30 transition-all"
                >
                    Voir la fiche
                    <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
            </div>
        </div>
    )
}

// ─── Toggle Chip ──────────────────────────────────────────────────────────────
function Chip({ label, icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
            ${active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40 hover:text-on-surface'
                }`}
        >
            {icon && <Icon name={icon} className="text-[14px]" />}
            {label}
        </button>
    )
}

// ─── Page Annonces ────────────────────────────────────────────────────────────
const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan']
const ROOMS_OPTIONS = [1, 2, 3, 4, 5]
const SORT_OPTIONS = [
    { value: 'created_at_desc', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'surface_desc', label: 'Surface décroissante' },
]

export default function AnnoncesPage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // ── Filtres (initialisés depuis URL) ─────────────────────────────────────
    const [search, setSearch] = useState(searchParams.get('q') || '')
    const [city, setCity] = useState(searchParams.get('city') || '')
    const [type, setType] = useState(searchParams.get('type') || '')
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
    const [minSurface, setMinSurface] = useState(searchParams.get('minSurface') || '')
    const [maxSurface, setMaxSurface] = useState(searchParams.get('maxSurface') || '')
    const [rooms, setRooms] = useState(searchParams.get('rooms') || '')
    const [floor, setFloor] = useState(searchParams.get('floor') || '')
    const [hasElevator, setHasElevator] = useState(searchParams.get('elevator') === 'true')
    const [hasParking, setHasParking] = useState(searchParams.get('parking') === 'true')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at_desc')

    // ── État ──────────────────────────────────────────────────────────────────
    const [properties, setProperties] = useState([])
    const [favorites, setFavorites] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const [showFilters, setShowFilters] = useState(false)
    const PER_PAGE = 12

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()

    // ── Charger favoris ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return
        supabase
            .from('favorites')
            .select('property_id')
            .eq('user_id', user.id)
            .then(({ data }) => {
                if (data) setFavorites(new Set(data.map(f => f.property_id)))
            })
            .catch(() => { })
    }, [user])

    // ── Construire et lancer la requête Supabase ──────────────────────────────
    const fetchProperties = useCallback(async (resetPage = true) => {
        setLoading(true)
        const currentPage = resetPage ? 0 : page
        if (resetPage) setPage(0)

        try {
            let query = supabase
                .from('properties')
                .select('id,title,price,city,address,type,status,surface,rooms,floor,has_elevator,has_parking,images,created_at', { count: 'exact' })
                .eq('status', 'active')

            // Filtres texte
            if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
            if (city) query = query.eq('city', city)
            if (type) query = query.eq('type', type)
            if (minPrice) query = query.gte('price', Number(minPrice))
            if (maxPrice) query = query.lte('price', Number(maxPrice))
            if (minSurface) query = query.gte('surface', Number(minSurface))
            if (maxSurface) query = query.lte('surface', Number(maxSurface))
            if (rooms) query = query.eq('rooms', Number(rooms))
            if (floor) query = query.eq('floor', Number(floor))
            if (hasElevator) query = query.eq('has_elevator', true)
            if (hasParking) query = query.eq('has_parking', true)

            // Tri
            const [col, dir] = sortBy === 'created_at_desc' ? ['created_at', false]
                : sortBy === 'price_asc' ? ['price', true]
                    : sortBy === 'price_desc' ? ['price', false]
                        : sortBy === 'surface_desc' ? ['surface', false]
                            : ['created_at', false]
            query = query.order(col, { ascending: dir })

            // Pagination
            query = query.range(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE - 1)

            const { data, count, error } = await query
            if (error) throw error

            setProperties(data || [])
            setTotalCount(count || 0)

            // Sync URL params
            const params = {}
            if (search) params.q = search
            if (city) params.city = city
            if (type) params.type = type
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice
            if (minSurface) params.minSurface = minSurface
            if (maxSurface) params.maxSurface = maxSurface
            if (rooms) params.rooms = rooms
            if (floor) params.floor = floor
            if (hasElevator) params.elevator = 'true'
            if (hasParking) params.parking = 'true'
            if (sortBy !== 'created_at_desc') params.sort = sortBy
            setSearchParams(params, { replace: true })

        } catch (e) {
            console.warn('Erreur fetch annonces:', e.message)
            // Mode démo si tables absentes
            setProperties(DEMO_PROPERTIES)
            setTotalCount(DEMO_PROPERTIES.length)
        } finally {
            setLoading(false)
        }
    }, [search, city, type, minPrice, maxPrice, minSurface, maxSurface, rooms, floor, hasElevator, hasParking, sortBy, page])

    useEffect(() => { fetchProperties(true) }, [city, type, rooms, floor, hasElevator, hasParking, sortBy])

    const handleSearch = (e) => {
        e.preventDefault()
        fetchProperties(true)
    }

    const handleReset = () => {
        setSearch(''); setCity(''); setType('')
        setMinPrice(''); setMaxPrice('')
        setMinSurface(''); setMaxSurface('')
        setRooms(''); setFloor('')
        setHasElevator(false); setHasParking(false)
        setSortBy('created_at_desc')
    }

    const toggleFavorite = async (propertyId) => {
        if (!user) { toast.error('Connectez-vous pour sauvegarder'); return }
        const isFav = favorites.has(propertyId)
        if (isFav) {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId)
            setFavorites(prev => { const n = new Set(prev); n.delete(propertyId); return n })
            toast.success('Retiré des favoris')
        } else {
            await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId })
            setFavorites(prev => new Set([...prev, propertyId]))
            toast.success('Ajouté aux favoris ❤️')
        }
    }

    const totalPages = Math.ceil(totalCount / PER_PAGE)
    const activeFiltersCount = [city, type, minPrice, maxPrice, minSurface, maxSurface, rooms, floor, hasElevator, hasParking]
        .filter(Boolean).length

    async function handleSignOut() {
        await signOut()
        navigate('/auth')
    }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar displayName={displayName} initial={initial} avatarUrl={avatarUrl} onSignOut={handleSignOut} />

            <main className="flex-1 ml-64 p-10">

                {/* ── Header ─────────────────────────────────────────────── */}
                <header className="mb-8">
                    <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
                        Annonces
                    </h2>
                    <p className="text-on-surface-variant text-sm">
                        {loading ? 'Recherche en cours...' : `${totalCount} bien${totalCount !== 1 ? 's' : ''} trouvé${totalCount !== 1 ? 's' : ''}`}
                    </p>
                </header>

                {/* ── Barre de recherche principale ──────────────────────── */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un bien, une adresse..."
                            className="w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm text-on-surface placeholder:text-outline/50 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                        />
                    </div>

                    {/* Sélecteur ville */}
                    <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer min-w-[150px]"
                    >
                        <option value="">Toutes les villes</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    {/* Bouton rechercher */}
                    <button
                        type="submit"
                        className="px-6 py-3.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <Icon name="search" className="text-[18px]" />
                        Rechercher
                    </button>

                    {/* Bouton filtres */}
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3.5 rounded-xl text-sm font-medium border transition-all flex items-center gap-2
                        ${showFilters || activeFiltersCount > 0
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface hover:border-primary/30'}`}
                    >
                        <Icon name="tune" className="text-[18px]" />
                        Filtres
                        {activeFiltersCount > 0 && (
                            <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </form>

                {/* ── Type (chips rapides) ────────────────────────────────── */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-xs text-on-surface-variant font-medium">Type :</span>
                    {[
                        { value: '', label: 'Tous', icon: 'home' },
                        { value: 'sale', label: 'Vente', icon: 'sell' },
                        { value: 'rent', label: 'Location', icon: 'key' },
                        { value: 'land', label: 'Terrain', icon: 'landscape' },
                    ].map(t => (
                        <Chip key={t.value} label={t.label} icon={t.icon} active={type === t.value} onClick={() => setType(t.value)} />
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-on-surface-variant">Trier par :</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* ── Panneau filtres avancés ─────────────────────────────── */}
                {showFilters && (
                    <div className="mb-6 p-6 bg-surface-container-lowest border border-outline-variant/15 rounded-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-headline font-bold text-on-surface">Filtres avancés</h3>
                            <button onClick={handleReset} className="text-xs text-primary hover:underline flex items-center gap-1">
                                <Icon name="refresh" className="text-[14px]" /> Réinitialiser tout
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            {/* Budget min */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Prix min (MAD)</label>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    placeholder="Ex: 500 000"
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                            {/* Budget max */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Prix max (MAD)</label>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    placeholder="Ex: 2 000 000"
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                            {/* Surface min */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Surface min (m²)</label>
                                <input
                                    type="number"
                                    value={minSurface}
                                    onChange={e => setMinSurface(e.target.value)}
                                    placeholder="Ex: 50"
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                            {/* Surface max */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Surface max (m²)</label>
                                <input
                                    type="number"
                                    value={maxSurface}
                                    onChange={e => setMaxSurface(e.target.value)}
                                    placeholder="Ex: 300"
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            {/* Quartier */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Quartier</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Ex: Maarif, Hay Riad..."
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                            {/* Étage */}
                            <div>
                                <label className="block text-xs text-on-surface-variant mb-1.5 font-medium">Étage</label>
                                <input
                                    type="number"
                                    value={floor}
                                    onChange={e => setFloor(e.target.value)}
                                    placeholder="Ex: 2"
                                    min="0"
                                    className="w-full px-3 py-2.5 bg-surface-container border border-outline-variant/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40"
                                />
                            </div>
                        </div>

                        {/* Nombre de pièces */}
                        <div className="mb-5">
                            <label className="block text-xs text-on-surface-variant mb-2 font-medium">Nombre de chambres</label>
                            <div className="flex gap-2 flex-wrap">
                                <Chip label="Peu importe" active={rooms === ''} onClick={() => setRooms('')} />
                                {ROOMS_OPTIONS.map(r => (
                                    <Chip key={r} label={r === 5 ? '5+' : `${r}`} active={rooms === String(r)} onClick={() => setRooms(String(r))} />
                                ))}
                            </div>
                        </div>

                        {/* Équipements */}
                        <div>
                            <label className="block text-xs text-on-surface-variant mb-2 font-medium">Équipements</label>
                            <div className="flex gap-2 flex-wrap">
                                <Chip label="Ascenseur" icon="elevator" active={hasElevator} onClick={() => setHasElevator(!hasElevator)} />
                                <Chip label="Parking" icon="local_parking" active={hasParking} onClick={() => setHasParking(!hasParking)} />
                            </div>
                        </div>

                        {/* Appliquer */}
                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={() => { fetchProperties(true); setShowFilters(false) }}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
                            >
                                <Icon name="check" className="text-[16px]" />
                                Appliquer les filtres
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Filtres actifs (chips résumé) ───────────────────────── */}
                {activeFiltersCount > 0 && !showFilters && (
                    <div className="flex gap-2 mb-5 flex-wrap items-center">
                        <span className="text-xs text-on-surface-variant">Filtres actifs :</span>
                        {city && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{city} <button onClick={() => setCity('')}>×</button></span>}
                        {type && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{{ sale: 'Vente', rent: 'Location', land: 'Terrain' }[type]} <button onClick={() => setType('')}>×</button></span>}
                        {minPrice && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">Min {Number(minPrice).toLocaleString()} MAD <button onClick={() => setMinPrice('')}>×</button></span>}
                        {maxPrice && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">Max {Number(maxPrice).toLocaleString()} MAD <button onClick={() => setMaxPrice('')}>×</button></span>}
                        {rooms && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">{rooms} ch. <button onClick={() => setRooms('')}>×</button></span>}
                        {hasElevator && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">Ascenseur <button onClick={() => setHasElevator(false)}>×</button></span>}
                        {hasParking && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-1">Parking <button onClick={() => setHasParking(false)}>×</button></span>}
                        <button onClick={handleReset} className="text-xs text-error hover:underline ml-1">Tout effacer</button>
                    </div>
                )}

                {/* ── Grille des annonces ─────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-24 bg-surface-container-low rounded-2xl">
                        <Icon name="search_off" className="text-[72px] text-outline-variant mb-4" />
                        <h3 className="font-headline font-bold text-xl mb-2">Aucun résultat</h3>
                        <p className="text-on-surface-variant text-sm mb-6">Aucune annonce ne correspond à vos critères.</p>
                        <button onClick={handleReset} className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(p => (
                            <PropertyCard
                                key={p.id}
                                property={p}
                                isFavorite={favorites.has(p.id)}
                                onToggleFavorite={toggleFavorite}
                            />
                        ))}
                    </div>
                )}

                {/* ── Pagination ──────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => { setPage(p => p - 1); fetchProperties(false) }}
                            disabled={page === 0}
                            className="p-2.5 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Icon name="chevron_left" className="text-[20px]" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => { setPage(i); fetchProperties(false) }}
                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all
                                ${i === page ? 'bg-primary text-white' : 'border border-outline-variant/20 hover:bg-surface-container-low text-on-surface'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => { setPage(p => p + 1); fetchProperties(false) }}
                            disabled={page >= totalPages - 1}
                            className="p-2.5 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Icon name="chevron_right" className="text-[20px]" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}

