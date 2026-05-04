import { useState } from 'react'
import NouvelleAnnonce from '../components/NouvelleAnnonce'

// ─── Données de démonstration ─────────────────────────────────────────────────
const ANNONCES_DEMO = [
  {
    id: 1, type: "Appartement", transaction: "vente",
    titre: "Bel appartement 3 chambres vue mer",
    ville: "Agadir", quartier: "Founty",
    surface: 120, chambres: 3, salles_bain: 2,
    prix: 1800000, negociable: true,
    etat: "bon_etat", photos: [],
    description: "Magnifique appartement avec vue panoramique sur l'Atlantique.",
    date: "2026-04-20", statut: "actif",
  },
  {
    id: 2, type: "Villa", transaction: "location",
    titre: "Villa moderne avec piscine",
    ville: "Marrakech", quartier: "Palmeraie",
    surface: 350, chambres: 5, salles_bain: 4,
    prix: 25000, negociable: false,
    etat: "neuf", photos: [],
    description: "Villa de standing dans la Palmeraie avec piscine privée.",
    date: "2026-04-18", statut: "actif",
  },
  {
    id: 3, type: "Appartement", transaction: "vente",
    titre: "Studio meublé centre-ville",
    ville: "Casablanca", quartier: "Maarif",
    surface: 45, chambres: 1, salles_bain: 1,
    prix: 650000, negociable: true,
    etat: "bon_etat", photos: [],
    description: "Studio entièrement meublé, idéal pour investissement locatif.",
    date: "2026-04-15", statut: "en_attente",
  },
]

const FILTRES_TYPE = ["Tous", "Appartement", "Villa", "Maison", "Riad", "Bureau", "Terrain"]
const FILTRES_TRANSACTION = ["Tous", "vente", "location"]

