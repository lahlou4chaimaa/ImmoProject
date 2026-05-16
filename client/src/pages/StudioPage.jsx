import { useState, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'
import axios from 'axios'

function Icon({ name, filled = false, className = '' }) {
    return (
        <span className={`material-symbols-outlined select-none ${className}`}
            style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>
            {name}
        </span>
    )
}

const STYLES = [
    {
        id: 'moderne',
        label: 'Moderne',
        icon: '🏙️',
        description: 'Lignes épurées, mobilier contemporain',
    },
    {
        id: 'marocain',
        label: 'Marocain',
        icon: '🕌',
        description: 'Zellige, mosaïque, couleurs chaudes',
    },
    {
        id: 'minimaliste',
        label: 'Minimaliste',
        icon: '⬜',
        description: 'Blanc, simplicité, atmosphère zen',
    },
    {
        id: 'scandinave',
        label: 'Scandinave',
        icon: '🌲',
        description: 'Bois naturel, cosy, style nordique',
    },
]

export default function StudioPage() {
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedStyle, setSelectedStyle] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [renders, setRenders] = useState([])
    const fileRef = useRef()

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Format accepté : JPG, PNG, WEBP')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image trop lourde (max 10MB)')
            return
        }
        setImage(file)
        setImagePreview(URL.createObjectURL(file))
        setResult(null)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleImageUpload({ target: { files: [file] } })
    }

    const handleGenerate = async () => {
        if (!image) { toast.error('Uploadez une photo d\'abord'); return }
        if (!selectedStyle) { toast.error('Choisissez un style'); return }
        if (renders.length >= 4) { toast.error('Maximum 4 rendus atteint'); return }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('style', selectedStyle)

            const { data } = await axios.post('/api/studio/generate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000
            })

            const newRender = {
                id: Date.now(),
                imageUrl: data.imageUrl,
                style: STYLES.find(s => s.id === selectedStyle)?.label,
                originalImage: imagePreview
            }

            setResult(newRender)
            setRenders(prev => [...prev, newRender])
            toast.success('Rendu généré ! ✨')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erreur lors de la génération')
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setImage(null)
        setImagePreview(null)
        setResult(null)
        setSelectedStyle(null)
    }

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar activePage="/studio" />

            <main className="flex-1 ml-64 p-10">

                {/* Header */}
                <header className="mb-10">
                    <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary mb-3">
                        Studio IA ✨
                    </h2>
                    <p className="text-on-surface-variant">
                        Uploadez une photo d'une pièce vide et visualisez-la décorée avant de visiter.
                    </p>
                </header>

                <div className="grid grid-cols-12 gap-8">

                    {/* Colonne gauche */}
                    <div className="col-span-12 lg:col-span-5">

                        {/* Upload */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                                1. Uploadez votre photo
                            </h3>

                            {imagePreview ? (
                                <div className="relative rounded-2xl overflow-hidden">
                                    <img src={imagePreview} alt="Pièce" className="w-full h-64 object-cover" />
                                    <button onClick={handleReset}
                                        className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                                        <Icon name="close" className="text-[16px]" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={e => e.preventDefault()}
                                    onClick={() => fileRef.current.click()}
                                    className="border-2 border-dashed border-outline-variant/40 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                >
                                    <Icon name="add_photo_alternate" className="text-[48px] text-outline-variant mb-3" />
                                    <p className="text-sm font-medium text-on-surface">Glissez une photo ici</p>
                                    <p className="text-xs text-outline mt-1">ou cliquez pour parcourir</p>
                                    <p className="text-xs text-outline mt-3">JPG, PNG, WEBP — max 10MB</p>
                                </div>
                            )}

                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageUpload} className="hidden" />
                        </div>

                        {/* Style */}
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                                2. Choisissez un style
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {STYLES.map(style => (
                                    <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                                        className={`p-4 rounded-2xl text-left transition-all border-2 ${
                                            selectedStyle === style.id
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-outline-variant/20 hover:border-primary/30 bg-surface-container-lowest'
                                        }`}>
                                        <span className="text-2xl mb-2 block">{style.icon}</span>
                                        <p className="font-bold text-sm text-on-surface">{style.label}</p>
                                        <p className="text-xs text-on-surface-variant mt-0.5">{style.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bouton générer */}
                        <button onClick={handleGenerate}
                            disabled={!image || !selectedStyle || loading || renders.length >= 4}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Génération en cours... (30-60s)
                                </>
                            ) : (
                                <>
                                    <Icon name="auto_fix_high" className="text-[20px]" />
                                    Générer le rendu IA
                                    {renders.length > 0 && ` (${renders.length}/4)`}
                                </>
                            )}
                        </button>

                        {renders.length >= 4 && (
                            <p className="text-xs text-center text-outline mt-2">
                                Maximum atteint —
                                <button onClick={() => setRenders([])} className="text-primary ml-1 hover:underline">
                                    tout effacer
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Colonne droite — Résultat */}
                    <div className="col-span-12 lg:col-span-7">
                        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                            3. Résultat
                        </h3>

                        {loading ? (
                            <div className="bg-surface-container-lowest rounded-2xl h-96 flex flex-col items-center justify-center border border-outline-variant/15">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-on-surface-variant font-medium">L'IA décore votre pièce...</p>
                                <p className="text-xs text-outline mt-2">Environ 30-60 secondes</p>
                            </div>
                        ) : result ? (
                            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/15">
                                {/* Avant / Après */}
                                <div className="grid grid-cols-2">
                                    <div className="relative">
                                        <img src={result.originalImage} alt="Avant" className="w-full h-72 object-cover" />
                                        <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full">
                                            Avant
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <img src={result.imageUrl} alt="Après" className="w-full h-72 object-cover" />
                                        <span className="absolute bottom-3 right-3 px-3 py-1 bg-primary/90 text-white text-xs rounded-full">
                                            {result.style}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 flex gap-3">
                                    <a href={result.imageUrl} download target="_blank" rel="noopener noreferrer"
                                        className="flex-1 py-2.5 border border-outline-variant/30 text-on-surface rounded-xl text-sm font-medium hover:bg-surface-container-low transition-all flex items-center justify-center gap-2">
                                        <Icon name="download" className="text-[18px]" />
                                        Télécharger
                                    </a>
                                    <button onClick={handleGenerate} disabled={loading || renders.length >= 4}
                                        className="flex-1 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                        <Icon name="refresh" className="text-[18px]" />
                                        Régénérer
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-surface-container-lowest rounded-2xl h-96 flex flex-col items-center justify-center border border-dashed border-outline-variant/30">
                                <Icon name="auto_fix_high" className="text-[64px] text-outline-variant mb-3" />
                                <p className="text-on-surface-variant font-medium">Le rendu apparaîtra ici</p>
                                <p className="text-xs text-outline mt-2">Uploadez une photo et choisissez un style</p>
                            </div>
                        )}

                        {/* Historique des rendus */}
                        {renders.length > 1 && (
                            <div className="mt-6">
                                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                                    Comparaison des rendus ({renders.length}/4)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {renders.map(r => (
                                        <div key={r.id} onClick={() => setResult(r)}
                                            className={`rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                                                result?.id === r.id ? 'border-primary' : 'border-transparent hover:border-outline-variant/30'
                                            }`}>
                                            <img src={r.imageUrl} alt={r.style} className="w-full h-36 object-cover" />
                                            <div className="p-2 bg-surface-container-lowest">
                                                <p className="text-xs font-semibold text-on-surface">{r.style}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-10 flex justify-between items-center border-t border-outline-variant/15 mt-16 text-sm">
                    <span className="text-outline">© 2025 DarNa — Studio IA</span>
                </footer>
            </main>
        </div>
    )
}