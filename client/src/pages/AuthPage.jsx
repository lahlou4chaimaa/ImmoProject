import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

import logoDarna from '../assets/Gemini_Generated_Image_8g8myt8g8myt8g8m-removebg-preview.png';

export default function AuthPage() {
    const [mode, setMode] = useState('signin') // 'signin' | 'signup'
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signIn, signUp, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors }, reset } = useForm()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            if (mode === 'signin') {
                await signIn(data.email, data.password)
                toast.success('Bienvenue !')
                navigate('/dashboard')
            } else {
                await signUp(data.email, data.password, data.fullName)
                toast.success('Compte créé ! Vérifie ton email pour confirmer.')
                setMode('signin')
                reset()
            }
        } catch (err) {
            toast.error(err.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        try {
            await signInWithGoogle()
        } catch (err) {
            toast.error('Connexion Google échouée')
        }
    }

    return (

        <main className="flex h-screen w-full font-body overflow-hidden bg-surface text-on-surface">


            {/* ── LEFT : Visual Anchor ─────────────────── */}
            <section className="hidden md:flex md:w-3/5 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80"
                        alt="Intérieur architectural moderne"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full bg-gradient-to-t from-black/50 to-transparent">
                    {/* Logo en haut à droite */}
                    <div className="flex justify-end">

                    </div>


                    {/* Texte en bas */}
                    <div className="max-w-md">
                        <h1 className="text-white text-5xl font-headline font-extrabold tracking-tight leading-tight mb-6">
                            L'art de vivre,<br />parfaitement orchestré.
                        </h1>
                        <p className="text-white/80 text-lg font-light leading-relaxed">
                            Trouvez votre bien idéal au Maroc. Visualisez, décorez, contactez — sans quitter la plateforme.
                        </p>
                    </div>

                </div>
            </section>

            {/* ── RIGHT : Auth Form ────────────────────── */}
            <section className="w-full md:w-2/5 flex flex-col justify-center items-center p-8 md:p-16 bg-surface">
                <div className="w-full max-w-[400px]">


                    {/* Mobile logo */}
                    <div className="md:hidden mb-12 flex justify-center">
                        <img
                            src={logoDarna}
                            alt="Darna Logo"
                            className="h-20 w-auto object-contain -ml-20"
                        />
                    </div>
                    {/* Logo en haut à droite */}
                    <div className="flex justify-end">
                        <img
                            src={logoDarna}
                            alt="Darna Logo"
                            className="h-20 w-auto object-contain"
                        />
                    </div>
                    {/* Header */}
                    <div className="mb-10">
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface mb-2">
                            {mode === 'signin' ? 'Bienvenue' : 'Créer un compte'}
                        </h2>
                        <p className="text-on-surface-variant">
                            {mode === 'signin'
                                ? 'Entrez vos identifiants pour accéder à votre espace.'
                                : 'Rejoignez la plateforme immobilière marocaine.'}
                        </p>
                    </div>


                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Nom complet — signup only */}
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm text-on-surface-variant mb-2 ml-1" htmlFor="fullName">
                                    Nom complet
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Amine Benali"
                                    className="w-full bg-surface-container-highest/50 border-0 focus:ring-1 focus:ring-primary rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/50 outline-none transition-all"
                                    {...register('fullName', { required: mode === 'signup' ? 'Nom requis' : false })}
                                />
                                {errors.fullName && (
                                    <p className="text-error text-xs mt-1 ml-1">{errors.fullName.message}</p>
                                )}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-on-surface-variant mb-2 ml-1" htmlFor="email">
                                Adresse Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="nom@exemple.com"
                                className="w-full bg-surface-container-highest/50 border-0 focus:ring-1 focus:ring-primary rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/50 outline-none transition-all"
                                {...register('email', {
                                    required: 'Email requis',
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email invalide' }
                                })}
                            />
                            {errors.email && (
                                <p className="text-error text-xs mt-1 ml-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>

                            <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="text-sm text-on-surface-variant" htmlFor="password">
                                    Mot de passe
                                </label>
                                {mode === 'signin' && (
                                    <button type="button" className="text-sm text-primary hover:underline">
                                        Oublié ?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container-highest/50 border-0 focus:ring-1 focus:ring-primary rounded-xl px-4 py-4 pr-12 text-on-surface placeholder:text-outline/50 outline-none transition-all"
                                    {...register('password', {
                                        required: 'Mot de passe requis',
                                        minLength: { value: 8, message: 'Minimum 8 caractères' }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors"
                                >
                                    {showPassword
                                        ? <EyeOff size={20} />
                                        : <Eye size={20} />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-error text-xs mt-1 ml-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-medium tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-60"
                            style={{ background: loading ? '#87a598' : 'linear-gradient(135deg, #486459 0%, #87a598 100%)' }}
                        >
                            {loading
                                ? 'Chargement...'
                                : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-1">
                            <div className="h-px flex-1 bg-outline-variant/30" />
                            <span className="text-sm text-outline-variant font-medium">OU</span>
                            <div className="h-px flex-1 bg-outline-variant/30" />
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogle}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-outline-variant/20 py-4 rounded-xl hover:bg-surface-container-low transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-on-surface font-medium">Continuer avec Google</span>
                        </button>
                    </form>

                    {/* Toggle mode */}
                    <p className="mt-10 text-center text-on-surface-variant text-sm">
                        {mode === 'signin' ? "Vous n'avez pas encore de compte ? " : 'Déjà un compte ? '}
                        <button
                            type="button"
                            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); reset() }}
                            className="text-primary font-semibold hover:underline"
                        >
                            {mode === 'signin' ? 'Créer un compte' : 'Se connecter'}
                        </button>
                    </p>
                </div>
            </section>
        </main>
    )
}