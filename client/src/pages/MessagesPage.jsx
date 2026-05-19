import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
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

export default function MessagesPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [conversations, setConversations] = useState([])
    const [selected, setSelected] = useState(null)
    const [thread, setThread] = useState([])
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)

    const fmt = (d) => new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    })

    // Charger toutes les conversations de l'acheteur
    // Une conversation = tous les messages liés à une property_id
    const loadConversations = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    id, content, read, created_at, property_id,
                    sender_id, receiver_id,
                    properties(id, title, images, city)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Grouper par property_id pour avoir des conversations
            const convMap = {}
            ;(data || []).forEach(msg => {
                const pid = msg.property_id
                if (!convMap[pid]) {
                    convMap[pid] = {
                        property_id: pid,
                        property: msg.properties,
                        lastMessage: msg,
                        unread: 0,
                        messages: [],
                    }
                }
                convMap[pid].messages.push(msg)
                // Compter les non-lus reçus par l'acheteur
                if (!msg.read && msg.receiver_id === user.id) {
                    convMap[pid].unread++
                }
            })

            // Trier par date du dernier message
            const convList = Object.values(convMap).sort(
                (a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
            )
            setConversations(convList)
        } catch (err) {
            console.error(err)
            toast.error('Erreur chargement des messages')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) loadConversations()
    }, [user])

    // Ouvrir une conversation — charger le fil complet
    const openConversation = async (conv) => {
        setSelected(conv)
        setReply('')

        // Trier les messages chronologiquement
        const sorted = [...conv.messages].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        )
        setThread(sorted)

        // Marquer les messages reçus comme lus
        const unreadIds = conv.messages
            .filter(m => !m.read && m.receiver_id === user.id)
            .map(m => m.id)

        if (unreadIds.length > 0) {
            await supabase.from('messages').update({ read: true }).in('id', unreadIds)
            setConversations(prev => prev.map(c =>
                c.property_id === conv.property_id ? { ...c, unread: 0 } : c
            ))
        }
    }

    // Envoyer une réponse à la conversation sélectionnée
    const handleReply = async () => {
        if (!reply.trim() || !selected) return
        setSending(true)
        try {
            // Trouver le receiver : l'autre personne dans la conversation
            const otherPerson = thread.find(m => m.sender_id !== user.id)?.sender_id
                || thread.find(m => m.receiver_id !== user.id)?.receiver_id

            if (!otherPerson) {
                toast.error('Impossible de trouver le destinataire')
                return
            }

            const { data: newMsg, error } = await supabase.from('messages').insert({
                property_id: selected.property_id,
                sender_id: user.id,
                receiver_id: otherPerson,
                content: reply.trim(),
            }).select(`
                id, content, read, created_at, property_id,
                sender_id, receiver_id,
                properties(id, title, images, city)
            `).single()

            if (error) throw error

            setThread(prev => [...prev, newMsg])
            setReply('')
            toast.success('Message envoyé !')

            // Rafraîchir les conversations
            loadConversations()
        } catch (err) {
            toast.error(err.message || 'Erreur envoi')
        } finally {
            setSending(false)
        }
    }

    const totalUnread = conversations.reduce((s, c) => s + c.unread, 0)

    return (
        <div className="bg-background text-on-surface flex min-h-screen font-body">
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            <Sidebar activePage="/messages" />

            <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="px-8 py-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-headline font-extrabold text-primary flex items-center gap-3">
                            Messages
                            {totalUnread > 0 && (
                                <span className="px-2.5 py-0.5 bg-primary text-white text-xs rounded-full font-semibold">
                                    {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">

                    {/* ── Liste conversations ── */}
                    <div className="w-80 flex-shrink-0 border-r border-outline-variant/20 overflow-y-auto bg-surface">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <Icon name="chat_bubble_outline" className="text-[56px] text-outline-variant mb-3" />
                                <p className="text-sm font-medium text-on-surface-variant mb-1">Aucun message</p>
                                <p className="text-xs text-outline mb-4">Consultez une annonce et contactez un vendeur.</p>
                                <Link to="/annonces"
                                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-full text-xs font-medium hover:opacity-90">
                                    <Icon name="search" className="text-[14px]" />
                                    Explorer les annonces
                                </Link>
                            </div>
                        ) : (
                            <div className="p-3 flex flex-col gap-1">
                                {conversations.map(conv => (
                                    <button
                                        key={conv.property_id}
                                        onClick={() => openConversation(conv)}
                                        className={`w-full text-left p-4 rounded-xl transition-all border-2 ${
                                            selected?.property_id === conv.property_id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent hover:bg-surface-container-low'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Image annonce */}
                                            {conv.property?.images?.[0] ? (
                                                <img src={conv.property.images[0]} alt=""
                                                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                                                    <Icon name="home" className="text-outline-variant text-[22px]" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className={`text-sm font-semibold truncate ${conv.unread > 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                                        {conv.property?.title || 'Annonce'}
                                                    </p>
                                                    {conv.unread > 0 && (
                                                        <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0 ml-1 font-bold">
                                                            {conv.unread}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-outline flex items-center gap-0.5 mb-1">
                                                    <Icon name="location_on" className="text-[11px]" />
                                                    {conv.property?.city}
                                                </p>
                                                <p className={`text-xs truncate ${conv.unread > 0 ? 'font-medium text-on-surface' : 'text-outline'}`}>
                                                    {conv.lastMessage.sender_id === user.id ? '✓ Vous : ' : ''}
                                                    {conv.lastMessage.content}
                                                </p>
                                                <p className="text-[10px] text-outline mt-1">
                                                    {fmt(conv.lastMessage.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Fil de conversation ── */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {selected ? (
                            <>
                                {/* Header conversation */}
                                <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center gap-4 bg-surface flex-shrink-0">
                                    {selected.property?.images?.[0] ? (
                                        <img src={selected.property.images[0]} alt=""
                                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                                            <Icon name="home" className="text-outline-variant text-[22px]" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-on-surface">{selected.property?.title}</p>
                                        <p className="text-xs text-on-surface-variant">{selected.property?.city}</p>
                                    </div>
                                    <Link
                                        to={`/annonce/${selected.property_id}`}
                                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
                                    >
                                        <Icon name="open_in_new" className="text-[13px]" />
                                        Voir l'annonce
                                    </Link>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                                    {thread.map(msg => {
                                        const isMine = msg.sender_id === user.id
                                        return (
                                            <div key={msg.id} className={`flex items-end gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                    isMine ? 'bg-primary text-white' : 'bg-primary-container text-primary'
                                                }`}>
                                                    {isMine ? 'Moi' : 'V'}
                                                </div>

                                                {/* Bulle */}
                                                <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                                        isMine
                                                            ? 'bg-primary text-white rounded-br-sm'
                                                            : 'bg-surface-container text-on-surface rounded-bl-sm'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    <p className="text-[10px] text-outline px-1">{fmt(msg.created_at)}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Zone réponse */}
                                <div className="px-6 py-4 border-t border-outline-variant/15 bg-surface flex-shrink-0">
                                    <div className="flex gap-3 items-end">
                                        <textarea
                                            value={reply}
                                            onChange={e => setReply(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply() } }}
                                            placeholder="Écrivez votre message... (Entrée pour envoyer)"
                                            rows={2}
                                            className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant/20 rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-outline/40 resize-none"
                                        />
                                        <button
                                            onClick={handleReply}
                                            disabled={sending || !reply.trim()}
                                            className="p-3 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex-shrink-0"
                                        >
                                            {sending
                                                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                : <Icon name="send" className="text-[20px]" />
                                            }
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-outline mt-2 flex items-center gap-1">
                                        <Icon name="lock" className="text-[11px]" />
                                        Vos coordonnées restent confidentielles
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Icon name="forum" className="text-[72px] text-outline-variant mb-4" />
                                    <p className="font-headline font-bold text-xl text-on-surface mb-2">Vos conversations</p>
                                    <p className="text-sm text-on-surface-variant">
                                        Sélectionnez une conversation pour voir les messages
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}