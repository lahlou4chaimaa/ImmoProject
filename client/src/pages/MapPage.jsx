import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/Sidebar'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix icônes Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function Icon({ name, className = '' }) {
    return (
        <span className={`material-symbols-outlined select-none ${className}`}
            style={{ fontVariationSettings: `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>
            {name}
        </span>
    )
}

function createPriceIcon(price, isSelected = false) {
    const formatted = new Intl.NumberFormat('fr-MA', {
        style: 'currency', currency: 'MAD', maximumFractionDigits: 0
    }).format(price)
    return L.divIcon({
        className: '',
        html: `<div style="
            background: ${isSelected ? '#1a6b3a' : '#2d8653'};
            color: white;
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            transform: translateX(-50%);
            display: inline-block;
        ">${formatted}</div>`,
        iconAnchor: [0, 0],
    })
}

function FlyToProperty({ property }) {
    const map = useMap()
    useEffect(() => {
        if (property) map.flyTo([property.lat, property.lng], 14, { duration: 1 })
    }, [property, map])
    return null
}

export default function MapPage() {
    const [properties, setProperties] = useState([])
    const [selected, setSelected] = useState(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('all')

    const fmt = (n) => new Intl.NumberFormat('fr-MA', {
        style: 'currency', currency: 'MAD', maximumFractionDigits: 0
    }).format(n)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('id, title, description, type, price, surface, rooms, city, address, lat, lng, images')
                    .eq('status', 'active')
                    .not('lat', 'is', null)
                    .not('lng', 'is', null)
                if (error) throw error
                setProperties(data || [])
            } catch (e) {
                console.error('Erreur chargement:', e)
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
        return matchSearch && matchType
    })

    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar activePage="/carte" />

            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-headline font-extrabold text-primary">Carte des biens</h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            {filtered.length} bien{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Recherche */}
                        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
                            <Icon name="search" className="text-outline text-[18px]" />
                            <input
                                type="text"
                                placeholder="Ville, titre..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent text-sm outline-none w-40 placeholder:text-outline"
                            />
                        </div>

                        {/* Filtre type */}
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="px-4 py-2 bg-surface-container-low rounded-full text-sm outline-none text-on-surface"
                        >
                            <option value="all">Tous les types</option>
                            <option value="sale">Vente</option>
                            <option value="rent">Location</option>
                            <option value="land">Terrain</option>
                        </select>
                    </div>
                </header>

                {/* Liste + Carte */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Liste gauche */}
                    <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-outline-variant/20 bg-surface">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <Icon name="location_off" className="text-[48px] text-outline-variant mb-2" />
                                <p className="text-sm text-on-surface-variant">Aucun bien trouvé</p>
                            </div>
                        ) : (
                            <div className="p-3 flex flex-col gap-2">
                                {filtered.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelected(p)}
                                        className={`w-full text-left rounded-xl overflow-hidden transition-all border-2 ${
                                            selected?.id === p.id
                                                ? 'border-primary shadow-md'
                                                : 'border-transparent hover:border-outline-variant/30'
                                        }`}
                                    >
                                        {/* Image */}
                                        <div className="h-36 bg-surface-container overflow-hidden">
                                            {p.images?.[0]
                                                ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center">
                                                    <Icon name="home" className="text-[40px] text-outline-variant" />
                                                  </div>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="p-3 bg-surface-container-lowest">
                                            <p className="text-sm font-bold text-on-surface truncate">{p.title}</p>
                                            <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                                <Icon name="location_on" className="text-[14px] text-primary" />
                                                {p.city}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-extrabold text-primary">{fmt(p.price)}</span>
                                                <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                                    {typeLabel[p.type] || p.type}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 text-xs text-on-surface-variant mt-1">
                                                {p.rooms && <span className="flex items-center gap-0.5"><Icon name="bed" className="text-[13px]" />{p.rooms} ch.</span>}
                                                {p.surface && <span className="flex items-center gap-0.5"><Icon name="square_foot" className="text-[13px]" />{p.surface} m²</span>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Carte droite */}
                    <div className="flex-1 relative">
                        <MapContainer
                            center={[31.7917, -7.0926]}
                            zoom={6}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {selected && <FlyToProperty property={selected} />}

                            {filtered.map(p => (
                                <Marker
                                    key={p.id}
                                    position={[p.lat, p.lng]}
                                    icon={createPriceIcon(p.price, selected?.id === p.id)}
                                    eventHandlers={{ click: () => setSelected(p) }}
                                >
                                    <Popup>
                                        <div style={{ minWidth: '200px' }}>
                                            {p.images?.[0] && (
                                                <img src={p.images[0]} alt={p.title}
                                                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                                            )}
                                            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{p.title}</p>
                                            <p style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
                                                📍 {p.address || p.city}
                                            </p>
                                            <p style={{ color: '#2d8653', fontWeight: 'bold', fontSize: '14px' }}>
                                                {fmt(p.price)}
                                            </p>
                                            {p.rooms && (
                                                <p style={{ fontSize: '12px', color: '#666' }}>
                                                    🛏 {p.rooms} ch. · {p.surface} m²
                                                </p>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Badge résultats */}
                        <div className="absolute top-4 right-4 z-[1000] bg-surface px-4 py-2 rounded-full shadow-lg text-sm font-medium text-on-surface border border-outline-variant/20 flex items-center gap-1">
                            <Icon name="location_on" className="text-primary text-[16px]" />
                            {filtered.length} bien{filtered.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}