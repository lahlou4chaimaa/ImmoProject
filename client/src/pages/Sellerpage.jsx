import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function Sidebar({ displayName, initial, avatarUrl, activePage, onSignOut, unreadCount = 0 }) {
    const links = [
        { icon: 'dashboard', label: 'Tableau de bord', to: 'dashboard' },
        { icon: 'add_circle', label: 'Publier une annonce', to: 'new' },
        { icon: 'domain', label: 'Mes annonces', to: 'listings' },
        { icon: 'chat_bubble', label: 'Messages reçus', to: 'messages', badge: unreadCount },
    ]
    return (
        <aside className="h-screen w-64 fixed left-0 top-0 bg-surface flex flex-col p-6 z-50 border-r border-outline-variant/20">
            <div className="mb-8">
                <p className="text-base font-headline font-extrabold text-primary">DarNa</p>
                <p className="text-[10px] text-outline uppercase tracking-widest mt-1">Espace Vendeur</p>
            </div>
            <nav className="flex flex-col gap-1">
                {links.map(l => (
                    <button
                        key={l.to}
                        onClick={() => window.dispatchEvent(new CustomEvent('seller-nav', { detail: l.to }))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all text-left w-full
                            ${activePage === l.to
                                ? 'bg-secondary-container text-primary'
                                : 'text-outline hover:text-on-surface hover:translate-x-1'}`}
                    >
                        <Icon name={l.icon} className="text-[20px]" />
                        <span>{l.label}</span>
                        {l.badge > 0 && (
                            <span className="ml-auto bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                {l.badge}
                            </span>
                        )}
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
                        <p className="text-[10px] text-on-surface-variant">Vendeur / Agence</p>
                    </div>
                    <button onClick={onSignOut} className="text-outline hover:text-error transition-colors" title="Déconnexion">
                        <Icon name="logout" className="text-[18px]" />
                    </button>
                </div>
            </div>
        </aside>
    )
}

// ─── Formulaire de publication ───────────────────────────────────────────────
function NewListingForm({ onSuccess }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [imageUrls, setImageUrls] = useState([''])
    const [form, setForm] = useState({
        title: '', description: '', type: 'sale', price: '',
        surface: '', rooms: '', city: '', address: '',
        floor: '', has_elevator: false, has_parking: false,
        lat: '', lng: '',
    })

    const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan']
    const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
    const addImageUrl = () => setImageUrls(u => [...u, ''])
    const updateImageUrl = (i, val) => setImageUrls(u => u.map((v, idx) => idx === i ? val : v))
    const removeImageUrl = (i) => setImageUrls(u => u.filter((_, idx) => idx !== i))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user?.id) { toast.error('Session expirée, reconnectez-vous'); return }
        if (!form.title || !form.price || !form.city) { toast.error('Titre, prix et ville sont obligatoires'); return }

        setLoading(true)
        try {
            const images = imageUrls.filter(u => u.trim() !== '')
            const { error } = await supabase.from('properties').insert({
                title: form.title,
                description: form.description || null,
                type: form.type,
                price: Number(form.price),
                surface: form.surface ? Number(form.surface) : null,
                rooms: form.rooms ? Number(form.rooms) : null,
                city: form.city,
                address: form.address || null,
                floor: form.floor !== '' ? Number(form.floor) : null,
                has_elevator: form.has_elevator,
                has_parking: form.has_parking,
                lat: form.lat ? Number(form.lat) : null,
                lng: form.lng ? Number(form.lng) : null,
                images: images.length > 0 ? images : null,
                status: 'active',
                user_id: user.id,
            })
            if (error) throw error
            toast.success('Annonce publiée avec succès !')
            onSuccess()
        } catch (err) {
            console.error('Insert error:', err)
            toast.error(err.message || 'Erreur lors de la publication')
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-outline/40"
    const labelCls = "block text-xs font-medium text-on-surface-variant mb-1.5"

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl">
            <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-8">Publier une annonce</h3>

            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-5 border border-outline-variant/10">
                <h4 className="text-sm font-bold text-on-surface mb-5 flex items-center gap-2">
                    <Icon name="info" className="text-primary text-[18px]" />
                    Informations principales
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className={labelCls}>Titre de l'annonce *</label>
                        <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                            placeholder="Ex: Appartement moderne 3 pièces à Maarif" className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Type *</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                                <option value="sale">Vente</option>
                                <option value="rent">Location</option>
                                <option value="land">Terrain</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Prix (MAD) *</label>
                            <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                                placeholder="Ex: 1500000" className={inputCls} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder="Décrivez le bien en détail..." rows={4}
                            className={inputCls + ' resize-none'} />
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-5 border border-outline-variant/10">
                <h4 className="text-sm font-bold text-on-surface mb-5 flex items-center gap-2">
                    <Icon name="tune" className="text-primary text-[18px]" />
                    Caractéristiques
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Surface (m²)</label>
                        <input type="number" value={form.surface} onChange={e => set('surface', e.target.value)}
                            placeholder="Ex: 120" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Chambres</label>
                        <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)}
                            placeholder="Ex: 3" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Étage</label>
                        <input type="number" value={form.floor} onChange={e => set('floor', e.target.value)}
                            placeholder="Ex: 2" min="0" className={inputCls} />
                    </div>
                </div>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.has_elevator} onChange={e => set('has_elevator', e.target.checked)}
                            className="w-4 h-4 accent-primary rounded" />
                        <span className="text-sm text-on-surface">Ascenseur</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.has_parking} onChange={e => set('has_parking', e.target.checked)}
                            className="w-4 h-4 accent-primary rounded" />
                        <span className="text-sm text-on-surface">Parking</span>
                    </label>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-5 border border-outline-variant/10">
                <h4 className="text-sm font-bold text-on-surface mb-5 flex items-center gap-2">
                    <Icon name="location_on" className="text-primary text-[18px]" />
                    Localisation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Ville *</label>
                        <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} required>
                            <option value="">Sélectionner une ville</option>
                            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Adresse</label>
                        <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                            placeholder="Ex: 12 Rue Hassan II, Maarif" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Latitude (optionnel)</label>
                        <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)}
                            placeholder="Ex: 33.5731" className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Longitude (optionnel)</label>
                        <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)}
                            placeholder="Ex: -7.5898" className={inputCls} />
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 mb-8 border border-outline-variant/10">
                <h4 className="text-sm font-bold text-on-surface mb-5 flex items-center gap-2">
                    <Icon name="photo_library" className="text-primary text-[18px]" />
                    Photos (URLs)
                </h4>
                <div className="space-y-3">
                    {imageUrls.map((url, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input type="url" value={url} onChange={e => updateImageUrl(i, e.target.value)}
                                placeholder="https://exemple.com/photo.jpg"
                                className={inputCls + ' flex-1'} />
                            {url && (
                                <img src={url} alt="preview" onError={e => e.target.style.display = 'none'}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-outline-variant/20" />
                            )}
                            {imageUrls.length > 1 && (
                                <button type="button" onClick={() => removeImageUrl(i)}
                                    className="p-2 text-outline hover:text-error transition-colors flex-shrink-0">
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addImageUrl}
                        className="flex items-center gap-2 text-sm text-primary hover:underline mt-1">
                        <Icon name="add_circle" className="text-[16px]" />
                        Ajouter une photo
                    </button>
                </div>
            </div>

            <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publication...</>
                    : <><Icon name="publish" className="text-[18px]" /> Publier l'annonce</>
                }
            </button>
        </form>
    )
}

// ─── Liste des annonces du vendeur ───────────────────────────────────────────
function MyListings({ user }) {
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusMenu, setStatusMenu] = useState(null) // id de l'annonce dont le menu est ouvert

    const fmt = (n) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }

    // Config des statuts
    const statusConfig = {
        active:  { label: 'Active',  bg: 'bg-green-100',  text: 'text-green-800',  icon: 'check_circle' },
        sold:    { label: 'Vendu',   bg: 'bg-red-100',    text: 'text-red-800',    icon: 'sell' },
        rented:  { label: 'Loué',    bg: 'bg-purple-100', text: 'text-purple-800', icon: 'key' },
        inactive:{ label: 'Inactif', bg: 'bg-gray-100',   text: 'text-gray-600',   icon: 'pause_circle' },
    }

    const load = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('id, title, type, price, city, status, created_at, images, surface, rooms')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setListings(data || [])
        } catch {
            toast.error('Erreur chargement des annonces')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [user])

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette annonce ?')) return
        const { error } = await supabase.from('properties')
            .delete().eq('id', id).eq('user_id', user.id)
        if (error) return toast.error('Erreur suppression')
        toast.success('Annonce supprimée')
        load()
    }

    const handleSetStatus = async (id, newStatus) => {
        setStatusMenu(null)
        const { error } = await supabase.from('properties')
            .update({ status: newStatus })
            .eq('id', id)
            .eq('user_id', user.id)
        if (error) return toast.error(error.message)

        const messages = {
            active:  '✅ Annonce réactivée',
            sold:    '🏷️ Bien marqué comme Vendu',
            rented:  '🔑 Bien marqué comme Loué',
            inactive:'⏸️ Annonce désactivée',
        }
        toast.success(messages[newStatus])
        load()
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div>
            <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-8">Mes annonces</h3>
            {listings.length === 0 ? (
                <div className="text-center py-24 bg-surface-container-low rounded-2xl">
                    <Icon name="domain" className="text-[64px] text-outline-variant mb-3" />
                    <p className="text-on-surface-variant font-medium mb-4">Aucune annonce publiée</p>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('seller-nav', { detail: 'new' }))}
                        className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90">
                        Publier ma première annonce
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {listings.map(p => {
                        const cfg = statusConfig[p.status] || statusConfig.inactive
                        return (
                            <div key={p.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10">

                                {/* Image */}
                                <div className="h-44 bg-surface-container overflow-hidden relative">
                                    {p.images?.[0]
                                        ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center">
                                            <Icon name="home" className="text-[48px] text-outline-variant" />
                                          </div>
                                    }

                                    {/* Badge statut */}
                                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 ${cfg.bg} ${cfg.text}`}>
                                        <Icon name={cfg.icon} className="text-[12px]" />
                                        {cfg.label}
                                    </span>

                                    {/* Overlay si vendu/loué */}
                                    {(p.status === 'sold' || p.status === 'rented') && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <span className={`text-white font-extrabold text-2xl uppercase tracking-widest rotate-[-15deg] border-4 border-white px-4 py-1 rounded-lg ${p.status === 'sold' ? 'bg-red-600/80' : 'bg-purple-600/80'}`}>
                                                {p.status === 'sold' ? 'Vendu' : 'Loué'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="p-4">
                                    <p className="text-sm font-bold text-on-surface truncate mb-1">{p.title}</p>
                                    <p className="text-xs text-on-surface-variant mb-2">{p.city} · {typeLabel[p.type]}</p>
                                    <p className="text-base font-extrabold text-primary mb-3">{fmt(p.price)}</p>

                                    {/* Actions */}
                                    <div className="flex gap-2 relative">

                                        {/* Bouton changer statut */}
                                        <div className="flex-1 relative">
                                            <button
                                                onClick={() => setStatusMenu(statusMenu === p.id ? null : p.id)}
                                                className={`w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${cfg.bg} ${cfg.text} hover:opacity-80`}
                                            >
                                                <Icon name={cfg.icon} className="text-[14px]" />
                                                {cfg.label}
                                                <Icon name="expand_more" className="text-[14px]" />
                                            </button>

                                            {/* Dropdown statuts */}
                                            {statusMenu === p.id && (
                                                <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                                                    {Object.entries(statusConfig).map(([key, val]) => (
                                                        <button
                                                            key={key}
                                                            onClick={() => handleSetStatus(p.id, key)}
                                                            className={`w-full px-4 py-2.5 text-xs font-medium text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${p.status === key ? 'opacity-40 cursor-default' : ''}`}
                                                            disabled={p.status === key}
                                                        >
                                                            <Icon name={val.icon} className={`text-[16px] ${val.text}`} />
                                                            <span className={val.text}>{val.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Supprimer */}
                                        <button onClick={() => handleDelete(p.id)}
                                            className="p-2 bg-surface-container text-outline hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                                            <Icon name="delete" className="text-[16px]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Dashboard overview ──────────────────────────────────────────────────────
function SellerDashboard({ user, onNavigate }) {
    const [stats, setStats] = useState({ total: 0, active: 0, sold: 0, rented: 0 })

    useEffect(() => {
        supabase.from('properties').select('status').eq('user_id', user.id)
            .then(({ data }) => {
                if (!data) return
                setStats({
                    total:  data.length,
                    active: data.filter(p => p.status === 'active').length,
                    sold:   data.filter(p => p.status === 'sold').length,
                    rented: data.filter(p => p.status === 'rented').length,
                })
            })
    }, [user])

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]

    return (
        <div>
            <header className="mb-12">
                <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-2">
                    Bonjour, {displayName} 👋
                </h2>
                <p className="text-on-surface-variant">Gérez vos annonces immobilières depuis ce tableau de bord.</p>
            </header>

            <div className="grid grid-cols-4 gap-5 mb-10">
                {[
                    { label: 'Total annonces', value: stats.total,  icon: 'domain',        bg: 'bg-primary',      text: 'text-white' },
                    { label: 'Actives',         value: stats.active, icon: 'check_circle',  bg: 'bg-green-100',    text: 'text-green-800' },
                    { label: 'Vendus',          value: stats.sold,   icon: 'sell',          bg: 'bg-red-100',      text: 'text-red-800' },
                    { label: 'Loués',           value: stats.rented, icon: 'key',           bg: 'bg-purple-100',   text: 'text-purple-800' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} ${s.text} p-6 rounded-xl flex flex-col gap-3`}>
                        <Icon name={s.icon} className="text-[24px] opacity-80" />
                        <div>
                            <p className="text-3xl font-headline font-extrabold">{String(s.value).padStart(2, '0')}</p>
                            <p className="text-xs font-medium opacity-70 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-headline font-bold mb-2">Publiez votre prochain bien</h3>
                    <p className="text-on-surface-variant text-sm">Atteignez des milliers d'acheteurs potentiels au Maroc.</p>
                </div>
                <button onClick={() => onNavigate('new')}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all flex-shrink-0">
                    <Icon name="add_circle" className="text-[18px]" />
                    Nouvelle annonce
                </button>
            </div>
        </div>
    )
}
// ─── Messages reçus par le vendeur ──────────────────────────────────────────
function SellerMessages({ user }) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)

    const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })

    const load = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    id, content, read, created_at, property_id,
                    sender_id,
                    properties(id, title, images)
                `)
                .eq('receiver_id', user.id)
                .order('created_at', { ascending: false })
            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            toast.error('Erreur chargement des messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [user])

    const handleOpen = async (msg) => {
        setSelected(msg)
        setReply('')
        // Marquer comme lu
        if (!msg.read) {
            await supabase.from('messages').update({ read: true }).eq('id', msg.id)
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
        }
    }

    const handleReply = async () => {
        if (!reply.trim()) return
        setSending(true)
        try {
            const { error } = await supabase.from('messages').insert({
                property_id: selected.property_id,
                sender_id: user.id,
                receiver_id: selected.sender_id,
                content: reply.trim(),
            })
            if (error) throw error
            toast.success('Réponse envoyée !')
            setReply('')
            setSelected(null)
        } catch (err) {
            toast.error(err.message || 'Erreur envoi')
        } finally {
            setSending(false)
        }
    }

    const unreadCount = messages.filter(m => !m.read).length

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    )

    return (
        <div>
            <header className="mb-8 flex items-center gap-4">
                <div>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface">Messages reçus</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-primary text-white text-[10px] rounded-full font-semibold">
                                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>
            </header>

            {messages.length === 0 ? (
                <div className="text-center py-24 bg-surface-container-low rounded-2xl">
                    <Icon name="chat_bubble" className="text-[64px] text-outline-variant mb-3" />
                    <p className="text-on-surface-variant font-medium">Aucun message reçu pour l'instant</p>
                    <p className="text-xs text-outline mt-1">Les acheteurs intéressés vous contacteront ici.</p>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">

                    {/* Liste messages */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
                        {messages.map(msg => (
                            <button
                                key={msg.id}
                                onClick={() => handleOpen(msg)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                    selected?.id === msg.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-transparent bg-surface-container-lowest hover:border-outline-variant/30'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar initiale */}
                                    <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                                        A
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className={`text-sm font-semibold truncate ${!msg.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                                Acheteur intéressé
                                            </p>
                                            {!msg.read && (
                                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                                            )}
                                        </div>
                                        <p className="text-xs text-on-surface-variant truncate mb-1">
                                            📌 {msg.properties?.title || 'Annonce'}
                                        </p>
                                        <p className={`text-xs truncate ${!msg.read ? 'text-on-surface font-medium' : 'text-outline'}`}>
                                            {msg.content}
                                        </p>
                                        <p className="text-[10px] text-outline mt-1.5">{fmt(msg.created_at)}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Panneau détail + réponse */}
                    <div className="col-span-12 lg:col-span-7">
                        {selected ? (
                            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden">

                                {/* Header */}
                                <div className="p-5 border-b border-outline-variant/15 flex items-center gap-4">
                                    {selected.properties?.images?.[0] ? (
                                        <img src={selected.properties.images[0]} alt=""
                                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                                            <Icon name="home" className="text-outline-variant text-[24px]" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-on-surface-variant mb-0.5">Annonce concernée</p>
                                        <p className="font-bold text-on-surface text-sm">
                                            {selected.properties?.title || 'Annonce'}
                                        </p>
                                        <p className="text-[10px] text-outline mt-0.5">
                                            Reçu le {fmt(selected.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="p-5">
                                    <div className="flex items-start gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                                            A
                                        </div>
                                        <div className="bg-surface-container px-4 py-3 rounded-2xl rounded-tl-none max-w-sm">
                                            <p className="text-sm text-on-surface leading-relaxed">{selected.content}</p>
                                        </div>
                                    </div>

                                    {/* Zone réponse */}
                                    <div className="border-t border-outline-variant/15 pt-5">
                                        <p className="text-xs font-medium text-on-surface-variant mb-3">Votre réponse :</p>
                                        <textarea
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            placeholder="Écrivez votre réponse à l'acheteur..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-outline/40 resize-none mb-3"
                                        />
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                                <Icon name="lock" className="text-[12px]" />
                                                La réponse sera envoyée de façon anonyme
                                            </p>
                                            <button
                                                onClick={handleReply}
                                                disabled={sending || !reply.trim()}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                                            >
                                                {sending
                                                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    : <><Icon name="send" className="text-[16px]" />Répondre</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center py-20 bg-surface-container-low rounded-2xl">
                                <div className="text-center">
                                    <Icon name="chat_bubble_outline" className="text-[48px] text-outline-variant mb-3" />
                                    <p className="text-sm text-on-surface-variant">Sélectionnez un message pour le lire</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
// ─── Page principale vendeur ─────────────────────────────────────────────────
export default function SellerPage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [activePage, setActivePage] = useState('dashboard')
    const [unreadCount, setUnreadCount] = useState(0)

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Vendeur'
    const avatarUrl = user?.user_metadata?.avatar_url
    const initial = displayName[0]?.toUpperCase()

    useEffect(() => {
        const handler = (e) => setActivePage(e.detail)
        window.addEventListener('seller-nav', handler)
        return () => window.removeEventListener('seller-nav', handler)
    }, [])

    useEffect(() => {
        if (!user) return
        supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('read', false)
            .then(({ count }) => setUnreadCount(count || 0))
    }, [user, activePage])

    const handleSignOut = async () => { await signOut(); navigate('/auth') }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar
                displayName={displayName}
                initial={initial}
                avatarUrl={avatarUrl}
                activePage={activePage}
                onSignOut={handleSignOut}
                unreadCount={unreadCount}
            />

            <main className="flex-1 ml-64 p-10">
                {activePage === 'dashboard' && <SellerDashboard user={user} onNavigate={setActivePage} />}
                {activePage === 'new' && <NewListingForm onSuccess={() => setActivePage('listings')} />}
                {activePage === 'listings' && <MyListings user={user} />}
                {activePage === 'messages' && <SellerMessages user={user} />}
            </main>
        </div>
    )
}