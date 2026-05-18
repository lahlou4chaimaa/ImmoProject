import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import AvisClients from '../components/AvisClients'
import ShareButton from '../components/ShareButton'

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
// ─── Composant formulaire de contact ────────────────────────────────────────
function ContactCard({ property, user }) {
    const [showForm, setShowForm] = useState(false)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    // Empêche d'envoyer un message à soi-même
    const isSeller = user?.id === property.user_id

    const handleSend = async () => {
        if (!user) { toast.error('Connectez-vous pour envoyer un message'); return }
        if (!message.trim()) { toast.error('Écrivez un message'); return }
        if (isSeller) { toast.error('Vous ne pouvez pas vous contacter vous-même'); return }

        setSending(true)
        try {
            const { error } = await supabase.from('messages').insert({
                property_id: property.id,
                sender_id: user.id,
                receiver_id: property.user_id,
                content: message.trim(),
            })
            if (error) throw error
            setSent(true)
            setMessage('')
            toast.success('Message envoyé au vendeur !')
        } catch (err) {
            toast.error(err.message || 'Erreur lors de l\'envoi')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15">
            <h3 className="font-headline font-bold text-lg mb-1">Intéressé par ce bien ?</h3>
            <p className="text-xs text-on-surface-variant mb-5">
                Contactez le propriétaire sans partager votre numéro
            </p>

            {/* État : envoyé avec succès */}
            {sent ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="check_circle" className="text-green-600 text-[28px]" />
                    </div>
                    <p className="font-semibold text-on-surface text-sm">Message envoyé !</p>
                    <p className="text-xs text-on-surface-variant">
                        Le vendeur vous répondra via la messagerie DarNa.
                    </p>
                    <button
                        onClick={() => { setSent(false); setShowForm(false) }}
                        className="text-xs text-primary hover:underline mt-1"
                    >
                        Envoyer un autre message
                    </button>
                </div>
            ) : !showForm ? (
                /* Boutons initiaux */
                <div className="flex flex-col gap-3">
                    {isSeller ? (
                        <div className="w-full py-3 bg-surface-container text-on-surface-variant rounded-xl text-sm text-center">
                            C'est votre annonce
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <Icon name="chat_bubble" className="text-[18px]" />
                            Envoyer un message
                        </button>
                    )}
                    <button className="w-full py-3 border border-outline-variant/30 text-on-surface rounded-xl font-medium text-sm hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                        <Icon name="call" className="text-[18px]" />
                        Demander un rappel
                    </button>
                </div>
            ) : (
                /* Formulaire message */
                <div className="flex flex-col gap-3">
                    {/* Messages rapides */}
                    <div>
                        <p className="text-xs text-on-surface-variant mb-2 font-medium">Messages rapides :</p>
                        <div className="flex flex-col gap-1.5">
                            {[
                                'Bonjour, ce bien est-il toujours disponible ?',
                                'Je souhaite organiser une visite, quand êtes-vous disponible ?',
                                'Pouvez-vous me donner plus d\'informations sur ce bien ?',
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setMessage(suggestion)}
                                    className="text-left text-xs px-3 py-2 bg-surface-container rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zone de texte */}
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Écrivez votre message au vendeur..."
                        rows={4}
                        className="w-full px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-outline/40 resize-none"
                    />

                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Icon name="lock" className="text-[12px]" />
                        Votre numéro de téléphone ne sera jamais partagé.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowForm(false); setMessage('') }}
                            className="flex-1 py-2.5 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm font-medium hover:bg-surface-container-low transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={sending || !message.trim()}
                            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {sending
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Icon name="send" className="text-[16px]" />Envoyer</>
                            }
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
export default function AnnonceDetailPage() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [property, setProperty] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isFavorite, setIsFavorite] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)

    const fmt = (n) => new Intl.NumberFormat('fr-MA', {
        style: 'currency', currency: 'MAD', maximumFractionDigits: 0
    }).format(n)

    const typeLabel = { sale: 'Vente', rent: 'Location', land: 'Terrain' }
    const typeColor = { sale: 'bg-blue-500', rent: 'bg-teal-500', land: 'bg-amber-500' }

    const statusConfig = {
        sold:   { label: 'Vendu',  banner: "Ce bien a été vendu et n'est plus disponible." },
        rented: { label: 'Loué',   banner: "Ce bien a été loué et n'est plus disponible." },
    }

    const isUnavailable = property?.status === 'sold' || property?.status === 'rented'

    useEffect(() => {
        const loadProperty = async () => {
            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', id)
                    .single()
                if (error) throw error
                setProperty(data)
            } catch (e) {
                console.error('Erreur:', e)
                toast.error('Annonce introuvable')
                navigate('/annonces')
            } finally {
                setLoading(false)
            }
        }
        loadProperty()
    }, [id, navigate])

    useEffect(() => {
        if (!user || !property) return

        const loadUserMeta = async () => {
            try {
                await supabase.from('property_views').insert({
                    user_id: user.id,
                    property_id: id,
                })
            } catch (_) { }

            try {
                const { data: fav } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('property_id', id)
                    .single()
                setIsFavorite(!!fav)
            } catch (_) {
                setIsFavorite(false)
            }
        }
        loadUserMeta()
    }, [user, property, id])

    const toggleFavorite = async () => {
        if (!user) { toast.error('Connectez-vous pour sauvegarder'); return }
        if (isFavorite) {
            await supabase.from('favorites').delete()
                .eq('user_id', user.id).eq('property_id', id)
            setIsFavorite(false)
            toast.success('Retiré des favoris')
        } else {
            await supabase.from('favorites').insert({ user_id: user.id, property_id: id })
            setIsFavorite(true)
            toast.success('Ajouté aux favoris ❤️')
        }
    }

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

    if (!property) return null

    const images = property.images || []
    const statusCfg = statusConfig[property.status]

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar activePage="/annonces" />

            <main className="flex-1 ml-64 p-10">

                {/* Retour */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-sm font-medium"
                >
                    <Icon name="arrow_back" className="text-[20px]" />
                    Retour aux annonces
                </button>

                {/* Bannière Vendu / Loué */}
                {isUnavailable && (
                    <div className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
                        property.status === 'sold'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-purple-50 border border-purple-200'
                    }`}>
                        <Icon
                            name={property.status === 'sold' ? 'sell' : 'key'}
                            className={`text-[24px] ${property.status === 'sold' ? 'text-red-600' : 'text-purple-600'}`}
                        />
                        <div>
                            <p className={`font-bold text-sm ${property.status === 'sold' ? 'text-red-800' : 'text-purple-800'}`}>
                                Bien {property.status === 'sold' ? 'Vendu' : 'Loué'}
                            </p>
                            <p className={`text-xs ${property.status === 'sold' ? 'text-red-600' : 'text-purple-600'}`}>
                                {statusCfg?.banner}
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-12 gap-8">

                    {/* ── Colonne gauche ── */}
                    <div className="col-span-12 lg:col-span-8">

                        {/* Image principale */}
                        <div className="relative rounded-2xl overflow-hidden h-[420px] mb-3 bg-surface-container">
                            {images[selectedImage] ? (
                                <img
                                    src={images[selectedImage]}
                                    alt={property.title}
                                    className={`w-full h-full object-cover ${isUnavailable ? 'opacity-60' : ''}`}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Icon name="home" className="text-[80px] text-outline-variant" />
                                </div>
                            )}

                            {/* Badge type */}
                            <span className={`absolute top-4 left-4 px-3 py-1.5 ${typeColor[property.type] || 'bg-primary'} text-white text-xs font-semibold rounded-full uppercase tracking-wider`}>
                                {typeLabel[property.type] || property.type}
                            </span>

                            {/* Badge Vendu / Loué */}
                            {isUnavailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-white font-extrabold text-4xl uppercase tracking-widest rotate-[-15deg] border-4 border-white px-6 py-2 rounded-xl ${
                                        property.status === 'sold' ? 'bg-red-600/85' : 'bg-purple-600/85'
                                    }`}>
                                        {property.status === 'sold' ? 'Vendu' : 'Loué'}
                                    </span>
                                </div>
                            )}

                            {/* Bouton favori */}
                            {!isUnavailable && (
                                <button
                                    onClick={toggleFavorite}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                                >
                                    <Icon name="favorite" filled={isFavorite}
                                        className={`text-[20px] ${isFavorite ? 'text-error' : 'text-outline-variant'}`} />
                                </button>
                            )}
                        </div>

                        {/* Miniatures */}
                        {images.length > 1 && (
                            <div className="flex gap-2 mb-8">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                            selectedImage === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Titre et prix */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-headline font-extrabold text-on-surface mb-2">
                                    {property.title}
                                </h1>
                                <p className="text-on-surface-variant flex items-center gap-1">
                                    <Icon name="location_on" className="text-primary text-[18px]" />
                                    {property.address ? `${property.address}, ` : ''}{property.city}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-headline font-extrabold ${isUnavailable ? 'text-outline line-through' : 'text-primary'}`}>
                                    {fmt(property.price)}
                                </p>
                                {property.type === 'rent' && !isUnavailable && (
                                    <p className="text-xs text-on-surface-variant mt-1">/ mois</p>
                                )}
                                {isUnavailable && (
                                    <p className={`text-sm font-bold mt-1 ${property.status === 'sold' ? 'text-red-600' : 'text-purple-600'}`}>
                                        {property.status === 'sold' ? '🏷️ Vendu' : '🔑 Loué'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Caractéristiques */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {property.surface && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl text-center">
                                    <Icon name="square_foot" className="text-primary text-[24px] mb-1" />
                                    <p className="text-lg font-bold">{property.surface} m²</p>
                                    <p className="text-xs text-on-surface-variant">Surface</p>
                                </div>
                            )}
                            {property.rooms && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl text-center">
                                    <Icon name="bed" className="text-primary text-[24px] mb-1" />
                                    <p className="text-lg font-bold">{property.rooms}</p>
                                    <p className="text-xs text-on-surface-variant">Chambres</p>
                                </div>
                            )}
                            {property.floor != null && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl text-center">
                                    <Icon name="stairs" className="text-primary text-[24px] mb-1" />
                                    <p className="text-lg font-bold">Étage {property.floor}</p>
                                    <p className="text-xs text-on-surface-variant">Niveau</p>
                                </div>
                            )}
                            {property.has_elevator && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl text-center">
                                    <Icon name="elevator" className="text-primary text-[24px] mb-1" />
                                    <p className="text-lg font-bold">Oui</p>
                                    <p className="text-xs text-on-surface-variant">Ascenseur</p>
                                </div>
                            )}
                            {property.has_parking && (
                                <div className="bg-surface-container-lowest p-4 rounded-xl text-center">
                                    <Icon name="local_parking" className="text-primary text-[24px] mb-1" />
                                    <p className="text-lg font-bold">Oui</p>
                                    <p className="text-xs text-on-surface-variant">Parking</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div className="mb-8">
                                <h2 className="text-xl font-headline font-bold mb-4">Description</h2>
                                <div className="bg-surface-container-lowest p-6 rounded-2xl">
                                    <p className="text-on-surface-variant leading-relaxed text-sm">
                                        {property.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Localisation */}
                        {property.lat && property.lng && (
                            <div className="mb-8">
                                <h2 className="text-xl font-headline font-bold mb-4">Localisation</h2>
                                <div className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-3">
                                    <Icon name="location_on" className="text-primary text-[24px]" />
                                    <div>
                                        <p className="font-medium text-on-surface">{property.city}</p>
                                        {property.address && (
                                            <p className="text-sm text-on-surface-variant">{property.address}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => navigate('/carte')}
                                        className="ml-auto px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
                                    >
                                        Voir sur la carte
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Avis clients */}
                        <AvisClients propertyId={property.id} />

                    </div>

                    {/* ── Colonne droite — Contact ── */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="sticky top-10">

                            {/* Card contact */}
                            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/15 mb-4">
                                <h3 className="font-headline font-bold text-lg mb-1">Intéressé par ce bien ?</h3>
                                <p className="text-xs text-on-surface-variant mb-5">Contactez le propriétaire directement</p>

                                <button className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-3">
                                    <Icon name="chat_bubble" className="text-[18px]" />
                                    Envoyer un message
                                </button>

                                <button className="w-full py-3 border border-outline-variant/30 text-on-surface rounded-xl font-medium text-sm hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                                    <Icon name="call" className="text-[18px]" />
                                    Demander un rappel
                                </button>
                            </div>

                            {/* Favori */}
                            <button
                                onClick={toggleFavorite}
                                className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border ${
                                    isFavorite
                                        ? 'bg-error/10 text-error border-error/20 hover:bg-error/20'
                                        : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <Icon name="favorite" filled={isFavorite} className="text-[18px]" />
                                {isFavorite ? 'Retirer des favoris' : 'Sauvegarder'}
                            </button>

                            {/* Infos publication */}
                            <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
                                <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-1">
                                    <Icon name="calendar_today" className="text-[14px]" />
                                    Publié le {new Date(property.created_at).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                                    <Icon name="visibility" className="text-[14px]" />
                                    {property.views || 0} vue{property.views !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* ── fin colonne droite ── */}

                </div>

                {/* Footer */}
                <footer className="py-10 flex justify-between items-center border-t border-outline-variant/15 mt-16 text-sm">
                    <span className="text-outline">© 2025 DarNa — Plateforme Immobilière Marocaine</span>
                    <div className="flex gap-5">
                        <a href="#" className="text-outline hover:text-on-surface">Confidentialité</a>
                        <a href="#" className="text-outline hover:text-on-surface">CGU</a>
                    </div>
                </footer>

            </main>
        </div>
    )
}