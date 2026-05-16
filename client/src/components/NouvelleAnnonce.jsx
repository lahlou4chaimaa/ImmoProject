import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Type de bien", icon: "🏠" },
  { id: 2, label: "Localisation", icon: "📍" },
  { id: 3, label: "Détails", icon: "📐" },
  { id: 4, label: "Prix", icon: "💰" },
  { id: 5, label: "Photos", icon: "📸" },
  { id: 6, label: "Description", icon: "✍️" },
];

const TYPES = [
  { value: "appartement", label: "Appartement", icon: "🏢" },
  { value: "villa", label: "Villa", icon: "🏡" },
  { value: "maison", label: "Maison", icon: "🏠" },
  { value: "riad", label: "Riad", icon: "🕌" },
  { value: "bureau", label: "Bureau", icon: "🏗️" },
  { value: "terrain", label: "Terrain", icon: "🌿" },
];

const TRANSACTIONS = [
  { value: "vente", label: "À Vendre" },
  { value: "location", label: "À Louer" },
];

const VILLES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger",
  "Agadir", "Meknès", "Oujda", "Kenitra", "Tétouan",
  "Beni Mellal", "El Jadida", "Nador", "Settat",
];

const EQUIPEMENTS = [
  "Piscine", "Garage", "Jardin", "Terrasse", "Ascenseur",
  "Gardien", "Climatisation", "Chauffage central", "Cuisine équipée",
  "Balcon", "Cave", "Parking", "Sécurité 24h/24",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

const Input = ({ label, type = "text", value, onChange, placeholder, min, max, required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
      {label} {required && <span style={{ color: "#4a7c6f" }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: "1.5px solid #e5e7eb",
        fontSize: 14,
        color: "#111827",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        transition: "border 0.2s",
        background: "#fafafa",
        boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = "#4a7c6f"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
    />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
      {label} {required && <span style={{ color: "#4a7c6f" }}>*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: "1.5px solid #e5e7eb",
        fontSize: 14,
        color: value ? "#111827" : "#9ca3af",
        fontFamily: "'DM Sans', sans-serif",
        outline: "none",
        background: "#fafafa",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      <option value="">-- Sélectionner --</option>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  </div>
);

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ data, set }) {
  return (
    <div>
      <h3 style={sh}>Quel est le type de votre bien ?</h3>
      <p style={sp}>Sélectionnez le type et la nature de la transaction.</p>

      {/* Transaction */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {TRANSACTIONS.map(t => (
          <button
            key={t.value}
            onClick={() => set("transaction", t.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: `2px solid ${data.transaction === t.value ? "#4a7c6f" : "#e5e7eb"}`,
              background: data.transaction === t.value ? "rgba(74,124,111,0.08)" : "#fff",
              color: data.transaction === t.value ? "#4a7c6f" : "#6b7280",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Types */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => set("type", t.value)}
            style={{
              padding: "16px 8px",
              borderRadius: 12,
              border: `2px solid ${data.type === t.value ? "#4a7c6f" : "#e5e7eb"}`,
              background: data.type === t.value ? "rgba(74,124,111,0.08)" : "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: data.type === t.value ? "#4a7c6f" : "#374151", fontFamily: "'DM Sans', sans-serif" }}>
              {t.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2({ data, set }) {
  return (
    <div>
      <h3 style={sh}>Où se situe votre bien ?</h3>
      <p style={sp}>Indiquez la localisation précise pour attirer les bons acheteurs.</p>
      <Select label="Ville" value={data.ville} onChange={v => set("ville", v)} options={VILLES} required />
      <Input label="Quartier / Secteur" value={data.quartier} onChange={v => set("quartier", v)} placeholder="Ex: Maarif, Guéliz, Agdal..." required />
      <Input label="Adresse (optionnelle)" value={data.adresse} onChange={v => set("adresse", v)} placeholder="Ex: Rue des Orangers, N°12" />
    </div>
  );
}

function Step3({ data, set }) {
  return (
    <div>
      <h3 style={sh}>Les caractéristiques du bien</h3>
      <p style={sp}>Plus vous êtes précis, plus votre annonce sera visible.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ paddingRight: 8 }}>
          <Input label="Surface (m²)" type="number" value={data.surface} onChange={v => set("surface", v)} placeholder="Ex: 120" min="1" required />
        </div>
        <div style={{ paddingLeft: 8 }}>
          <Input label="Étage" type="number" value={data.etage} onChange={v => set("etage", v)} placeholder="Ex: 3" min="0" />
        </div>
        <div style={{ paddingRight: 8 }}>
          <Input label="Chambres" type="number" value={data.chambres} onChange={v => set("chambres", v)} placeholder="Ex: 3" min="0" />
        </div>
        <div style={{ paddingLeft: 8 }}>
          <Input label="Salles de bain" type="number" value={data.salles_bain} onChange={v => set("salles_bain", v)} placeholder="Ex: 2" min="0" />
        </div>
        <div style={{ paddingRight: 8 }}>
          <Input label="Salons" type="number" value={data.salons} onChange={v => set("salons", v)} placeholder="Ex: 1" min="0" />
        </div>
        <div style={{ paddingLeft: 8 }}>
          <Select label="État du bien" value={data.etat} onChange={v => set("etat", v)} options={[
            { value: "neuf", label: "Neuf" },
            { value: "bon_etat", label: "Bon état" },
            { value: "a_renover", label: "À rénover" },
          ]} />
        </div>
        <div style={{ paddingRight: 8 }}>
          <Select label="Style de design 🎨" value={data.designStyle || ""} onChange={v => set("designStyle", v)} options={[
            { value: "", label: "Aucun style spécifique" },
            { value: "moderne", label: "Moderne & Épuré" },
            { value: "marocain", label: "Marocain Authentique" },
            { value: "minimaliste", label: "Minimaliste Zen" },
            { value: "scandinave", label: "Scandinave & Cosy" },
          ]} />
        </div>
      </div>

      {/* Équipements */}
      <div style={{ marginTop: 8 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
          Équipements & Commodités
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {EQUIPEMENTS.map(eq => {
            const active = (data.equipements || []).includes(eq);
            return (
              <button
                key={eq}
                onClick={() => {
                  const list = data.equipements || [];
                  set("equipements", active ? list.filter(e => e !== eq) : [...list, eq]);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${active ? "#4a7c6f" : "#e5e7eb"}`,
                  background: active ? "rgba(74,124,111,0.1)" : "#fff",
                  color: active ? "#4a7c6f" : "#6b7280",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {active ? "✓ " : ""}{eq}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4({ data, set }) {
  const isLocation = data.transaction === "location";
  return (
    <div>
      <h3 style={sh}>Quel est votre prix ?</h3>
      <p style={sp}>Fixez un prix compétitif pour maximiser vos chances.</p>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Prix {isLocation ? "(MAD / mois)" : "(MAD)"} <span style={{ color: "#4a7c6f" }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            value={data.prix}
            onChange={e => set("prix", e.target.value)}
            placeholder={isLocation ? "Ex: 5000" : "Ex: 1500000"}
            min="0"
            style={{
              width: "100%",
              padding: "14px 60px 14px 16px",
              borderRadius: 10,
              border: "1.5px solid #e5e7eb",
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              background: "#fafafa",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#4a7c6f"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
          <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontWeight: 600, fontSize: 14 }}>
            MAD
          </span>
        </div>
        {data.prix && data.surface && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(74,124,111,0.08)", borderRadius: 8, fontSize: 13, color: "#4a7c6f", fontWeight: 600 }}>
            💡 Prix au m² : {Math.round(data.prix / data.surface).toLocaleString()} MAD/m²
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <input
          type="checkbox"
          id="negociable"
          checked={data.negociable || false}
          onChange={e => set("negociable", e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "#4a7c6f", cursor: "pointer" }}
        />
        <label htmlFor="negociable" style={{ fontSize: 14, color: "#374151", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
          Prix négociable
        </label>
      </div>

      <Input
        label="Charges mensuelles (optionnel)"
        type="number"
        value={data.charges}
        onChange={v => set("charges", v)}
        placeholder="Ex: 500 MAD"
      />
    </div>
  );
}

function Step5({ data, set }) {
  const photos = data.photos || [];

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    set("photos", [...photos, ...previews].slice(0, 10));
  };

  const remove = (i) => {
    set("photos", photos.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <h3 style={sh}>Ajoutez des photos</h3>
      <p style={sp}>Les annonces avec photos reçoivent 5x plus de visites. (Max 10 photos)</p>

      {/* Upload zone */}
      <label
        htmlFor="photo-upload"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #d1d5db",
          borderRadius: 14,
          padding: "32px 20px",
          cursor: "pointer",
          background: "#fafafa",
          marginBottom: 16,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#4a7c6f"; e.currentTarget.style.background = "rgba(74,124,111,0.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.background = "#fafafa"; }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          Cliquez pour ajouter des photos
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
          JPG, PNG, WEBP — Max 10 photos
        </div>
        <input id="photo-upload" type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
      </label>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "#f3f4f6" }}>
              <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <div style={{ position: "absolute", top: 6, left: 6, background: "#4a7c6f", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                  Photo principale
                </div>
              )}
              <button
                onClick={() => remove(i)}
                style={{
                  position: "absolute", top: 6, right: 6,
                  background: "rgba(0,0,0,0.6)", color: "#fff",
                  border: "none", borderRadius: "50%",
                  width: 24, height: 24, cursor: "pointer",
                  fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step6({ data, set }) {
  const len = (data.description || "").length;
  return (
    <div>
      <h3 style={sh}>Décrivez votre bien</h3>
      <p style={sp}>Une bonne description rassure et convainc les acheteurs potentiels.</p>

      <Input label="Titre de l'annonce" value={data.titre} onChange={v => set("titre", v)} placeholder="Ex: Bel appartement 3 chambres vue mer à Agadir" required />

      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Description détaillée <span style={{ color: "#4a7c6f" }}>*</span>
        </label>
        <textarea
          value={data.description || ""}
          onChange={e => set("description", e.target.value)}
          placeholder="Décrivez votre bien : environnement, points forts, accès, proximité des commodités..."
          rows={6}
          maxLength={1000}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            color: "#111827",
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            resize: "vertical",
            background: "#fafafa",
            boxSizing: "border-box",
            lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = "#4a7c6f"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <div style={{ textAlign: "right", fontSize: 12, color: len > 800 ? "#4a7c6f" : "#9ca3af", marginTop: 4 }}>
          {len} / 1000
        </div>
      </div>

      <Input label="Téléphone de contact" type="tel" value={data.telephone} onChange={v => set("telephone", v)} placeholder="Ex: 0612345678" required />

      {/* Récap */}
      <div style={{ marginTop: 16, padding: "16px", background: "rgba(74,124,111,0.06)", borderRadius: 12, border: "1px solid rgba(74,124,111,0.2)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4a7c6f", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
          📋 Récapitulatif de votre annonce
        </div>
        {[
          ["Type", `${data.type || "—"} · ${data.transaction || "—"}`],
          ["Localisation", `${data.ville || "—"}${data.quartier ? `, ${data.quartier}` : ""}`],
          ["Surface", data.surface ? `${data.surface} m²` : "—"],
          ["Prix", data.prix ? `${Number(data.prix).toLocaleString()} MAD${data.negociable ? " (négociable)" : ""}` : "—"],
          ["Photos", `${(data.photos || []).length} photo(s)`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
            <span style={{ color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>{k}</span>
            <span style={{ fontWeight: 600, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const sh = { fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" };
const sp = { fontSize: 14, color: "#6b7280", marginBottom: 24, fontFamily: "'DM Sans', sans-serif" };

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NouvelleAnnonce({ onClose, onSubmit }) {
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState({
    transaction: "vente", type: "", ville: "", quartier: "", adresse: "",
    surface: "", etage: "", chambres: "", salles_bain: "", salons: "",
    etat: "", equipements: [], prix: "", negociable: false, charges: "",
    photos: [], titre: "", description: "", telephone: "",
  });

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));
  const StepComp = STEP_COMPONENTS[current];
  const isLast = current === STEPS.length - 1;
  const progress = ((current + 1) / STEPS.length) * 100;

  const handleSubmit = () => {
    if (onSubmit) onSubmit(data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...cardStyle, textAlign: "center", padding: "60px 40px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
            Annonce publiée !
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>
            Votre annonce est en cours de validation. Vous serez notifié dès qu'elle sera visible.
          </p>
          <button onClick={onClose} style={btnPrimary}>
            Retour aux annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={overlayStyle}>
        <div style={cardStyle}>

          {/* Header */}
          <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
                  Déposer une annonce
                </h2>
                <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                  Étape {current + 1} sur {STEPS.length} · {STEPS[current].label}
                </p>
              </div>
              {onClose && (
                <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
              )}
            </div>

            {/* Step pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: i === current ? "rgba(74,124,111,0.12)" : i < current ? "rgba(74,124,111,0.06)" : "#f9fafb",
                    border: `1px solid ${i === current ? "#4a7c6f" : i < current ? "rgba(74,124,111,0.3)" : "#e5e7eb"}`,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>{i < current ? "✓" : s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: i <= current ? "#4a7c6f" : "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: "#f3f4f6", borderRadius: 2, marginBottom: -1 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #4a7c6f, #6aada0)", borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(90vh - 220px)" }}>
            <StepComp data={data} set={set} />
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", gap: 12, background: "#fff" }}>
            {current > 0 ? (
              <button onClick={() => setCurrent(c => c - 1)} style={btnSecondary}>
                ← Retour
              </button>
            ) : (
              <div />
            )}
            {isLast ? (
              <button onClick={handleSubmit} style={btnPrimary}>
                Publier l'annonce 🚀
              </button>
            ) : (
              <button onClick={() => setCurrent(c => c + 1)} style={btnPrimary}>
                Continuer →
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(4px)",
  zIndex: 9999,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 16,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 20,
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const btnPrimary = {
  background: "#4a7c6f",
  color: "#fff",
  border: "none",
  padding: "12px 28px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "all 0.2s",
};

const btnSecondary = {
  background: "#f3f4f6",
  color: "#6b7280",
  border: "none",
  padding: "12px 20px",
  borderRadius: 10,
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};