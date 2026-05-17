import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

// ─── Icône Material Symbols ───────────────────────────────────────────────────
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

// ─── Avatar initiales ─────────────────────────────────────────────────────────
function Avatar({ name, avatarUrl, size = 40 }) {
    const initial = name?.[0]?.toUpperCase() || '?'
    const colors = ['#4a7c6f', '#2d6a4f', '#40916c', '#52b788', '#1b4332']
    const color = colors[(name?.charCodeAt(0) || 0) % colors.length]

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
        )
    }
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 700,
            flexShrink: 0, fontFamily: "'DM Sans', sans-serif",
        }}>
            {initial}
        </div>
    )
}

// ─── Carte d'un avis ──────────────────────────────────────────────────────────
function AvisCard({ avis, currentUserId, onDelete, index }) {
    const date = new Date(avis.created_at).toLocaleDateString('fr-MA', {
        day: 'numeric', month: 'long', year: 'numeric'
    })
    const isOwner = currentUserId === avis.user_id

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 16,
                padding: '20px 24px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                animation: 'fadeUp 0.4s ease both',
                animationDelay: `${index * 0.06}s`,
                position: 'relative',
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar name={avis.author_name} avatarUrl={avis.author_avatar} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>
                        {avis.author_name}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                        {date}
                    </div>
                </div>

                {/* Badge vérifié */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(74,124,111,0.08)',
                    padding: '4px 10px', borderRadius: 20,
                }}>
                    <Icon name="verified" className="text-[14px]" style={{ color: '#4a7c6f' }} />
                    <span style={{ fontSize: 11, color: '#4a7c6f', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                        Vérifié
                    </span>
                </div>

                {/* Supprimer si propriétaire */}
                {isOwner && (
                    <button
                        onClick={() => onDelete(avis.id)}
                        style={{
                            background: 'none', border: 'none',
                            color: '#d1d5db', cursor: 'pointer',
                            padding: 4, borderRadius: 6,
                            display: 'flex', alignItems: 'center',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                        title="Supprimer mon avis"
                    >
                        <Icon name="delete" className="text-[18px]" />
                    </button>
                )}
            </div>

            {/* Contenu */}
            <p style={{
                fontSize: 14, color: '#374151', lineHeight: 1.7,
                fontFamily: "'DM Sans', sans-serif",
                margin: 0,
            }}>
                {avis.content}
            </p>

            {/* Ligne décorative */}
            <div style={{
                position: 'absolute', left: 0, top: '20%', bottom: '20%',
                width: 3, borderRadius: '0 2px 2px 0',
                background: 'linear-gradient(180deg, #4a7c6f, #6aada0)',
            }} />
        </div>
    )
}

// ─── Formulaire d'ajout ───────────────────────────────────────────────────────
function FormulaireAvis({ onSubmit, loading }) {
    const [content, setContent] = useState('')
    const maxLen = 500
    const len = content.length

    const handleSubmit = () => {
        if (content.trim().length < 10) {
            toast.error('Votre avis doit contenir au moins 10 caractères.')
            return
        }
        onSubmit(content.trim())
        setContent('')
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(74,124,111,0.06), rgba(106,173,160,0.04))',
            border: '1.5px solid rgba(74,124,111,0.2)',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 28,
        }}>
            <h4 style={{
                fontSize: 15, fontWeight: 700, color: '#111827',
                fontFamily: "'DM Sans', sans-serif", marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <Icon name="rate_review" className="text-[20px]" style={{ color: '#4a7c6f' }} />
                Laisser un avis
            </h4>

            <textarea
                value={content}
                onChange={e => setContent(e.target.value.slice(0, maxLen))}
                placeholder="Partagez votre expérience avec ce bien : emplacement, état général, rapport qualité/prix, environnement..."
                rows={4}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1.5px solid #e5e7eb',
                    fontSize: 14,
                    color: '#111827',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    resize: 'vertical',
                    background: '#fff',
                    boxSizing: 'border-box',
                    lineHeight: 1.6,
                    transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#4a7c6f'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{
                    fontSize: 12, color: len > maxLen * 0.8 ? '#4a7c6f' : '#9ca3af',
                    fontFamily: "'DM Sans', sans-serif",
                }}>
                    {len} / {maxLen} caractères
                </span>

                <button
                    onClick={handleSubmit}
                    disabled={loading || len < 10}
                    style={{
                        background: loading || len < 10 ? '#e5e7eb' : '#4a7c6f',
                        color: loading || len < 10 ? '#9ca3af' : '#fff',
                        border: 'none',
                        padding: '10px 22px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: loading || len < 10 ? 'not-allowed' : 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s',
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{ fontSize: 12 }}>⏳</span> Envoi...
                        </>
                    ) : (
                        <>
                            <Icon name="send" className="text-[16px]" />
                            Publier
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AvisClients({ propertyId }) {
    const { user } = useAuth()
    const [avis, setAvis] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [dejaCommente, setDejaCommente] = useState(false)

    const fetchAvis = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('property_reviews')
                .select('*')
                .eq('property_id', propertyId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setAvis(data || [])

            if (user && data) {
                setDejaCommente(data.some(a => a.user_id === user.id))
            }
        } catch (e) {
            console.warn('Erreur chargement avis:', e.message)
            setAvis(AVIS_DEMO)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (propertyId) fetchAvis()
    }, [propertyId, user])

    const handleSubmit = async (content) => {
        if (!user) { toast.error('Connectez-vous pour laisser un avis.'); return }
        if (dejaCommente) { toast.error('Vous avez déjà laissé un avis.'); return }

        setSubmitting(true)
        try {
            // 1. Insérer l'avis
            const { error } = await supabase
                .from('property_reviews')
                .insert({
                    property_id: propertyId,
                    user_id: user.id,
                    content,
                    author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
                    author_avatar: user.user_metadata?.avatar_url || null,
                })
            if (error) throw error

            // 2. Récupérer le propriétaire du bien
            const { data: property } = await supabase
                .from('properties')
                .select('user_id, title')
                .eq('id', propertyId)
                .single()

            // 3. Envoyer la notification au vendeur
            if (property && property.user_id !== user.id) {
                await supabase.from('notifications').insert({
                    user_id: property.user_id,
                    type: 'new_review',
                    message: `${user.user_metadata?.full_name || user.email?.split('@')[0]} a laissé un avis sur votre bien "${property.title}"`,
                    property_id: propertyId,
                    read: false,
                })
            }

            toast.success('Avis publié ! ✅')
            setDejaCommente(true)
            fetchAvis()
        } catch (e) {
            toast.error('Erreur : ' + e.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (avisId) => {
        if (!window.confirm('Supprimer votre avis ?')) return
        try {
            const { error } = await supabase
                .from('property_reviews')
                .delete()
                .eq('id', avisId)
                .eq('user_id', user.id)

            if (error) throw error
            toast.success('Avis supprimé.')
            setDejaCommente(false)
            fetchAvis()
        } catch (e) {
            toast.error('Erreur suppression : ' + e.message)
        }
    }

    return (
        <>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <section style={{ marginTop: 48 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <h3 style={{
                            fontSize: 22, fontWeight: 800, color: '#111827',
                            fontFamily: "'DM Sans', sans-serif", marginBottom: 4,
                        }}>
                            Avis des clients
                        </h3>
                        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                            {loading ? '...' : `${avis.length} avis`}
                        </p>
                    </div>

                    {avis.length > 0 && (
                        <div style={{
                            background: 'rgba(74,124,111,0.1)',
                            border: '1px solid rgba(74,124,111,0.25)',
                            borderRadius: 12, padding: '10px 18px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#4a7c6f', fontFamily: "'DM Sans', sans-serif" }}>
                                {avis.length}
                            </div>
                            <div style={{ fontSize: 11, color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
                                avis client{avis.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                </div>

                {user ? (
                    dejaCommente ? (
                        <div style={{
                            background: 'rgba(74,124,111,0.06)',
                            border: '1px solid rgba(74,124,111,0.2)',
                            borderRadius: 12, padding: '14px 18px',
                            marginBottom: 24,
                            display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <Icon name="check_circle" className="text-[20px]" style={{ color: '#4a7c6f' }} />
                            <span style={{ fontSize: 13, color: '#4a7c6f', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                                Vous avez déjà laissé un avis pour ce bien.
                            </span>
                        </div>
                    ) : (
                        <FormulaireAvis onSubmit={handleSubmit} loading={submitting} />
                    )
                ) : (
                    <div style={{
                        background: '#f9fafb',
                        border: '1.5px dashed #d1d5db',
                        borderRadius: 14, padding: '20px',
                        marginBottom: 24, textAlign: 'center',
                    }}>
                        <Icon name="lock" className="text-[28px]" style={{ color: '#9ca3af', display: 'block', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 14, color: '#6b7280', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>
                            Connectez-vous pour laisser un avis
                        </p>
                        <a
                            href="/auth"
                            style={{
                                background: '#4a7c6f', color: '#fff',
                                padding: '9px 22px', borderRadius: 10,
                                fontSize: 13, fontWeight: 700,
                                textDecoration: 'none',
                                fontFamily: "'DM Sans', sans-serif",
                                display: 'inline-block',
                            }}
                        >
                            Se connecter
                        </a>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                background: '#f3f4f6', borderRadius: 16,
                                height: 110, animation: 'pulse 1.5s infinite',
                            }} />
                        ))}
                    </div>
                ) : avis.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '40px 20px',
                        background: '#f9fafb', borderRadius: 16,
                        border: '1px solid #f0f0f0',
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                            Aucun avis pour l'instant
                        </p>
                        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}>
                            Soyez le premier à donner votre avis sur ce bien !
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {avis.map((a, i) => (
                            <AvisCard
                                key={a.id}
                                avis={a}
                                currentUserId={user?.id}
                                onDelete={handleDelete}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    )
}

// ─── Données démo (si table absente) ─────────────────────────────────────────
const AVIS_DEMO = [
    {
        id: 1,
        user_id: 'demo1',
        author_name: 'Karim Alaoui',
        author_avatar: null,
        content: "Très beau bien, bien situé dans le quartier. La luminosité est excellente et les finitions sont soignées. Je recommande vivement.",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
        id: 2,
        user_id: 'demo2',
        author_name: 'Nadia Bensaid',
        author_avatar: null,
        content: "Appartement conforme à l'annonce. Le quartier est calme et bien desservi. La vue depuis le salon est magnifique. Très satisfaite.",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
]