// ─── Card Annonce ─────────────────────────────────────────────────────────────
function AnnonceCard({ annonce, index }) {
  const isVente = annonce.transaction === "vente"
  const statutColor = annonce.statut === "actif" ? "#4a7c6f" : annonce.statut === "en_attente" ? "#d97706" : "#6b7280"
  const statutLabel = annonce.statut === "actif" ? "Active" : annonce.statut === "en_attente" ? "En attente" : "Inactive"

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.25s",
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${index * 0.07}s`,
        cursor: "pointer",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(74,124,111,0.15)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Image placeholder */}
      <div style={{
        height: 180,
        background: "linear-gradient(135deg, #e8f4f1 0%, #d1ebe5 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ fontSize: 48, opacity: 0.4 }}>
          {annonce.type === "Villa" ? "🏡" : annonce.type === "Riad" ? "🕌" : annonce.type === "Terrain" ? "🌿" : "🏢"}
        </span>
        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <span style={{
            background: isVente ? "#1e40af" : "#7c3aed",
            color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 20,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {isVente ? "VENTE" : "LOCATION"}
          </span>
          <span style={{
            background: statutColor, color: "#fff",
            fontSize: 11, fontWeight: 700,
            padding: "3px 10px", borderRadius: 20,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {statutLabel}
          </span>
        </div>
        {annonce.negociable && (
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <span style={{
              background: "rgba(0,0,0,0.5)", color: "#fff",
              fontSize: 10, fontWeight: 600,
              padding: "3px 8px", borderRadius: 20,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Négociable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {annonce.type} · {annonce.ville}, {annonce.quartier}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>
          {annonce.titre}
        </h3>

        {/* Specs */}
        <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
          {[
            { icon: "📐", val: `${annonce.surface} m²` },
            { icon: "🛏", val: `${annonce.chambres} ch.` },
            { icon: "🚿", val: `${annonce.salles_bain} sdb` },
          ].map(s => (
            <div key={s.val} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
              <span>{s.icon}</span> {s.val}
            </div>
          ))}
        </div>

        {/* Price + actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#4a7c6f", fontFamily: "'DM Sans', sans-serif" }}>
              {Number(annonce.prix).toLocaleString()} MAD
            </div>
            {isVente && annonce.surface && (
              <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                {Math.round(annonce.prix / annonce.surface).toLocaleString()} MAD/m²
              </div>
            )}
            {!isVente && <div style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>/ mois</div>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={iconBtn} title="Modifier">✏️</button>
            <button style={iconBtn} title="Supprimer">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnnoncesPage() {
  const [showForm, setShowForm] = useState(false)
  const [annonces, setAnnonces] = useState(ANNONCES_DEMO)
  const [filtreType, setFiltreType] = useState("Tous")
  const [filtreTransaction, setFiltreTransaction] = useState("Tous")
  const [search, setSearch] = useState("")
  const [vue, setVue] = useState("grille") // grille | liste

  const handleSubmit = (data) => {
    const nouvelle = {
      ...data,
      id: annonces.length + 1,
      date: new Date().toISOString().split("T")[0],
      statut: "en_attente",
    }
    setAnnonces(a => [nouvelle, ...a])
    setShowForm(false)
  }

  // Filtrage
  const filtered = annonces.filter(a => {
    const matchType = filtreType === "Tous" || a.type === filtreType
    const matchTrans = filtreTransaction === "Tous" || a.transaction === filtreTransaction
    const matchSearch = !search || a.titre?.toLowerCase().includes(search.toLowerCase()) || a.ville?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchTrans && matchSearch
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fa; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #4a7c6f; border-radius: 3px; }
        .filter-btn { transition: all 0.2s; cursor: pointer; border: none; font-family: "'DM Sans', sans-serif"; }
        .filter-btn:hover { background: rgba(74,124,111,0.12) !important; color: #4a7c6f !important; }
        .search-input:focus { outline: none; border-color: #4a7c6f !important; }
        .add-btn:hover { background: #3a6359 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,124,111,0.35) !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── Header ── */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "24px 32px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", fontFamily: "'Playfair Display', serif" }}>
                Mes Annonces
              </h1>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                {annonces.length} bien{annonces.length > 1 ? "s" : ""} publié{annonces.length > 1 ? "s" : ""}
              </p>
            </div>
            <button
              className="add-btn"
              onClick={() => setShowForm(true)}
              style={{
                background: "#4a7c6f", color: "#fff",
                border: "none", padding: "12px 24px",
                borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
                boxShadow: "0 4px 14px rgba(74,124,111,0.25)",
              }}
            >
              <span style={{ fontSize: 18 }}>+</span> Déposer une annonce
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Total", value: annonces.length, icon: "🏠", color: "#4a7c6f" },
              { label: "Actives", value: annonces.filter(a => a.statut === "actif").length, icon: "✅", color: "#059669" },
              { label: "En attente", value: annonces.filter(a => a.statut === "en_attente").length, icon: "⏳", color: "#d97706" },
              { label: "Ventes", value: annonces.filter(a => a.transaction === "vente").length, icon: "💰", color: "#1e40af" },
              { label: "Locations", value: annonces.filter(a => a.transaction === "location").length, icon: "🔑", color: "#7c3aed" },
            ].map((s, i) => (
              <div key={s.label} style={{
                background: "#fff", borderRadius: 12, padding: "16px",
                border: "1px solid #f0f0f0",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${i * 0.06}s`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Filtres ── */}
          <div style={{
            background: "#fff", borderRadius: 14, padding: "16px 20px",
            border: "1px solid #f0f0f0", marginBottom: 24,
            display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une annonce..."
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  borderRadius: 10, border: "1.5px solid #e5e7eb",
                  fontSize: 13, color: "#111827",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border 0.2s",
                }}
              />
            </div>

            {/* Type */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTRES_TYPE.map(f => (
                <button
                  key={f}
                  className="filter-btn"
                  onClick={() => setFiltreType(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    background: filtreType === f ? "rgba(74,124,111,0.12)" : "#f9fafb",
                    color: filtreType === f ? "#4a7c6f" : "#6b7280",
                    border: `1.5px solid ${filtreType === f ? "#4a7c6f" : "#e5e7eb"}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Transaction */}
            <div style={{ display: "flex", gap: 6 }}>
              {FILTRES_TRANSACTION.map(f => (
                <button
                  key={f}
                  className="filter-btn"
                  onClick={() => setFiltreTransaction(f)}
                  style={{
                    padding: "6px 14px", borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                    background: filtreTransaction === f ? "rgba(30,64,175,0.1)" : "#f9fafb",
                    color: filtreTransaction === f ? "#1e40af" : "#6b7280",
                    border: `1.5px solid ${filtreTransaction === f ? "#1e40af" : "#e5e7eb"}`,
                  }}
                >
                  {f === "Tous" ? "Tous" : f === "vente" ? "Vente" : "Location"}
                </button>
              ))}
            </div>

            {/* Vue toggle */}
            <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
              {[["grille", "⊞"], ["liste", "☰"]].map(([v, icon]) => (
                <button
                  key={v}
                  onClick={() => setVue(v)}
                  style={{
                    padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                    background: vue === v ? "#4a7c6f" : "#fff",
                    color: vue === v ? "#fff" : "#6b7280",
                    cursor: "pointer", fontSize: 16, transition: "all 0.2s",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grille ── */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Aucune annonce trouvée</h3>
              <p style={{ color: "#9ca3af", marginBottom: 24 }}>Déposez votre première annonce dès maintenant.</p>
              <button
                onClick={() => setShowForm(true)}
                style={{ background: "#4a7c6f", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                + Déposer une annonce
              </button>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: vue === "grille" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr",
              gap: 20,
            }}>
              {filtered.map((a, i) => (
                <AnnonceCard key={a.id} annonce={a} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal formulaire ── */}
      {showForm && (
        <NouvelleAnnonce
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const iconBtn = {
  background: "#f9fafb", border: "1px solid #e5e7eb",
  borderRadius: 8, padding: "6px 10px",
  cursor: "pointer", fontSize: 14,
  transition: "all 0.2s",
}