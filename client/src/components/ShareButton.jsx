import { useState, useRef, useEffect } from 'react'
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

export default function ShareButton({ property }) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const ref = useRef(null)

    const url = window.location.href
    const title = property?.title || 'Découvrez ce bien sur DarNa'
    const price = property?.price
        ? new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(property.price)
        : ''
    const city = property?.city || ''

    const message = `🏠 ${title}${price ? ` — ${price}` : ''}${city ? ` à ${city}` : ''}\n\nVoir l'annonce sur DarNa :\n${url}`

    // Fermer en cliquant dehors
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    // Copier le lien
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Lien copié ! 🔗')
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error('Impossible de copier le lien')
        }
    }

    // WhatsApp
    const handleWhatsApp = () => {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(waUrl, '_blank', 'noopener,noreferrer')
        setOpen(false)
    }

    // Facebook
    const handleFacebook = () => {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        window.open(fbUrl, '_blank', 'noopener,noreferrer')
        setOpen(false)
    }

    // Twitter / X
    const handleTwitter = () => {
        const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} — ${price}\n${url}`)}`
        window.open(twUrl, '_blank', 'noopener,noreferrer')
        setOpen(false)
    }

    // Email
    const handleEmail = () => {
        const subject = encodeURIComponent(`Annonce immobilière : ${title}`)
        const body = encodeURIComponent(message)
        window.open(`mailto:?subject=${subject}&body=${body}`)
        setOpen(false)
    }

    // Web Share API (mobile natif)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text: message, url })
            } catch (e) {
                if (e.name !== 'AbortError') toast.error('Partage annulé')
            }
        } else {
            setOpen(true)
        }
    }

    const options = [
        {
            label: 'WhatsApp',
            icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            ),
            onClick: handleWhatsApp,
            bg: '#e7fbe9',
            hoverBg: '#d0f5d4',
        },
        {
            label: 'Facebook',
            icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            onClick: handleFacebook,
            bg: '#e7f0fd',
            hoverBg: '#d0e4fb',
        },
        {
            label: 'X (Twitter)',
            icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#000">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            onClick: handleTwitter,
            bg: '#f0f0f0',
            hoverBg: '#e4e4e4',
        },
        {
            label: 'Email',
            icon: <Icon name="mail" className="text-[18px]" style={{ color: '#ea4335' }} />,
            onClick: handleEmail,
            bg: '#fdecea',
            hoverBg: '#fbd8d5',
        },
        {
            label: copied ? 'Lien copié !' : 'Copier le lien',
            icon: <Icon name={copied ? 'check' : 'link'} className="text-[18px]" style={{ color: copied ? '#4a7c6f' : '#6b7280' }} />,
            onClick: handleCopy,
            bg: copied ? 'rgba(74,124,111,0.1)' : '#f9fafb',
            hoverBg: copied ? 'rgba(74,124,111,0.15)' : '#f3f4f6',
        },
    ]

    return (
        <>
            <style>{`
                @keyframes shareDropDown {
                    from { opacity: 0; transform: translateY(8px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes shareItemIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .share-option {
                    transition: background 0.15s, transform 0.15s;
                    cursor: pointer;
                }
                .share-option:hover { transform: translateX(3px); }
                .share-btn-main {
                    transition: all 0.2s;
                }
                .share-btn-main:hover {
                    background: rgba(74,124,111,0.12) !important;
                    border-color: #4a7c6f !important;
                    color: #4a7c6f !important;
                }
            `}</style>

            <div style={{ position: 'relative' }} ref={ref}>

                {/* ── Bouton principal ── */}
                <button
                    className="share-btn-main"
                    onClick={() => navigator.share ? handleNativeShare() : setOpen(o => !o)}
                    style={{
                        width: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '11px 0',
                        borderRadius: 12,
                        border: '1.5px solid #e5e7eb',
                        background: '#fff',
                        color: '#374151',
                        fontSize: 14, fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                >
                    <Icon name="share" className="text-[18px]" />
                    Partager cette annonce
                </button>

                {/* ── Panneau options ── */}
                {open && (
                    <div style={{
                        position: 'absolute',
                        bottom: '110%',
                        left: 0, right: 0,
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        zIndex: 999,
                        animation: 'shareDropDown 0.25s cubic-bezier(0.22,0.61,0.36,1)',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '14px 18px 12px',
                            borderBottom: '1px solid #f3f4f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'DM Sans', sans-serif" }}>
                                Partager via
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 2 }}
                            >
                                <Icon name="close" className="text-[18px]" />
                            </button>
                        </div>

                        {/* Options */}
                        <div style={{ padding: '8px 0' }}>
                            {options.map((opt, i) => (
                                <button
                                    key={opt.label}
                                    className="share-option"
                                    onClick={opt.onClick}
                                    style={{
                                        width: '100%',
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '11px 18px',
                                        background: 'transparent',
                                        border: 'none',
                                        textAlign: 'left',
                                        animation: 'shareItemIn 0.25s ease both',
                                        animationDelay: `${i * 0.05}s`,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = opt.hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Icône dans cercle coloré */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: opt.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {opt.icon}
                                    </div>
                                    <span style={{
                                        fontSize: 13, fontWeight: 600,
                                        color: opt.label === 'Lien copié !' ? '#4a7c6f' : '#374151',
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}>
                                        {opt.label}
                                    </span>
                                    {opt.label === 'Lien copié !' && (
                                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4a7c6f', fontFamily: "'DM Sans', sans-serif" }}>
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Aperçu du lien */}
                        <div style={{
                            margin: '4px 12px 12px',
                            padding: '10px 14px',
                            background: '#f9fafb',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                        }}>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Lien de l&apos;annonce
                            </div>
                            <div style={{
                                fontSize: 11, color: '#4a7c6f', fontFamily: 'monospace',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {url}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}