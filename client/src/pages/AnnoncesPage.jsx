import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'
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

// ─── Carte d'annonce ───────────────────────────────────────────────────────
function PropertyCard({ property, onNavigate }) {
    const fmt = (n) => new Intl.NumberFormat('fr-MA', {
        style: 'currency', currency: 'MAD', maximumFractionDigits: 0
    }).format(n)

    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }
    const typeColor = { sale: 'bg-blue-500', rent: 'bg-teal-500', land: 'bg-amber-500' }

    return (
        <div
            onClick={() => onNavigate(`/annonce/${property.id}`)}
            className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all group"
        >
            {/* Image */}
            <div className="h-48 bg-surface-container overflow-hidden relative">
                {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon name="home" className="text-[64px] text-outline-variant" />
                    </div>
                )}
                <span className={`absolute top-3 left-3 px-3 py-1.5 ${typeColor[property.type] || 'bg-primary'} text-white text-xs font-semibold rounded-full uppercase`}>
                    {typeLabel[property.type] || property.type}
                </span>
            </div>

            {/* Contenu */}
            <div className="p-4">
                <h3 className="font-headline font-bold text-on-surface mb-2 line-clamp-2">{property.title}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-3">
                    <Icon name="location_on" className="text-[14px]" />
                    {property.city}
                </p>

                {/* Caractéristiques */}
                <div className="flex gap-3 text-xs text-on-surface-variant mb-4">
                    {property.surface && <span className="flex items-center gap-1"><Icon name="square_foot" className="text-[12px]" />{property.surface} m²</span>}
                    {property.rooms && <span className="flex items-center gap-1"><Icon name="bed" className="text-[12px]" />{property.rooms} ch.</span>}
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
                    <span className="font-headline font-extrabold text-primary">{fmt(property.price)}</span>
                    {property.type === 'rent' && <span className="text-xs text-on-surface-variant">/ mois</span>}
                </div>
            </div>
        </div>
    )
}

export default function AnnoncesPage() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [filterCity, setFilterCity] = useState('all')
    const [cities, setCities] = useState([])

    const fmt = (n) => new Intl.NumberFormat('fr-MA', {
        style: 'currency', currency: 'MAD', maximumFractionDigits: 0
    }).format(n)

    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                if (error) throw error
                setProperties(data || [])

                // Récupérer les villes uniques
                const uniqueCities = [...new Set((data || []).map(p => p.city))].sort()
                setCities(uniqueCities)
            } catch (e) {
                console.error('Erreur:', e)
                toast.error('Erreur chargement des annonces')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = properties.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.city?.toLowerCase().includes(search.toLowerCase())
        const matchType = filterType === 'all' || p.type === filterType
        const matchCity = filterCity === 'all' || p.city === filterCity
        return matchSearch && matchType && matchCity
    })

    if (loading) {
        return (
            <div className="bg-background flex min-h-screen">
                <Sidebar activePage="/annonces" />
                <main className="flex-1 ml-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </main>
            </div>
        )
    }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar activePage="/annonces" />

            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-headline font-extrabold text-primary">Annonces Immobilières</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            {filtered.length} bien{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>

<div className="flex items-center gap-3 flex-wrap">
                    {/* Recherche */}
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
                        <Icon name="search" className="text-outline text-[18px]" />
                        <input
                            type="text"
                            placeholder="Titre, ville..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent w-48 text-sm outline-none text-on-surface placeholder:text-outline"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-all"
                    >
                        Voir biens récemment consultés
                    </button>
                    </div>
                </header>

                {/* Filtres */}
                <div className="px-8 py-4 border-b border-outline-variant/20 flex gap-4 items-center flex-shrink-0 bg-surface-container-low flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-on-surface-variant">Type :</label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container rounded-full text-sm outline-none text-on-surface border border-outline-variant/20"
                        >
                            <option value="all">Tous</option>
                            <option value="sale">Vente</option>
                            <option value="rent">Location</option>
                            <option value="land">Terrain</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-on-surface-variant">Ville :</label>
                        <select
                            value={filterCity}
                            onChange={e => setFilterCity(e.target.value)}
                            className="px-3 py-1.5 bg-surface-container rounded-full text-sm outline-none text-on-surface border border-outline-variant/20"
                        >
                            <option value="all">Toutes</option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {(filterType !== 'all' || filterCity !== 'all' || search) && (
                        <button
                            onClick={() => { setSearch(''); setFilterType('all'); setFilterCity('all') }}
                            className="ml-auto px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
                        >
                            <Icon name="close" className="text-[14px]" />
                            Réinitialiser
                        </button>
                    )}
                </div>

                {/* Grille d'annonces */}
                <div className="flex-1 overflow-auto px-8 py-6">
                    {filtered.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Icon name="home_work" className="text-[80px] text-outline-variant mx-auto mb-4" />
                                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Aucune annonce trouvée</h3>
                                <p className="text-on-surface-variant mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
                                <button
                                    onClick={() => { setSearch(''); setFilterType('all'); setFilterCity('all') }}
                                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Icon name="refresh" className="text-[16px]" />
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                            {filtered.map(property => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    onNavigate={navigate}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="py-4 px-8 flex justify-between items-center border-t border-outline-variant/15 bg-surface text-xs text-on-surface-variant flex-shrink-0">
                    <span>© 2025 DarNa — Plateforme Immobilière Marocaine</span>
                    <div className="flex gap-5">
                        <a href="#" className="hover:text-on-surface">Confidentialité</a>
                        <a href="#" className="hover:text-on-surface">CGU</a>
                    </div>
                </footer>

            </main>
        </div>
    )
}