import { useState } from "react";

const steps = [
  {
    icon: "🏠",
    title: "Bienvenue sur DARNA",
    subtitle: "Votre plateforme immobilière au Maroc",
    description:
      "Trouvez votre bien idéal au Maroc. Visualisez, décorez, contactez — sans quitter la plateforme.",
    color: "#4a7c6f",
  },
  {
    icon: "🔍",
    title: "Rechercher des biens",
    subtitle: "Trouvez le bien parfait",
    description:
      "Utilisez les filtres avancés pour chercher par ville, prix, surface ou type de bien. Sauvegardez vos recherches favorites.",
    color: "#4a7c6f",
  },
  {
    icon: "📋",
    title: "Gérer vos annonces",
    subtitle: "Publiez et suivez vos biens",
    description:
      "Créez des annonces avec photos et descriptions détaillées. Suivez les visites, les offres et les statuts en temps réel.",
    color: "#4a7c6f",
  },
  {
    icon: "📊",
    title: "Tableau de bord",
    subtitle: "Visualisez vos performances",
    description:
      "Accédez à vos statistiques : biens en portefeuille, transactions en cours, visites et activités récentes.",
    color: "#4a7c6f",
  },
  {
    icon: "💬",
    title: "Messagerie intégrée",
    subtitle: "Communiquez facilement",
    description:
      "Échangez avec clients et agents, planifiez des visites et recevez des notifications directement sur la plateforme.",
    color: "#4a7c6f",
  },
];

export default function Tutorial({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const next = () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
  };

  const prev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const finish = () => {
    setExiting(true);
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .tutorial-overlay {
          animation: fadeIn 0.3s ease;
        }
        .tutorial-card {
          animation: slideUp 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .tutorial-icon {
          animation: iconBounce 2s ease-in-out infinite;
        }
        .tutorial-btn-primary {
          background: #4a7c6f;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .tutorial-btn-primary:hover {
          background: #3a6359;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(74,124,111,0.4);
        }
        .tutorial-btn-secondary {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .tutorial-btn-secondary:hover {
          background: #e5e7eb;
          color: #374151;
        }
        .tutorial-skip {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 13px;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-family: inherit;
          transition: color 0.2s;
        }
        .tutorial-skip:hover { color: #6b7280; }
        .dot {
          height: 8px;
          border-radius: 4px;
          transition: all 0.3s;
          background: #d1d5db;
        }
        .dot.active {
          background: #4a7c6f;
        }
      `}</style>

      {/* Overlay */}
      <div
        className="tutorial-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          opacity: exiting ? 0 : 1,
          transition: "opacity 0.3s",
        }}
      >
        {/* Card */}
        <div
          className="tutorial-card"
          style={{
            background: "#fff",
            borderRadius: 20,
            width: "100%",
            maxWidth: 480,
            boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <div
            style={{
              background: "linear-gradient(135deg, #4a7c6f, #3a6359)",
              padding: "20px 24px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i === current ? "active" : ""}`}
                  style={{ width: i === current ? 24 : 8, background: i === current ? "#fff" : "rgba(255,255,255,0.35)" }}
                />
              ))}
            </div>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500 }}>
              {current + 1} / {steps.length}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: "36px 32px 28px", textAlign: "center" }}>
            {/* Icon */}
            <div
              className="tutorial-icon"
              style={{
                fontSize: 64,
                marginBottom: 20,
                display: "inline-block",
                background: "rgba(74,124,111,0.08)",
                borderRadius: "50%",
                width: 100,
                height: 100,
                lineHeight: "100px",
              }}
            >
              {step.icon}
            </div>

            {/* Subtitle */}
            <p style={{ color: "#4a7c6f", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              {step.subtitle}
            </p>

            {/* Title */}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 14, lineHeight: 1.3 }}>
              {step.title}
            </h2>

            {/* Description */}
            <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 32px" }}>
              {step.description}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              {/* Left : Back or Skip */}
              {current > 0 ? (
                <button className="tutorial-btn-secondary" onClick={prev}>
                  ← Retour
                </button>
              ) : (
                <button className="tutorial-skip" onClick={finish}>
                  Passer
                </button>
              )}

              {/* Right : Next or Finish */}
              {isLast ? (
                <button className="tutorial-btn-primary" onClick={finish}>
                  Commencer 🚀
                </button>
              ) : (
                <button className="tutorial-btn-primary" onClick={next}>
                  Suivant →
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#f3f4f6" }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #4a7c6f, #6aada0)",
                width: `${((current + 1) / steps.length) * 100}%`,
                transition: "width 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}