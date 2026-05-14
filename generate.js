const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageBreak, PageNumber, NumberFormat, TableOfContents
} = require('docx');
const fs = require('fs');

const C = {
  navy:"1B2A4A", blue:"2563EB", green:"486459", teal:"0D9488",
  orange:"EA580C", white:"FFFFFF", light:"EFF6FF", lightG:"F0FDF4",
  grey:"F8FAFC", dark:"1E293B", mid:"64748B", amber:"FEF3C7",
  amberD:"D97706", red:"991B1B", lightR:"FEF2F2",
};

const thin  = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
const bAll  = { top: thin, bottom: thin, left: thin, right: thin };
const bNone = { top:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, bottom:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, left:{style:BorderStyle.NONE,size:0,color:"FFFFFF"}, right:{style:BorderStyle.NONE,size:0,color:"FFFFFF"} };
const bBotPara = (color,size=8) => ({ bottom:{ style:BorderStyle.SINGLE, size, color, space:3 } });
const bLeftBox = (color) => ({ ...bNone, left:{ style:BorderStyle.SINGLE, size:14, color }, top:thin, bottom:thin, right:thin });

const sp = (b=80,a=80) => ({before:b,after:a});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function run(text, opts={}) { return new TextRun({ text, font:"Arial", size:22, color:C.dark, ...opts }); }
function bRun(text, opts={}) { return run(text, { bold:true, ...opts }); }

function para(text, opts={}) {
  const children = typeof text === 'string' ? [run(text)] : text;
  return new Paragraph({ spacing:sp(80,80), children, ...opts });
}
function gap(n=1){ return Array(n).fill(null).map(()=>new Paragraph({children:[new TextRun("")],spacing:sp(30,30)})); }

function h1(text){ return new Paragraph({ heading:HeadingLevel.HEADING_1, spacing:sp(400,160), border:bBotPara(C.green,8), children:[new TextRun({text,bold:true,size:36,color:C.navy,font:"Arial"})] }); }
function h2(text){ return new Paragraph({ heading:HeadingLevel.HEADING_2, spacing:sp(280,120), children:[new TextRun({text,bold:true,size:28,color:C.green,font:"Arial"})] }); }
function h3(text){ return new Paragraph({ heading:HeadingLevel.HEADING_3, spacing:sp(200,80),  children:[new TextRun({text,bold:true,size:24,color:C.teal,font:"Arial"})] }); }
function h4(text){ return new Paragraph({ spacing:sp(160,60), children:[new TextRun({text,bold:true,size:22,color:C.navy,font:"Arial"})] }); }

function bullet(text, level=0){
  const children = typeof text==='string' ? [run(text)] : text;
  return new Paragraph({ numbering:{reference:"bullets",level}, spacing:sp(50,50), children });
}
function numbered(text, level=0){
  const children = typeof text==='string' ? [run(text)] : text;
  return new Paragraph({ numbering:{reference:"numbers",level}, spacing:sp(50,50), children });
}
function pageBreak(){ return new Paragraph({ children:[new PageBreak()] }); }

// ─── Table helpers ────────────────────────────────────────────────────────────
function hc(text, w, fill=C.navy, color=C.white){
  return new TableCell({ borders:bAll, width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR}, margins:{top:100,bottom:100,left:140,right:140},
    children:[new Paragraph({children:[new TextRun({text,bold:true,size:20,color,font:"Arial"})]})] });
}
function dc(text, w, fill=C.white, bold_=false, color_=C.dark){
  return new TableCell({ borders:bAll, width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140},
    children:[new Paragraph({children:[new TextRun({text,bold:bold_,size:20,font:"Arial",color:color_})]})] });
}
function dcm(paragraphs, w, fill=C.white){
  return new TableCell({ borders:bAll, width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140},
    children:paragraphs });
}
function dcCode(text, w, fill=C.white){
  return new TableCell({ borders:bAll, width:{size:w,type:WidthType.DXA},
    shading:{fill,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:140,right:140},
    children:[new Paragraph({children:[new TextRun({text,size:18,font:"Courier New",color:"4338CA"})]})] });
}

function tbl(colWidths, rows){ return new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:colWidths, rows }); }
function tRow(cells){ return new TableRow({ children:cells }); }

function infoBox(title, lines, borderColor=C.blue, bg=C.light){
  const children = [
    new Paragraph({ spacing:sp(0,80), children:[new TextRun({text:title,bold:true,size:22,color:borderColor,font:"Arial"})] }),
    ...lines.map(l => new Paragraph({ numbering:{reference:"bullets",level:0}, spacing:sp(40,40),
      children: typeof l==='string' ? [run(l)] : l }))
  ];
  return new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:[9026],
    rows:[tRow([new TableCell({ borders:bLeftBox(borderColor), shading:{fill:bg,type:ShadingType.CLEAR},
      margins:{top:120,bottom:120,left:200,right:160}, children })])] });
}

function banner(line1, line2, fill=C.navy){
  return new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:[9026],
    rows:[tRow([new TableCell({ borders:bNone, shading:{fill,type:ShadingType.CLEAR},
      margins:{top:220,bottom:220,left:360,right:360},
      children:[
        new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,60),children:[new TextRun({text:line1,bold:true,size:44,color:C.white,font:"Arial"})]}),
        ...(line2?[new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,0),children:[new TextRun({text:line2,size:22,color:"BFDBFE",font:"Arial"})]})]:[])
      ] })])] });
}

// ─── User Story Card ──────────────────────────────────────────────────────────
function usCard(id, titre, priorite, estimation, role, veux, afin, contexte, action, resultat, criteres){
  const pColor = priorite==="Must Have"?C.orange : priorite==="Should Have"?C.blue : C.teal;
  const bg = priorite==="Must Have"?"FFF7ED" : priorite==="Should Have"?C.light : C.lightG;
  return [
    new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:[9026],
      rows:[tRow([new TableCell({ borders:bLeftBox(pColor), shading:{fill:bg,type:ShadingType.CLEAR},
        margins:{top:120,bottom:120,left:200,right:160},
        children:[
          // Header
          new Paragraph({ spacing:sp(0,80), children:[
            new TextRun({text:`${id}  —  ${titre}`,bold:true,size:24,color:C.navy,font:"Arial"}),
            new TextRun({text:`     `,size:20,font:"Arial"}),
            new TextRun({text:`[ ${priorite} ]`,bold:true,size:18,color:pColor,font:"Arial"}),
            new TextRun({text:`   Estimation : ${estimation} points`,size:18,color:C.mid,font:"Arial"}),
          ]}),
          // User Story
          new Paragraph({ spacing:sp(0,40), children:[new TextRun({text:"User Story :",bold:true,size:20,color:C.dark,font:"Arial"})] }),
          new Paragraph({ spacing:sp(30,30), indent:{left:360}, children:[
            new TextRun({text:"En tant que ",size:20,font:"Arial",color:C.mid}),
            new TextRun({text:role,bold:true,size:20,font:"Arial",color:C.dark}),
            new TextRun({text:", je veux ",size:20,font:"Arial",color:C.mid}),
            new TextRun({text:veux,bold:true,size:20,font:"Arial",color:C.dark}),
          ]}),
          new Paragraph({ spacing:sp(30,40), indent:{left:360}, children:[
            new TextRun({text:"afin de ",size:20,font:"Arial",color:C.mid}),
            new TextRun({text:afin,size:20,font:"Arial",color:C.dark}),
          ]}),
          // Critères d'acceptation
          new Paragraph({ spacing:sp(40,30), children:[new TextRun({text:"Critères d'acceptation (Given / When / Then) :",bold:true,size:20,color:C.dark,font:"Arial"})] }),
          new Paragraph({ spacing:sp(20,20), indent:{left:360}, children:[
            new TextRun({text:"Etant donné que ",bold:true,size:19,font:"Arial",color:C.teal}),
            new TextRun({text:contexte,size:19,font:"Arial",color:C.dark}),
          ]}),
          new Paragraph({ spacing:sp(20,20), indent:{left:360}, children:[
            new TextRun({text:"Lorsque ",bold:true,size:19,font:"Arial",color:C.teal}),
            new TextRun({text:action,size:19,font:"Arial",color:C.dark}),
          ]}),
          new Paragraph({ spacing:sp(20,60), indent:{left:360}, children:[
            new TextRun({text:"Alors ",bold:true,size:19,font:"Arial",color:C.teal}),
            new TextRun({text:resultat,size:19,font:"Arial",color:C.dark}),
          ]}),
          // Critères additionnels
          ...(criteres.length>0 ? [new Paragraph({spacing:sp(20,20),children:[new TextRun({text:"Critères complémentaires :",bold:true,size:19,color:C.dark,font:"Arial"})]})] : []),
          ...criteres.map(c => new Paragraph({ numbering:{reference:"bullets",level:0}, spacing:sp(20,20),
            children:[run(c, {size:19})] })),
        ] })])] }),
    ...gap(1),
  ];
}

// ─── Document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering:{ config:[
    { reference:"bullets", levels:[
      { level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:720,hanging:360}}} },
      { level:1, format:LevelFormat.BULLET, text:"–", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:1080,hanging:360}}} },
    ]},
    { reference:"numbers", levels:[
      { level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:720,hanging:360}}} },
      { level:1, format:LevelFormat.DECIMAL, text:"%1.%2.", alignment:AlignmentType.LEFT, style:{paragraph:{indent:{left:1080,hanging:360}}} },
    ]},
  ]},
  styles:{
    default:{ document:{ run:{ font:"Arial", size:22 } } },
    paragraphStyles:[
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:36,bold:true,font:"Arial",color:C.navy}, paragraph:{spacing:sp(400,160),outlineLevel:0} },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:28,bold:true,font:"Arial",color:C.green}, paragraph:{spacing:sp(280,120),outlineLevel:1} },
      { id:"Heading3", name:"Heading 3", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{size:24,bold:true,font:"Arial",color:C.teal}, paragraph:{spacing:sp(200,80),outlineLevel:2} },
    ]
  },
  sections:[{
    properties:{ page:{ size:{width:11906,height:16838}, margin:{top:1134,right:1000,bottom:1134,left:1000}, pageNumbers:{start:1,formatType:NumberFormat.DECIMAL} } },
    headers:{ default: new Header({ children:[
      new Paragraph({ border:{ bottom:{style:BorderStyle.SINGLE,size:4,color:C.green,space:2} }, spacing:sp(0,80),
        children:[ new TextRun({text:"DarNa — Rapport de Projet  |  Génie Logiciel",bold:true,size:18,color:C.navy,font:"Arial"}),
          new TextRun({text:"   |   EMSI 2024–2025",size:18,color:C.mid,font:"Arial"}) ] })
    ]}) },
    footers:{ default: new Footer({ children:[
      new Paragraph({ border:{ top:{style:BorderStyle.SINGLE,size:3,color:"CBD5E1",space:2} }, spacing:sp(80,0),
        children:[ new TextRun({text:"© 2025 DarNa — Plateforme Immobilière Marocaine  |  Page ",size:17,color:"94A3B8",font:"Arial"}),
          new TextRun({
    children: [new PageNumberField()], // Si PageNumberField est disponible
    // OU plus simplement, utilisez cette méthode :
    children: [TextRun.fromField("PAGE")],
}) ] })
    ]}) },

    children:[

// ══════════════════════════════════════════════════════════════════════════════
// PAGE DE COUVERTURE
// ══════════════════════════════════════════════════════════════════════════════
new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:[9026],
  rows:[tRow([new TableCell({ borders:bNone, shading:{fill:C.navy,type:ShadingType.CLEAR},
    margins:{top:700,bottom:700,left:500,right:500},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,60),children:[new TextRun({text:"DarNa",size:80,font:"Arial",bold:true,color:C.white})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(60,40),children:[new TextRun({text:"Plateforme Immobiliere Marocaine",bold:true,size:40,color:C.white,font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,200),children:[new TextRun({text:"Studio IA Generatif",size:24,color:"93C5FD",font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(200,60),children:[new TextRun({text:"RAPPORT DE PROJET",bold:true,size:48,color:C.white,font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,200),children:[new TextRun({text:"Développement Agile Scrum  ·  Full-Stack React / Node.js / Supabase",size:22,color:"BFDBFE",font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(100,40),children:[new TextRun({text:"Module : Génie Logiciel  |  EMSI 2024–2025",size:20,color:"88BBDD",font:"Arial"})]}),
    ] })])] }),
...gap(2),
tbl([3000,6026],[
  tRow([hc("Informations du projet",9026,C.green)]),
  ...[ ["Titre","DarNa — Plateforme immobilière avec Studio IA de décoration intérieure"],
       ["Domaine","Immobilier numérique / Intelligence Artificielle Générative"],
       ["Méthodologie","Agile Scrum — 4 Sprints d'une semaine"],
       ["Encadrant","À compléter"],["Étudiant(s)","À compléter"],
       ["Établissement","EMSI — École Marocaine des Sciences de l'Ingénieur"],
       ["Filière / Niveau","À compléter"],
       ["Durée totale","4 semaines — Sprint 0 inclus"],
       ["Technologies","React 18 · Node.js · Express · Supabase · PostgreSQL · Fal.ai · Leaflet.js"],
       ["Date de remise","Juin 2025"],
  ].map(([k,v],i)=>tRow([dc(k,3000,i%2===0?C.grey:C.white,true,C.navy), dc(v,6026,i%2===0?C.grey:C.white)]))
]),
pageBreak(),

// ══════════════════════════════════════════════════════════════════════════════
// TABLE DES MATIÈRES
// ══════════════════════════════════════════════════════════════════════════════
h1("Table des matières"),
new TableOfContents("Table des matières",{ hyperlink:true, headingStyleRange:"1-3" }),
pageBreak(),

// ══════════════════════════════════════════════════════════════════════════════
// CHAPITRE 1 — INTRODUCTION
// ══════════════════════════════════════════════════════════════════════════════
banner("Chapitre 1","Introduction générale du projet",C.navy),
...gap(1),
h1("1. Introduction générale"),
...gap(1),

h2("1.1 Contexte général et problématique"),
para("Le marché immobilier marocain connaît une transformation numérique progressive. Les plateformes existantes telles qu'Avito Immobilier ou Mubawab ont permis de digitaliser la publication et la consultation d'annonces immobilières. Cependant, ces plateformes restent limitées à une simple présentation statique de biens, sans valeur ajoutée substantielle pour l'acheteur ou le locataire dans sa démarche de décision."),
...gap(1),
para("Le problème fondamental réside dans l'incapacité des acheteurs à se projeter visuellement dans un bien avant de le visiter. Face à une pièce vide ou meublée de manière différente de ses goûts, le potentiel acquéreur peine à imaginer son espace de vie. Ce manque de projection entraîne une multiplication des visites inutiles, une perte de temps pour toutes les parties et, in fine, un allongement du cycle de transaction immobilière."),
...gap(1),
infoBox("Problématique centrale du projet", [
  "Comment permettre à un acheteur ou locataire marocain de trouver rapidement un bien immobilier correspondant à ses critères précis, de se projeter visuellement dans ce bien grâce à l'intelligence artificielle générative, et de contacter le vendeur — le tout depuis une seule et même plateforme ?",
], C.orange, C.amber),
...gap(1),

h2("1.2 Présentation du projet DarNa"),
para([bRun("DarNa"), run(" (darija marocaine pour « notre maison ») est une plateforme immobilière marocaine innovante qui répond à cette problématique en combinant trois piliers fonctionnels complémentaires :")]),
bullet([bRun("Une marketplace complète : "), run("publication et recherche d'annonces de vente, location et terrains au Maroc, avec recherche multicritères, filtres avancés et carte interactive.")]),
bullet([bRun("Un Studio IA de décoration génératif : "), run("permettant à tout utilisateur de visualiser l'intérieur d'un bien décoré selon le style de son choix (Moderne, Oriental Marocain, Scandinave, Industriel, etc.) en moins de 5 secondes, grâce à l'API Fal.ai.")]),
bullet([bRun("Un espace de communication intégré : "), run("messagerie directe entre acheteurs et vendeurs, système de favoris, historique de consultations et tableaux de bord personnalisés.")]),
...gap(1),

h2("1.3 Objectifs du projet"),
h3("1.3.1 Objectif principal"),
para("Développer un Minimum Viable Product (MVP) fonctionnel, testable et présentable en 4 semaines de développement, couvrant les fonctionnalités essentielles d'une plateforme immobilière moderne enrichie par l'intelligence artificielle générative."),
...gap(1),
h3("1.3.2 Objectifs spécifiques"),
numbered("Implémenter un système d'authentification sécurisé (email + OAuth Google) basé sur Supabase Auth avec gestion des rôles (acheteur, vendeur, agence, administrateur)."),
numbered("Développer une marketplace avec recherche multicritères dynamique, filtres avancés (surface, pièces, étage, équipements) et tri des résultats (prix, date, surface)."),
numbered("Intégrer la carte interactive Leaflet.js pour visualiser géographiquement les annonces avec clusters et popups."),
numbered("Intégrer un Studio IA de décoration basé sur l'API Fal.ai (modèle flux-dev-fill) pour la génération d'images de décoration intérieure."),
numbered("Créer des tableaux de bord différenciés pour les acheteurs, vendeurs et administrateurs avec visualisation des statistiques."),
numbered("Déployer l'application sur des services cloud managés (Vercel + Render + Supabase) avec une approche CI/CD basique via Git."),
...gap(1),

h2("1.4 Périmètre du projet — Dans le scope / Hors scope"),
tbl([4513,4513],[
  tRow([hc("Dans le périmètre MVP (4 semaines)",4513,C.green), hc("Hors périmètre (V2 post-démo)",4513,C.orange)]),
  tRow([
    dcm(["Marketplace vente/location/terrain","Recherche multicritères (ville, type, budget)","Filtres avancés (surface, pièces, étage, équipements)","Tri dynamique (prix, date, surface)","Carte interactive Leaflet.js","Studio IA décoration (Fal.ai — 8 styles)","Messagerie directe (polling)","Dashboard acheteur avec statistiques","Dashboard vendeur avec graphiques","Modération admin basique","Système de favoris et historique","Authentification email + OAuth Google"].map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(30,30),children:[run(t,{size:19})]})), 4513, C.lightG),
    dcm(["Recommandations Neo4j (graphe collaboratif)","Messagerie temps réel Socket.io","Application mobile React Native","Paiements en ligne intégrés","PostGIS pour recherches géospatiales avancées","Visite virtuelle 360°","Signature électronique de contrats","Notifications push mobiles","Système de notation des agences","Tests automatisés Jest + Playwright complets"].map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(30,30),children:[run(t,{size:19})]})), 4513, "FFF7ED"),
  ]),
]),
...gap(1),

h2("1.5 Structure du rapport"),
para("Ce rapport est organisé selon les quatre chapitres définis dans le cadre du module Génie Logiciel :"),
bullet([bRun("Chapitre 1 — Introduction : "), run("contexte, problématique, objectifs et périmètre du projet.")]),
bullet([bRun("Chapitre 2 — Méthodologie Agile Scrum : "), run("choix de la méthode, équipe Scrum, artefacts, événements, user stories avec critères INVEST, priorisation MoSCoW et Definition of Done.")]),
bullet([bRun("Chapitre 3 — Planification et Conception : "), run("architecture technique, modèle de données, diagrammes des cas d'utilisation et roadmap des sprints.")]),
bullet([bRun("Chapitre 4 — Réalisation : "), run("environnement de développement, fonctionnalités implémentées, difficultés rencontrées, tests et déploiement.")]),
pageBreak(),

// ══════════════════════════════════════════════════════════════════════════════
// CHAPITRE 2 — MÉTHODOLOGIE AGILE SCRUM
// ══════════════════════════════════════════════════════════════════════════════
banner("Chapitre 2","Méthodologie Agile Scrum",C.green),
...gap(1),
h1("2. Méthodologie Agile Scrum"),
...gap(1),

h2("2.1 Pourquoi la méthode Agile Scrum ?"),
para("Comme l'illustre le cours de Génie Logiciel EMSI, les méthodes classiques telles que le modèle en cascade (Waterfall) ou le modèle en V présentent des limites importantes dans un contexte de développement à forte incertitude et délais courts. Parmi ces limites :"),
bullet("La rigidité du plan : une fois validé, le plan ne peut être modifié sans remettre en cause l'ensemble du processus."),
bullet("L'effet tunnel : le client ne voit le produit qu'en fin de cycle, ce qui accroît le risque de non-conformité."),
bullet("La levée tardive des risques : les tests de performance et d'intégration sont reportés après les développements."),
bullet("La faible implication du client : le client est consulté au début puis peu intégré au processus."),
...gap(1),
para("Face à ces limites, la méthode Agile Scrum, telle que définie dans le Scrum Guide, a été retenue pour le projet DarNa pour les raisons suivantes :"),
bullet([bRun("Contrainte de délai : "), run("4 semaines de développement solo nécessitent une planification à court terme, itérative, avec des livrables fonctionnels à chaque fin de sprint.")]),
bullet([bRun("Incertitude des besoins : "), run("les fonctionnalités liées à l'IA générative (Studio IA) impliquent une exploration progressive, typique d'un contexte complexe au sens de Scrum.")]),
bullet([bRun("Livraison de valeur continue : "), run("chaque sprint produit un incrément utilisable et testable, ce qui permet de valider l'avancement et d'ajuster les priorités.")]),
bullet([bRun("Transparence et adaptation : "), run("les trois piliers empiriques de Scrum — transparence, inspection, adaptation — garantissent un contrôle permanent de la qualité et de l'avancement.")]),
...gap(1),

h2("2.2 L'équipe Scrum et les responsabilités"),
para("Dans le cadre du projet DarNa, les rôles Scrum sont répartis comme suit. Comme le précise le Scrum Guide 2020, la Scrum Team est composée d'un Product Owner, d'un Scrum Master et de Developers, sans hiérarchie interne ni sous-équipes."),
...gap(1),
tbl([2200,2626,4200],[
  tRow([hc("Rôle Scrum",2200,C.navy), hc("Personne",2626,C.navy), hc("Responsabilités dans DarNa",4200,C.navy)]),
  ...([
    ["Product Owner","Étudiant (double rôle)","Définit et priorise le Product Backlog selon la méthode MoSCoW. Rédige les user stories. Valide les critères d'acceptation. Représente les besoins des utilisateurs finaux (acheteurs, vendeurs, agences marocaines)."],
    ["Scrum Master","Étudiant (double rôle)","Facilite les cérémonies Scrum (Sprint Planning, Daily Scrum, Review, Rétrospective). Lève les obstacles techniques. Veille au respect du cadre Scrum et de la Definition of Done."],
    ["Developer","Étudiant","Implémente les fonctionnalités front-end (React) et back-end (Express/Node.js). Gère les tests manuels. Maintient le Sprint Backlog à jour. Responsable de la qualité du code."],
    ["Encadrant","Professeur EMSI","Joue le rôle de stakeholder / client. Valide les incréments lors des Sprint Reviews. Fournit les orientations stratégiques sur les priorités du produit."],
  ]).map(([r,p,resp],i)=>tRow([dc(r,2200,i%2===0?C.grey:C.white,true,C.navy), dc(p,2626,i%2===0?C.grey:C.white,false,C.mid), dc(resp,4200,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("2.3 Les artefacts Scrum"),
h3("2.3.1 Le Product Backlog"),
para("Le Product Backlog est, selon le Scrum Guide, une liste ordonnée et émergente de ce qui est nécessaire pour améliorer le produit et la seule source de travail accompli par la Scrum Team. Pour DarNa, le Product Backlog est organisé en 6 épics fonctionnels, chaque épic regroupant des user stories priorisées selon la méthode MoSCoW."),
...gap(1),
infoBox("Objectif de Produit (Product Goal) — DarNa", [
  "Permettre à tout Marocain de trouver, visualiser et contacter en quelques clics le bien immobilier de ses rêves, en tirant parti de l'intelligence artificielle générative pour se projeter dans le bien avant de le visiter.",
], C.green, C.lightG),
...gap(1),

h3("2.3.2 Le Sprint Backlog"),
para("Le Sprint Backlog est composé, pour chaque sprint, de l'Objectif de Sprint (le pourquoi), des éléments du Product Backlog sélectionnés (le quoi) et d'un plan de livraison décomposé en tâches (le comment). Il est mis à jour quotidiennement par les Developers."),
...gap(1),

h3("2.3.3 L'Incrément et la Definition of Done"),
para("Chaque sprint doit produire un incrément « Terminé » (Done), c'est-à-dire une version fonctionnelle et utilisable du produit. La Definition of Done (DoD) du projet DarNa a été définie comme suit :"),
tbl([4513,4513],[
  tRow([hc("Critère",4513,C.teal), hc("Condition de satisfaction",4513,C.teal)]),
  ...([
    ["Code fonctionnel","La fonctionnalité s'exécute sans erreur en développement local (npm run dev)"],
    ["Test manuel validé","Le scénario principal de la user story a été testé manuellement et fonctionne"],
    ["Critères d'acceptation satisfaits","Tous les critères Given/When/Then de la user story sont vérifiés"],
    ["Pas de régression","Les fonctionnalités précédemment développées continuent de fonctionner"],
    ["Code commité","Le code est poussé sur le dépôt GitHub (branche dev ou main)"],
    ["Base de données cohérente","Les données sont correctement persistées dans Supabase PostgreSQL"],
    ["UI responsive","L'interface s'affiche correctement sur desktop (1280px minimum)"],
    ["Validation Product Owner","La fonctionnalité a été présentée et validée lors de la Sprint Review"],
  ]).map(([k,v],i)=>tRow([dc(k,4513,i%2===0?C.grey:C.white,true,C.dark), dc(v,4513,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("2.4 Les événements Scrum"),
tbl([1800,1400,1800,4026],[
  tRow([hc("Événement",1800,C.navy), hc("Durée (sprint 1 sem.)",1400,C.navy), hc("Participants",1800,C.navy), hc("Objectif dans DarNa",4026,C.navy)]),
  ...([
    ["Sprint Planning","2 heures","Équipe Scrum + Encadrant","Définir l'objectif du sprint, sélectionner les US du Product Backlog, décomposer en tâches techniques (le quoi + le comment)."],
    ["Daily Scrum","15 minutes (quotidien)","Developer","Inspecter la progression vers l'objectif du sprint. Répondre : Qu'ai-je fait hier ? Que vais-je faire aujourd'hui ? Y a-t-il des obstacles ?"],
    ["Sprint Review","1 heure","Équipe + Encadrant","Présenter l'incrément fonctionnel à l'encadrant (stakeholder). Valider les critères d'acceptation. Mettre à jour le Product Backlog."],
    ["Sprint Rétrospective","45 minutes","Équipe Scrum","Inspecter le déroulement du sprint (processus, outils, pratiques). Identifier les améliorations à apporter au sprint suivant."],
  ]).map(([ev,d,p,obj],i)=>tRow([dc(ev,1800,i%2===0?C.grey:C.white,true,C.navy),dc(d,1400,i%2===0?C.grey:C.white,false,C.mid),dc(p,1800,i%2===0?C.grey:C.white),dc(obj,4026,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("2.5 Priorisation MoSCoW du Product Backlog"),
para("Conformément au cours de Génie Logiciel EMSI, la technique de priorisation MoSCoW a été appliquée pour ordonner les fonctionnalités du Product Backlog selon leur valeur métier et leur criticité."),
...gap(1),
tbl([1600,2000,5426],[
  tRow([hc("Priorité",1600,C.navy), hc("Définition (cours EMSI)",2000,C.navy), hc("Fonctionnalités DarNa",5426,C.navy)]),
  ...([
    ["Must Have","DOIT être fait — le projet échoue sans cette fonctionnalité",
     "Inscription / Connexion email, OAuth Google, CRUD annonces, Recherche par ville/type/budget, Studio IA (génération décoration), Fiche détaillée annonce, Déploiement Vercel+Render"],
    ["Should Have","DEVRAIT être fait si possible — peut être livré plus tard",
     "Filtres avancés (surface, pièces, étage, ascenseur, parking), Tri des résultats, Messagerie directe, Dashboard acheteur, Dashboard vendeur, Système de favoris, Historique consultations"],
    ["Could Have","POURRAIT être fait si pas d'impact sur d'autres priorités",
     "Carte interactive Leaflet.js, Partage WhatsApp, Notifications, Analytics Posthog, Back-office admin complet, Comparaison rendus IA côte à côte"],
    ["Won't Have","NE SERA PAS fait dans cette version — réservé V2",
     "Recommandations Neo4j, Socket.io temps réel, Application mobile, Paiements, PostGIS avancé, Visite virtuelle 360°, Signature électronique"],
  ]).map(([p,d,f],i)=>{
    const pColor = p==="Must Have"?C.orange : p==="Should Have"?C.blue : p==="Could Have"?C.teal : C.mid;
    return tRow([dc(p,1600,i%2===0?C.grey:C.white,true,pColor), dc(d,2000,i%2===0?C.grey:C.white,false,C.mid), dc(f,5426,i%2===0?C.grey:C.white)]);
  })
]),
...gap(1),

h2("2.6 User Stories — Critères INVEST"),
para("Comme défini dans le cours de Génie Logiciel EMSI, une user story de qualité doit satisfaire aux 6 critères INVEST (Bill Wake) : Indépendante, Négociable, Précieuse (Valuable), Estimable, Petite (Small), Testable. Toutes les user stories du projet DarNa ont été rédigées selon ce cadre."),
...gap(1),
infoBox("Format standard des User Stories — DarNa", [
  "En tant que [rôle utilisateur],",
  "Je veux [réaliser une action / obtenir une fonctionnalité],",
  "Afin de [atteindre un objectif / obtenir une valeur métier].",
  "Critères d'acceptation (Given / When / Then) :",
  "Etant donné que [contexte / état initial du système],",
  "Lorsque [action réalisée par l'utilisateur],",
  "Alors [résultat observable attendu].",
], C.blue, C.light),
...gap(1),

// ─── ÉPIC 1 ───────────────────────────────────────────────────────────────────
h3("Épic 1 — Authentification & Gestion des comptes"),
para("Cet épic couvre l'ensemble des fonctionnalités d'accès à la plateforme. Il est prioritaire (Must Have) car sans authentification, aucune autre fonctionnalité personnalisée ne peut fonctionner."),
...gap(1),

...usCard("US-01","Inscription par email","Must Have","3",
  "visiteur de la plateforme DarNa",
  "m'inscrire avec mon adresse email et un mot de passe",
  "accéder à toutes les fonctionnalités personnalisées de la plateforme (favoris, messages, Studio IA)",
  "je suis sur la page /auth et que je clique sur 'Créer un compte'",
  "je remplis le formulaire (nom complet, email, mot de passe >= 8 caractères) et clique sur 'Créer mon compte'",
  "mon compte est créé dans Supabase Auth, un email de confirmation est envoyé automatiquement et je suis redirigé vers la page de connexion avec un message de succès",
  ["Un message d'erreur explicite s'affiche si l'email est déjà utilisé","La validation du formulaire est effectuée côté client (react-hook-form + Zod)","Un trigger PostgreSQL crée automatiquement le profil dans la table users","Le mot de passe est haché par Supabase (bcrypt) — jamais stocké en clair"]
),

...usCard("US-02","Connexion Google OAuth","Must Have","2",
  "utilisateur possédant un compte Google",
  "me connecter à DarNa via mon compte Google en un seul clic",
  "m'authentifier rapidement sans avoir à créer et mémoriser un mot de passe spécifique",
  "je suis sur la page /auth",
  "je clique sur le bouton 'Continuer avec Google'",
  "je suis redirigé vers la page d'authentification Google, puis automatiquement vers /dashboard après validation avec ma session active",
  ["Le profil utilisateur est créé automatiquement dans la table users si c'est la première connexion","L'avatar et le nom complet Google sont importés dans le profil","Le token JWT Supabase est stocké en localStorage pour les appels API"]
),

...usCard("US-03","Connexion par email","Must Have","1",
  "utilisateur inscrit sur DarNa",
  "me connecter avec mon email et mon mot de passe",
  "accéder à mon espace personnel et reprendre mes activités (favoris, messages, recherches)",
  "je suis sur la page /auth en mode connexion",
  "je saisis mon email et mon mot de passe valides, puis clique sur 'Se connecter'",
  "je suis redirigé vers /dashboard avec ma session active, et mes données personnelles (favoris, messages) sont chargées",
  ["Un message d'erreur 'Email ou mot de passe incorrect' s'affiche en cas de credentials invalides","Un bouton 'Oublié ?' permet de réinitialiser le mot de passe via email (Supabase Auth)","La route /dashboard est protégée par ProtectedRoute — redirection vers /auth si non connecté"]
),

...usCard("US-04","Déconnexion sécurisée","Must Have","1",
  "utilisateur connecté",
  "me déconnecter de la plateforme en un seul clic",
  "sécuriser mon espace personnel sur un appareil partagé ou public",
  "je suis connecté et je clique sur l'icône de déconnexion dans la sidebar",
  "je confirme ma déconnexion",
  "ma session est invalidée côté Supabase, le token JWT est supprimé du localStorage, et je suis redirigé vers /auth",
  ["Toutes les données personnelles en cache sont effacées","Le bouton de déconnexion est accessible depuis la sidebar sur toutes les pages protégées"]
),

...usCard("US-05","Gestion des rôles","Should Have","3",
  "administrateur de la plateforme",
  "attribuer et modifier les rôles des utilisateurs (buyer, seller, agency, admin)",
  "contrôler les droits d'accès aux fonctionnalités selon le profil de chaque utilisateur",
  "je suis connecté en tant qu'administrateur et je consulte la liste des utilisateurs",
  "je modifie le rôle d'un utilisateur via l'interface d'administration",
  "le rôle est mis à jour dans la table users de Supabase, les permissions RBAC sont immédiatement appliquées sur toutes les routes Express protégées",
  ["Le middleware auth.js Express vérifie le rôle via supabase.auth.getUser(token)","La politique RLS Supabase restreint l'accès aux données selon le rôle","Les routes /api/admin/* retournent 403 si le rôle n'est pas 'admin'"]
),

// ─── ÉPIC 2 ───────────────────────────────────────────────────────────────────
...gap(1),
h3("Épic 2 — Marketplace & Recherche"),
para("Cet épic constitue le coeur fonctionnel de la plateforme DarNa. Il couvre la recherche, le filtrage et la consultation des annonces immobilières."),
...gap(1),

...usCard("US-06","Recherche multicritères","Must Have","5",
  "acheteur ou locataire marocain",
  "rechercher un bien immobilier par ville, type (vente/location/terrain) et budget",
  "trouver rapidement des annonces correspondant à mes critères sans parcourir des centaines de résultats non pertinents",
  "je suis sur la page /annonces",
  "je saisis une ville (ex: Casablanca), je sélectionne le type 'Location' et je définis un budget maximum de 5 000 MAD, puis je clique sur 'Rechercher'",
  "la liste se met à jour dynamiquement pour n'afficher que les annonces actives correspondant aux 3 critères, avec le nombre de résultats affiché en haut ('X biens trouvés')",
  ["Les filtres sont encodés dans l'URL pour permettre le partage","Un message 'Aucun résultat' avec un bouton 'Réinitialiser les filtres' s'affiche si 0 annonces trouvées","La requête SQL Supabase utilise des filtres conditionnels enchaînés","La pagination (12 résultats/page) est gérée côté serveur avec LIMIT/OFFSET"]
),

...usCard("US-07","Filtres avancés","Should Have","5",
  "locataire cherchant un appartement précis",
  "filtrer les annonces par surface minimale et maximale, nombre de chambres, étage et équipements (ascenseur, parking)",
  "ne voir que les biens correspondant exactement à mes besoins spécifiques, sans me perdre dans des annonces non pertinentes",
  "je suis sur la page /annonces et que je clique sur le bouton 'Filtres'",
  "je définis : surface min 80m², 3 chambres, étage 2, avec ascenseur et parking, puis je clique sur 'Appliquer les filtres'",
  "le panneau de filtres se ferme, les chips de filtres actifs s'affichent sous la barre de recherche, et la grille d'annonces affiche uniquement les biens satisfaisant tous les critères",
  ["Chaque chip de filtre actif dispose d'un bouton x pour le supprimer individuellement","Un compteur de filtres actifs s'affiche sur le bouton 'Filtres'","La sélection du nombre de chambres utilise des chips visuels cliquables","Les filtres équipements sont des toggles binaires (ascenseur : oui/non, parking : oui/non)"]
),

...usCard("US-08","Tri des résultats","Should Have","2",
  "acheteur souhaitant optimiser sa recherche",
  "trier les résultats de recherche par prix croissant, prix décroissant, date de publication (plus récent) ou surface décroissante",
  "organiser ma recherche selon mes priorités du moment (trouver le moins cher, le plus récent, le plus grand)",
  "des annonces sont affichées sur la page /annonces",
  "je sélectionne 'Prix croissant' dans le menu déroulant de tri",
  "les annonces se réordonnent immédiatement, la première annonce affichée est celle avec le prix le plus bas parmi les résultats filtrés",
  ["Le tri est effectué côté serveur (ORDER BY SQL) pour garantir la cohérence avec la pagination","Les 4 options de tri disponibles : Plus récents / Prix croissant / Prix décroissant / Surface décroissante","Le tri sélectionné est mémorisé dans l'URL (paramètre sort=)"]
),

...usCard("US-09","Carte interactive","Could Have","5",
  "acheteur souhaitant visualiser la localisation des biens",
  "voir les annonces disponibles sur une carte interactive centrée sur la ville recherchée",
  "évaluer facilement la localisation d'un bien par rapport aux points d'intérêt importants (école, travail, transports)",
  "je suis sur la page /annonces avec des résultats filtrés",
  "je consulte la carte Leaflet.js affichée sous la barre de recherche",
  "les annonces sont représentées par des pins sur la carte, regroupés en clusters géographiques si plusieurs biens sont proches. Un clic sur un pin affiche une popup avec le titre, prix et un lien vers la fiche",
  ["La carte utilise les tuiles OpenStreetMap (100% gratuit, pas de clé API requise)","Les marqueurs sont colorés selon le type d'annonce (vente, location, terrain)","La carte se recentre automatiquement sur la ville sélectionnée dans les filtres"]
),

...usCard("US-10","Fiche annonce détaillée","Must Have","3",
  "acheteur intéressé par une annonce",
  "consulter la fiche complète d'un bien avec toutes les informations disponibles",
  "obtenir toutes les informations nécessaires pour prendre une décision éclairée avant de contacter le vendeur",
  "je clique sur 'Voir la fiche' depuis la liste des annonces",
  "je consulte la page /annonce/:id",
  "la fiche affiche : galerie photos (Cloudinary), titre, prix formaté, surface, pièces, étage, équipements, description complète, localisation sur une mini-carte, section 'Biens similaires' et bouton de contact",
  ["La consultation enregistre automatiquement une entrée dans property_views (historique + statistiques)","Les 'Biens similaires' sont des annonces de même type et même ville, triées par vues décroissantes","Un bouton 'Partager' génère l'URL de la fiche et propose le partage via WhatsApp ou copie du lien"]
),

// ─── ÉPIC 3 ───────────────────────────────────────────────────────────────────
...gap(1),
h3("Épic 3 — Gestion des annonces (Vendeur / Agence)"),
para("Cet épic couvre le parcours complet du vendeur ou de l'agence : de la publication d'une annonce jusqu'à son archivage, en passant par la consultation des statistiques."),
...gap(1),

...usCard("US-11","Publication d'une annonce","Must Have","5",
  "vendeur ou agence immobilière",
  "publier une nouvelle annonce avec titre, description, type, prix, surface, nombre de pièces, photos et localisation",
  "toucher un maximum d'acheteurs potentiels et recevoir des contacts qualifiés",
  "je suis connecté avec le rôle 'seller' ou 'agency' et que je clique sur 'Déposer une annonce'",
  "je complète le formulaire multi-étapes (infos générales → localisation → photos → validation) et clique sur 'Publier'",
  "l'annonce est créée avec le statut 'pending' dans Supabase, un email de notification est envoyé à l'administrateur pour validation, et un message de confirmation s'affiche au vendeur",
  ["Le formulaire utilise react-hook-form avec validation Zod (champs requis, formats)","L'upload des photos se fait directement vers Cloudinary via le widget front","La géolocalisation de l'adresse saisie est effectuée via l'API OpenCage (2500 req/jour gratuit)","L'annonce n'apparaît dans les résultats de recherche qu'après validation par l'administrateur (status='active')"]
),

...usCard("US-12","Tableau de bord vendeur","Should Have","5",
  "vendeur ayant des annonces actives sur DarNa",
  "consulter les statistiques de mes annonces (nombre de vues, contacts reçus) sur mon tableau de bord",
  "mesurer l'intérêt généré par chaque annonce et adapter ma stratégie de vente",
  "je suis connecté et que j'accède à /dashboard (rôle seller/agency)",
  "je consulte la section statistiques de mon tableau de bord",
  "j'accède à : total de mes annonces actives, total de vues cumulées, nombre de messages reçus, et un graphique d'évolution des vues sur les 7 derniers jours (Recharts LineChart)",
  ["Les données sont calculées en temps réel depuis les tables property_views et messages de Supabase","Le graphique affiche l'évolution quotidienne des vues par annonce","La liste de mes annonces (actives, en attente, archivées) est accessible depuis le dashboard"]
),

...usCard("US-13","Marquage vendu / loué","Must Have","2",
  "vendeur dont le bien a été vendu ou loué",
  "marquer mon annonce comme 'Vendu' ou 'Loué' depuis mon tableau de bord",
  "retirer automatiquement le bien des résultats de recherche et éviter de continuer à recevoir des contacts inutiles",
  "je suis sur mon dashboard vendeur et que mon bien a été vendu",
  "je clique sur le bouton 'Marquer comme vendu' de l'annonce concernée",
  "le statut de l'annonce est mis à jour à 'sold' dans Supabase, le bien disparaît immédiatement des résultats de recherche (WHERE status='active'), et un badge 'Vendu' s'affiche sur la fiche pour les utilisateurs qui auraient le lien direct",
  ["La suppression est logique (soft delete : status='sold'), pas physique — les données sont conservées","Les utilisateurs ayant ce bien en favoris reçoivent une notification (popup/badge) lors de leur prochaine connexion"]
),

// ─── ÉPIC 4 ───────────────────────────────────────────────────────────────────
...gap(1),
h3("Épic 4 — Studio IA Décoration"),
para([run("Le Studio IA est la fonctionnalité "), bRun("différenciante"), run(" de DarNa. Il s'appuie sur l'API Fal.ai et le modèle flux-dev-fill pour transformer la photo d'une pièce selon le style de décoration choisi par l'utilisateur.")]),
...gap(1),

...usCard("US-14","Génération IA de décoration","Must Have","8",
  "acheteur ou locataire ayant uploadé la photo d'une pièce d'un bien",
  "générer automatiquement une visualisation de la pièce décorée dans le style de mon choix",
  "me projeter visuellement dans le bien avant de le visiter, réduisant ainsi le nombre de visites inutiles",
  "je suis sur la page /studio et que j'ai uploadé une photo JPEG ou PNG d'une pièce",
  "je sélectionne le style 'Oriental Marocain' parmi les 8 styles disponibles et je clique sur 'Générer'",
  "un indicateur de chargement animé s'affiche pendant ~3 à 5 secondes, puis le rendu IA apparaît à côté de la photo originale. Le rendu est automatiquement sauvegardé dans la table ai_renders et dans Cloudinary",
  ["8 styles disponibles : Moderne, Oriental Marocain, Scandinave, Industriel, Bohème, Classique, Minimaliste, Contemporain","L'upload utilise react-dropzone avec validation (JPEG/PNG, max 10 MB)","L'image est prétraitée par Sharp (redimensionnement 1024px) avant envoi à Fal.ai","En cas d'erreur ou de timeout (>30s), un message d'erreur friendly s'affiche avec option de réessayer","Le rendu est lié à l'annonce si le Studio est ouvert depuis une fiche annonce"]
),

...usCard("US-15","Comparaison et régénération IA","Should Have","3",
  "utilisateur ayant généré un rendu IA",
  "comparer le rendu IA avec la photo originale côte à côte, et régénérer avec un autre style",
  "évaluer objectivement la transformation proposée et explorer plusieurs options de décoration",
  "un rendu IA a été généré et s'affiche sur la page Studio",
  "je clique sur 'Régénérer' pour obtenir un nouveau rendu avec un seed différent, ou je sélectionne un autre style",
  "un nouveau rendu est généré avec les mêmes paramètres mais un seed aléatoire différent, et s'affiche côte à côte avec le rendu précédent pour comparaison visuelle",
  ["L'historique des rendus générés est accessible depuis l'onglet 'Mes rendus' (table ai_renders)","Un bouton 'Télécharger' permet de sauvegarder localement le rendu généré","La comparaison côte à côte utilise un slider ou un toggle avant/après"]
),

// ─── ÉPIC 5 ───────────────────────────────────────────────────────────────────
...gap(1),
h3("Épic 5 — Messagerie, Favoris & Profil"),
para("Cet épic couvre les fonctionnalités sociales et personnelles de la plateforme : communication entre acheteurs et vendeurs, gestion des favoris et profil utilisateur."),
...gap(1),

...usCard("US-16","Messagerie directe","Must Have","5",
  "acheteur intéressé par une annonce",
  "envoyer un message directement au vendeur depuis la fiche d'un bien",
  "obtenir des informations complémentaires ou planifier une visite sans quitter la plateforme DarNa",
  "je suis sur la fiche d'une annonce active et que je clique sur 'Contacter le vendeur'",
  "je saisis mon message et je clique sur 'Envoyer'",
  "le message est enregistré dans la table messages de Supabase, une conversation est créée si elle n'existe pas (table conversations), et le vendeur voit un badge de message non lu sur son dashboard",
  ["La messagerie utilise un polling toutes les 3 secondes pour récupérer les nouveaux messages","Chaque conversation est liée à une annonce spécifique (property_id dans conversations)","Le badge 'messages non lus' dans la sidebar se met à jour à chaque chargement de page"]
),

...usCard("US-17","Système de favoris","Should Have","3",
  "acheteur en cours de recherche",
  "ajouter un bien à mes favoris depuis la liste ou la fiche annonce",
  "retrouver facilement les biens qui m'intéressent sans avoir à refaire ma recherche",
  "je consulte une annonce qui m'intéresse",
  "je clique sur l'icône coeur",
  "le coeur devient rouge, le bien est ajouté à la table favorites dans Supabase, et une notification toast 'Ajouté aux favoris' confirme l'action. Le bien apparaît dans la section 'Mes Favoris' du dashboard",
  ["La contrainte UNIQUE(user_id, property_id) empêche les doublons dans la table favorites","Un deuxième clic sur le coeur retire le bien des favoris avec confirmation toast","Si un bien favori est marqué Vendu/Loué, un badge informatif s'affiche sur la card dans les favoris"]
),

...usCard("US-18","Historique de consultations","Could Have","2",
  "acheteur souhaitant reprendre sa recherche",
  "consulter la liste des biens que j'ai récemment consultés",
  "reprendre facilement ma recherche là où je l'avais laissée sans avoir à refaire les mêmes filtres",
  "je me connecte à mon dashboard après avoir consulté plusieurs annonces",
  "je consulte la carte 'Dernière recherche' sur mon dashboard",
  "la ville et le type de bien de ma dernière consultation s'affichent avec un bouton 'Continuer' qui relance la recherche avec les mêmes paramètres",
  ["L'historique est stocké dans la table property_views (user_id, property_id, viewed_at)","La dernière ville/type consultés sont récupérés via une jointure avec la table properties","Les données d'historique alimentent également les statistiques du dashboard vendeur"]
),

// ─── ÉPIC 6 ───────────────────────────────────────────────────────────────────
...gap(1),
h3("Épic 6 — Administration & Modération"),
para("Cet épic couvre les fonctionnalités réservées à l'administrateur pour garantir la qualité du contenu publié et la sécurité de la plateforme."),
...gap(1),

...usCard("US-19","Validation des annonces","Must Have","3",
  "administrateur de la plateforme DarNa",
  "valider ou rejeter les annonces soumises par les vendeurs avant leur publication",
  "garantir la qualité, l'exactitude et la conformité du contenu publié sur la plateforme",
  "je suis connecté en tant qu'administrateur et que je consulte le back-office /admin/properties",
  "je consulte une annonce en statut 'pending' et je clique sur 'Valider' ou 'Rejeter' avec un commentaire",
  "le statut de l'annonce passe à 'active' (visible dans les recherches) ou 'rejected' (archivée), et un email de notification est envoyé au vendeur avec le statut et le commentaire de l'administrateur",
  ["Le back-office liste toutes les annonces avec filtres par statut (pending/active/rejected)","La politique RLS Supabase autorise le SELECT sur toutes les annonces pour le rôle 'admin'","Les actions admin sont tracées (timestamp, adminId) pour audit"]
),

...usCard("US-20","Gestion des signalements","Should Have","3",
  "administrateur",
  "consulter et traiter les signalements d'annonces soumis par les utilisateurs",
  "traiter rapidement les contenus inappropriés ou frauduleux pour maintenir la confiance des utilisateurs",
  "je consulte la page /admin/reports",
  "je clique sur un signalement et je choisis l'action appropriée (supprimer l'annonce / ignorer le signalement)",
  "le statut du signalement est mis à jour ('resolved' ou 'dismissed'), l'annonce est supprimée si nécessaire, et le compteur de signalements ouverts se met à jour dans le dashboard admin",
  ["Un bouton 'Signaler' est disponible sur chaque fiche annonce pour les utilisateurs connectés","Le signalement inclut une catégorie (annonce frauduleuse, photos inappropriées, prix erroné, etc.)","Les signalements sont triés par date et nombre de signalements par annonce"]
),

...gap(1),
h2("2.7 Résumé du Product Backlog"),
para("Le tableau ci-dessous synthétise l'ensemble des user stories du Product Backlog DarNa avec leur estimation en points (Planning Poker — suite de Fibonacci) :"),
...gap(1),
tbl([800,1600,2800,1400,800,1626],[
  tRow([hc("ID",800,C.navy), hc("Épic",1600,C.navy), hc("Titre",2800,C.navy), hc("Priorité",1400,C.navy), hc("Pts",800,C.navy), hc("Sprint",1626,C.navy)]),
  ...([
    ["US-01","Auth","Inscription par email","Must Have","3","Sprint 1"],
    ["US-02","Auth","Connexion Google OAuth","Must Have","2","Sprint 1"],
    ["US-03","Auth","Connexion par email","Must Have","1","Sprint 1"],
    ["US-04","Auth","Déconnexion sécurisée","Must Have","1","Sprint 1"],
    ["US-05","Auth","Gestion des rôles","Should Have","3","Sprint 1"],
    ["US-06","Marketplace","Recherche multicritères","Must Have","5","Sprint 2"],
    ["US-07","Marketplace","Filtres avancés","Should Have","5","Sprint 2"],
    ["US-08","Marketplace","Tri des résultats","Should Have","2","Sprint 2"],
    ["US-09","Marketplace","Carte interactive Leaflet","Could Have","5","Sprint 2"],
    ["US-10","Marketplace","Fiche annonce détaillée","Must Have","3","Sprint 2"],
    ["US-11","Annonces","Publication annonce","Must Have","5","Sprint 2"],
    ["US-12","Annonces","Dashboard vendeur stats","Should Have","5","Sprint 4"],
    ["US-13","Annonces","Marquage vendu/loué","Must Have","2","Sprint 4"],
    ["US-14","Studio IA","Génération décoration IA","Must Have","8","Sprint 3"],
    ["US-15","Studio IA","Comparaison et régénération","Should Have","3","Sprint 3"],
    ["US-16","Social","Messagerie directe","Must Have","5","Sprint 3"],
    ["US-17","Social","Système de favoris","Should Have","3","Sprint 2"],
    ["US-18","Social","Historique consultations","Could Have","2","Sprint 3"],
    ["US-19","Admin","Validation annonces","Must Have","3","Sprint 4"],
    ["US-20","Admin","Gestion signalements","Should Have","3","Sprint 4"],
  ]).map(([id,epic,titre,prio,pts,sprint],i)=>{
    const pColor = prio==="Must Have"?C.orange : prio==="Should Have"?C.blue : C.teal;
    return tRow([
      dc(id,800,i%2===0?C.grey:C.white,true,C.navy),
      dc(epic,1600,i%2===0?C.grey:C.white,false,C.mid),
      dc(titre,2800,i%2===0?C.grey:C.white),
      dc(prio,1400,i%2===0?C.grey:C.white,true,pColor),
      dc(pts,800,i%2===0?C.grey:C.white,true,C.dark),
      dc(sprint,1626,i%2===0?C.grey:C.white,false,C.green),
    ]);
  })
]),
...gap(1),
para([bRun("Total estimé : "), run("73 points  |  "), bRun("Must Have : "), run("38 pts  |  "), bRun("Should Have : "), run("27 pts  |  "), bRun("Could Have : "), run("8 pts")]),
pageBreak(),

// ══════════════════════════════════════════════════════════════════════════════
// CHAPITRE 3 — PLANIFICATION & CONCEPTION
// ══════════════════════════════════════════════════════════════════════════════
banner("Chapitre 3","Planification & Conception Technique",C.teal),
...gap(1),
h1("3. Planification & Conception"),
...gap(1),

h2("3.1 Roadmap des Sprints — Planning de Release"),
para("Conformément aux pratiques Scrum, le projet DarNa a été découpé en 4 sprints d'une semaine chacun, précédés d'un Sprint 0 de préparation. Chaque sprint se termine par une Sprint Review avec l'encadrant (stakeholder) et une Sprint Rétrospective."),
...gap(1),

infoBox("Sprint 0 — Préparation (avant Sprint 1)", [
  "Élaboration de la Vision Produit DarNa (format Elevator Pitch de Geoffrey Moore)",
  "Rédaction du Product Backlog initial et priorisation MoSCoW",
  "Choix du stack technologique et justification des décisions techniques",
  "Configuration de l'environnement de développement (VS Code, Node.js, Git)",
  "Création du projet Supabase et configuration initiale (tables SQL, Auth)",
  "Création des dépôts GitHub (client/ et server/)",
  "Identification des parties prenantes et définition de la Definition of Done",
], C.green, C.lightG),
...gap(1),

tbl([1100,1500,2226,4200],[
  tRow([hc("Sprint",1100,C.navy), hc("Durée",1500,C.navy), hc("Objectif du Sprint",2226,C.navy), hc("User Stories réalisées + Tâches techniques",4200,C.navy)]),
  ...([
    ["Sprint 1","Semaine 1 J1-J7","Fondations & Authentification",
     ["US-01 : Inscription email — Supabase Auth signUp()","US-02 : OAuth Google — Supabase signInWithOAuth()","US-03 : Connexion email — signInWithPassword()","US-04 : Déconnexion — signOut()","US-05 : Gestion rôles — Middleware RBAC Express","Setup monorepo client/ + server/","Configuration tables SQL Supabase (script complet)","Trigger PostgreSQL : création auto profil users","Middleware auth.js Express (vérification JWT)","Déploiement initial Vercel + Render","Variables d'environnement (.env + .env.example)"]],
    ["Sprint 2","Semaine 2 J8-J14","Marketplace & Carte",
     ["US-06 : Recherche multicritères — requêtes SQL Supabase conditionnelles","US-07 : Filtres avancés — panneau filtres + chips résumé","US-08 : Tri dynamique — ORDER BY + select Supabase","US-09 : Carte Leaflet.js — GeoJSON + clusters + popups","US-10 : Fiche annonce — page /annonce/:id complète","US-11 : Publication annonce — formulaire multi-étapes","US-17 : Système favoris — table favorites + toggle coeur","Pagination côté serveur (12 résultats/page LIMIT/OFFSET)","Upload images Cloudinary Widget (direct depuis le front)","Synchronisation filtres dans l'URL (useSearchParams)"]],
    ["Sprint 3","Semaine 3 J15-J21","Studio IA & Messagerie",
     ["US-14 : Studio IA — POST /api/studio/generate → Fal.ai","US-15 : Comparaison IA — rendu côte à côte + régénération","US-16 : Messagerie — conversations + messages + polling 3s","US-18 : Historique — table property_views + dashboard","Intégration react-dropzone pour upload photo pièce","Prompt engineering dynamique selon style sélectionné","Sauvegarde rendus IA dans Cloudinary + table ai_renders","Partage annonce WhatsApp + copie lien (navigator.share)"]],
    ["Sprint 4","Semaine 4 J22-J28","Dashboard & Démo finale",
     ["US-12 : Dashboard vendeur — stats + Recharts LineChart","US-13 : Marquage vendu/loué — UPDATE status Supabase","US-19 : Validation admin — back-office /admin/properties","US-20 : Signalements — table reports + interface admin","Dashboard acheteur complet (bento grid + profil)","Analytics Posthog (events search, ai_generated)","Polish UI responsive + animations Tailwind","Chargement données de démo (6 annonces Casablanca)","Tests manuels critères d'acceptation (checklist complète)","Répétition démo finale — parcours acheteur + vendeur"]],
  ]).map(([s,d,obj,tasks],i)=>tRow([
    dc(s,1100,i%2===0?C.lightG:C.white,true,C.green),
    dc(d,1500,i%2===0?C.lightG:C.white,false,C.mid),
    dc(obj,2226,i%2===0?C.lightG:C.white,true,C.dark),
    dcm(tasks.map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(25,25),children:[run(t,{size:19})]})),4200,i%2===0?C.lightG:C.white),
  ]))
]),
...gap(1),

h2("3.2 Vision Produit — Format Elevator Pitch"),
para("Conformément au format proposé par Geoffrey Moore et enseigné dans le cours de Génie Logiciel EMSI, la vision produit de DarNa est rédigée comme suit :"),
...gap(1),
tbl([2500,6526],[
  tRow([hc("Élément",2500,C.green), hc("Contenu",6526,C.green)]),
  ...([
    ["POUR (public cible)","Les acheteurs et locataires marocains âgés de 25 à 50 ans, actifs digitalement, cherchant un bien immobilier (appartement, villa, terrain) au Maroc"],
    ["QUI SOUHAITENT","Trouver rapidement un bien correspondant à leurs critères précis et se projeter visuellement dans ce bien avant de le visiter physiquement"],
    ["NOTRE PRODUIT EST","DarNa — une plateforme web immobilière marocaine combinant marketplace et intelligence artificielle générative"],
    ["QUI PERMET","De rechercher, filtrer, visualiser des annonces immobilières ET de voir comment un bien pourrait être décoré selon son style personnel, grâce au Studio IA intégré"],
    ["À LA DIFFÉRENCE DE","Avito Immobilier et Mubawab qui proposent uniquement des annonces statiques sans outils de projection ou d'aide à la décision"],
    ["PERMET DE","Réduire le nombre de visites inutiles, accélérer la prise de décision et offrir une expérience d'achat immobilier unique au Maroc"],
  ]).map(([k,v],i)=>tRow([dc(k,2500,i%2===0?C.grey:C.white,true,C.navy), dc(v,6526,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("3.3 Architecture technique"),
para("L'architecture de DarNa repose sur un modèle découplé en trois couches : un frontend SPA React (déployé sur Vercel), un backend API REST Node.js/Express (déployé sur Render) et des services cloud managés pour la persistance, l'authentification et les fonctionnalités IA."),
...gap(1),
tbl([1800,2400,4826],[
  tRow([hc("Couche",1800,C.navy), hc("Technologie",2400,C.navy), hc("Justification du choix",4826,C.navy)]),
  ...([
    ["Frontend","React 18 + Vite","SPA performante, HMR natif, architecture composants réutilisables. Déjà maîtrisé par l'équipe."],
    ["Styling","TailwindCSS 3","Design system cohérent, classes utilitaires, personnalisation couleurs DarNa (#486459). Pas de CSS custom à maintenir."],
    ["Routage","React Router v6","Navigation SPA, routes protégées (ProtectedRoute), lazy-loading pages, synchronisation URL."],
    ["Formulaires","React Hook Form + Zod","Validation typée côté client, performances optimisées (pas de re-render inutile), partage schémas front/back."],
    ["Carte","Leaflet.js + React-Leaflet","Open-source, gratuit (OpenStreetMap), léger, clusters via leaflet.markercluster. Pas de clé API payante."],
    ["Backend","Node.js 20 + Express 5","Runtime JavaScript côté serveur, API REST mature, middlewares (Helmet, CORS, Rate-limit), déjà maîtrisé."],
    ["Base de données","PostgreSQL via Supabase","ACID, SQL standard, PostGIS disponible, RLS intégré, dashboard admin, API auto-générée, free tier généreux."],
    ["Auth","Supabase Auth","JWT + refresh tokens, OAuth Google, email confirmation, RBAC — zéro configuration serveur requise."],
    ["Upload","Cloudinary Widget","Upload direct depuis le front vers CDN sans transiter par le serveur Node. Transformations images à la volée."],
    ["Studio IA","Fal.ai API (flux-dev-fill)","Génération img2img en ~3-5s, paiement à l'usage (~0.003$/image), 8 styles de décoration, API REST simple."],
    ["Analytics","Posthog.js","Events produit (search, ai_generated, contact_seller), dashboard analytics open-source, free tier 1M events/mois."],
    ["Déploiement","Vercel + Render + Supabase","Services managés, déploiement automatique sur push Git, SSL auto, CDN mondial. Budget ~0-30$/mois MVP."],
  ]).map(([l,t,j],i)=>tRow([dc(l,1800,i%2===0?C.grey:C.white,true,C.navy), dc(t,2400,i%2===0?C.grey:C.white,true,C.blue), dc(j,4826,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("3.4 Modèle de données — Schéma PostgreSQL (Supabase)"),
para("Le schéma de base de données PostgreSQL comprend 8 tables reliées par des clés étrangères. La sécurité d'accès aux données est assurée par les politiques Row Level Security (RLS) de Supabase."),
...gap(1),
tbl([1500,3326,4200],[
  tRow([hc("Table",1500,C.teal), hc("Colonnes principales",3326,C.teal), hc("Description et contraintes",4200,C.teal)]),
  ...([
    ["users","id (UUID, PK, ref auth.users), email, full_name, role, avatar_url, is_active, is_private, bio, created_at","Profils utilisateurs. Rôles : buyer | seller | agency | admin. Créé automatiquement par trigger on_auth_user_created."],
    ["properties","id (UUID, PK), user_id (FK->users), title, type, status, price, surface, rooms, floor, has_elevator, has_parking, city, address, lat, lng, images[], views, created_at","Annonces immobilières. types : sale|rent|land. status : pending|active|sold|rented|rejected. Index sur city, type, status, price."],
    ["favorites","id, user_id (FK), property_id (FK), created_at — UNIQUE(user_id, property_id)","Biens favoris. Contrainte UNIQUE évite les doublons. Suppression en cascade si bien supprimé."],
    ["conversations","id, buyer_id (FK->users), seller_id (FK->users), property_id (FK), created_at — UNIQUE(buyer,seller,property)","Threads de discussion liés à une annonce spécifique. Un seul thread par triplet (acheteur, vendeur, bien)."],
    ["messages","id, conversation_id (FK), sender_id (FK->users), content, read_at (NULL=non lu), created_at","Messages individuels. read_at NULL = message non lu. Utilisé pour le compteur de badges non lus."],
    ["property_views","id, user_id (FK), property_id (FK), viewed_at","Historique de consultations. Alimente les stats vendeur (SUM vues), le dashboard acheteur (dernière recherche) et les 'Biens similaires'."],
    ["ai_renders","id, user_id (FK), property_id (FK, nullable), original_url, rendered_url, style, status (pending|done|error), created_at","Rendus IA générés par le Studio. status pending->done une fois Fal.ai répond. Lié optionnellement à une annonce."],
    ["reports","id, reporter_id (FK->users), property_id (FK), reason, status (open|resolved|dismissed), created_at","Signalements d'annonces. status open par défaut, géré par l'administrateur depuis le back-office."],
  ]).map(([t,c,d],i)=>tRow([
    dc(t,1500,i%2===0?C.grey:C.white,true,C.teal),
    dcCode(c,3326,i%2===0?C.grey:C.white),
    dc(d,4200,i%2===0?C.grey:C.white),
  ]))
]),
...gap(1),

h2("3.5 Diagramme des cas d'utilisation"),
tbl([3008,3009,3009],[
  tRow([hc("Acheteur / Locataire",3008,C.blue), hc("Vendeur / Agence",3009,C.green), hc("Administrateur",3009,C.navy)]),
  tRow([
    dcm(["S'inscrire / Se connecter","Rechercher des biens (ville, type, budget)","Appliquer des filtres avancés","Trier les résultats","Consulter la carte interactive","Consulter une fiche annonce","Ajouter/retirer des favoris","Utiliser le Studio IA Décoration","Comparer rendus IA","Envoyer un message à un vendeur","Consulter son historique","Partager une annonce","Éditer son profil"].map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(25,25),children:[run(t,{size:19})]})), 3008, C.light),
    dcm(["S'inscrire / Se connecter","Publier une annonce (formulaire multi-étapes)","Uploader des photos","Modifier ses annonces","Marquer un bien Vendu / Loué","Consulter son dashboard statistiques","Répondre aux messages d'acheteurs","Archiver une annonce","Gérer son profil / agence"].map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(25,25),children:[run(t,{size:19})]})), 3009, C.lightG),
    dcm(["Se connecter (rôle admin)","Consulter toutes les annonces","Valider / Rejeter une annonce","Gérer les signalements","Suspendre / Réactiver un compte","Consulter les analytics Posthog","Modifier les rôles utilisateurs"].map(t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(25,25),children:[run(t,{size:19})]})), 3009, C.grey),
  ]),
]),
pageBreak(),

// ══════════════════════════════════════════════════════════════════════════════
// CHAPITRE 4 — RÉALISATION
// ══════════════════════════════════════════════════════════════════════════════
banner("Chapitre 4","Réalisation & Implémentation",C.orange),
...gap(1),
h1("4. Réalisation"),
...gap(1),

h2("4.1 Environnement de développement"),
tbl([2500,6526],[
  tRow([hc("Outil",2500,C.navy), hc("Version & Usage",6526,C.navy)]),
  ...([
    ["VS Code","Éditeur principal — extensions : ESLint, Prettier, Tailwind CSS IntelliSense, GitLens"],
    ["Node.js","v20 LTS — Runtime JavaScript serveur"],
    ["npm / npx","v10 — Gestionnaire paquets, scripts dev/build"],
    ["Git + GitHub","Versioning, branches main (production) et dev (développement)"],
    ["Supabase Dashboard","Administration PostgreSQL, SQL Editor, Auth, RLS policies, Logs"],
    ["Postman","Test endpoints API Express avant intégration frontend"],
    ["Chrome DevTools","Débogage React, inspection réseau, analyse performances"],
    ["Cloudinary","CDN images annonces + rendus IA, upload direct depuis le frontend"],
  ]).map(([t,u],i)=>tRow([dc(t,2500,i%2===0?C.grey:C.white,true,C.navy), dc(u,6526,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("4.2 Structure du projet — Monorepo"),
tbl([4513,4513],[
  tRow([hc("client/src/ (Frontend React)",4513,C.blue), hc("server/ (Backend Express)",4513,C.green)]),
  tRow([
    dcm([
      "pages/AuthPage.jsx","pages/DashboardPage.jsx","pages/AnnoncesPage.jsx",
      "pages/StudioPage.jsx","pages/AnnonceDetail.jsx","pages/AdminPage.jsx",
      "hooks/useAuth.js  <- contexte Auth global",
      "lib/supabase.js   <- client Supabase",
      "App.jsx           <- Router + ProtectedRoute",
      "index.css         <- Tailwind + reset CSS",
      "tailwind.config.js <- couleurs DarNa",
    ].map(f=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(22,22),children:[new TextRun({text:f,size:18,font:"Courier New",color:"4338CA"})]})), 4513, C.light),
    dcm([
      "routes/auth.js      <- /api/auth/me + /profile",
      "routes/properties.js <- /api/properties CRUD",
      "routes/messages.js  <- /api/messages + convs",
      "routes/studio.js    <- /api/studio/generate",
      "routes/admin.js     <- /api/admin/*",
      "middleware/auth.js  <- vérification JWT Supabase",
      "middleware/upload.js <- Multer config",
      "lib/supabase.js     <- client service_role",
      "lib/fal.js          <- wrapper Fal.ai API",
      "index.js            <- app Express + middlewares",
      ".env                <- variables d'environnement",
    ].map(f=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp(22,22),children:[new TextRun({text:f,size:18,font:"Courier New",color:"4338CA"})]})), 4513, C.lightG),
  ]),
]),
...gap(1),

h2("4.3 Fonctionnalités implémentées par sprint"),
h3("4.3.1 Sprint 1 — Authentification"),
para("L'authentification est entièrement gérée par Supabase Auth. L'implémentation repose sur un contexte React (AuthProvider) qui expose les méthodes signIn, signUp, signInWithGoogle et signOut à tous les composants."),
bullet([bRun("Supabase Auth signUp() : "), run("création compte + envoi email confirmation automatique. Options : full_name dans user_metadata.")]),
bullet([bRun("OAuth Google : "), run("supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/dashboard' } }). Création profil automatique si premier login.")]),
bullet([bRun("Trigger PostgreSQL : "), run("fonction handle_new_user() appelée on_auth_user_created — insère automatiquement dans la table users avec le rôle 'buyer' par défaut.")]),
bullet([bRun("ProtectedRoute React : "), run("vérifie user && !loading depuis useAuth() — redirige vers /auth si non authentifié.")]),
bullet([bRun("Middleware Express auth.js : "), run("extrait le Bearer token des headers, appelle supabase.auth.getUser(token), attache req.user pour les routes protégées.")]),
...gap(1),

h3("4.3.2 Sprint 2 — Marketplace & Recherche"),
para("La page /annonces implémente toutes les user stories de recherche. La requête Supabase est construite dynamiquement par chaînage conditionnel."),
bullet([bRun("Requête Supabase dynamique : "), run("if (city) query = query.eq('city', city) — chaque filtre est ajouté conditionnellement selon les valeurs renseignées par l'utilisateur.")]),
bullet([bRun("Synchronisation URL : "), run("useSearchParams() de React Router synchronise tous les filtres actifs dans l'URL (/annonces?city=Casablanca&type=rent&maxPrice=5000).")]),
bullet([bRun("Tri côté serveur : "), run("ORDER BY col ASC/DESC selon le paramètre sort= — garantit la cohérence avec la pagination LIMIT/OFFSET.")]),
bullet([bRun("Carte Leaflet.js : "), run("endpoint GET /api/properties/geojson retourne un FeatureCollection. react-leaflet MapContainer + GeoJSON layer + MarkerClusterGroup.")]),
bullet([bRun("Mode démo : "), run("tableau DEMO_PROPERTIES de 6 annonces fictives affiché si la table properties est vide ou inaccessible (try/catch).")]),
...gap(1),

h3("4.3.3 Sprint 3 — Studio IA"),
para("Le Studio IA est la fonctionnalité la plus complexe du projet, impliquant une chaîne de traitement complète : upload → prétraitement → génération IA → sauvegarde → affichage."),
bullet([bRun("Flux complet : "), run("react-dropzone (upload) → Cloudinary (stockage original) → POST /api/studio/generate → Express → Fal.ai flux-dev-fill → Cloudinary (stockage rendu) → INSERT ai_renders → réponse URL rendu.")]),
bullet([bRun("Prompt engineering : "), run("template dynamique selon le style. Adapté à chacun des 8 styles.")]),
bullet([bRun("Gestion latence : "), run("loader animé Tailwind pendant la génération (~3-5s). Timeout 30s avec message d'erreur friendly et bouton 'Réessayer'.")]),
...gap(1),

h3("4.3.4 Sprint 4 — Dashboard & Administration"),
bullet([bRun("Dashboard acheteur — bento grid : "), run("statistiques Supabase en parallèle (Promise.allSettled) : property_views count, favorites count, messages unread count. Fallback gracieux si une requête échoue.")]),
bullet([bRun("Dashboard vendeur — graphique : "), run("Recharts LineChart avec données agrégées : SELECT count(*), date FROM property_views WHERE property_id IN (mes annonces) GROUP BY date ORDER BY date.")]),
bullet([bRun("Back-office admin : "), run("liste annonces filtrées par statut (pending/active/rejected). Boutons Valider / Rejeter avec commentaire. UPDATE status Supabase + email notification Nodemailer.")]),
...gap(1),

h2("4.4 Difficultés rencontrées et solutions"),
tbl([3500,5526],[
  tRow([hc("Difficulté rencontrée",3500,C.navy), hc("Solution adoptée",5526,C.navy)]),
  ...([
    ["Conflit CSS entre le fichier index.css legacy (width:1126px, text-align:center sur #root) et les classes Tailwind, causant un layout cassé sur /auth et /dashboard",
     "Suppression complète des règles CSS conflictuelles sur #root. Remplacement par un reset minimal : * { box-sizing: border-box }, body { font-family: 'Inter' }, #root { width: 100%; display: block }."],
    ["Variable logoDarna non définie causant un crash React (écran blanc) sur DashboardPage",
     "Import explicite du fichier logo : import logoDarna from '../assets/logoDarna.png'. Vérification du chemin et de l'extension dans src/assets/."],
    ["Tables Supabase inexistantes au démarrage causant des erreurs silencieuses et un écran blanc sans message",
     "Wrapping systématique des appels Supabase dans try/catch. Mode démo avec données statiques (DEMO_PROPERTIES). Bannière d'alerte amber affichée si les tables sont absentes."],
    ["Politique RLS Supabase trop restrictive bloquant les SELECT depuis le frontend (erreur 403)",
     "Ajout de la politique 'Tout le monde voit les annonces actives' : CREATE POLICY ... FOR SELECT USING (status = 'active'). Séparation des politiques par rôle (public/user/owner/admin)."],
    ["Requêtes Supabase avec filtres conditionnels multiples (chaînage dynamique)",
     "Construction dynamique de la requête : let query = supabase.from('properties').select(...); if (city) query = query.eq('city', city); if (minPrice) query = query.gte('price', minPrice); etc."],
    ["Latence Fal.ai (~3-5s) causant une mauvaise expérience utilisateur sans feedback visuel",
     "Mise en place d'un loader Tailwind animé (animate-pulse + spinner SVG). Message de progression : 'Génération en cours (~5 secondes)...'. Bouton désactivé pendant la génération."],
  ]).map(([d,s],i)=>tRow([dc(d,3500,i%2===0?C.grey:C.white,false,C.orange), dc(s,5526,i%2===0?C.grey:C.white)]))
]),
...gap(1),

h2("4.5 Tests manuels — Critères d'acceptation validés"),
tbl([800,3000,2600,1126,1500],[
  tRow([hc("US",800,C.navy), hc("Scénario de test",3000,C.navy), hc("Résultat attendu",2600,C.navy), hc("Statut",1126,C.navy), hc("Sprint validé",1500,C.navy)]),
  ...([
    ["US-01","Inscription : email valide + mot de passe 8 car.","Email confirmation envoyé, compte créé dans Supabase","OK","Sprint 1"],
    ["US-02","OAuth Google → redirection /dashboard","Session active, profil créé dans table users","OK","Sprint 1"],
    ["US-03","Connexion email/password corrects","Accès dashboard, JWT dans localStorage","OK","Sprint 1"],
    ["US-06","Recherche : Casablanca + Vente + max 2 000 000 MAD","Filtrage correct, 'X biens trouvés' mis à jour","OK","Sprint 2"],
    ["US-07","Filtres : 3 ch. + ascenseur + parking","Seuls les biens satisfaisant TOUS les critères affichés","OK","Sprint 2"],
    ["US-08","Tri par prix croissant","1er résultat = annonce la moins chère","OK","Sprint 2"],
    ["US-14","Upload photo + style 'Oriental' → Générer","Rendu IA en ~4s, sauvegardé dans ai_renders","OK","Sprint 3"],
    ["US-15","Régénération avec style 'Scandinave'","Nouveau rendu différent, comparaison côte à côte","OK","Sprint 3"],
    ["US-16","Envoi message acheteur → vendeur","Message dans table messages, badge non lu dashboard","OK","Sprint 3"],
    ["US-17","Clic coeur annonce","Ajout favorites + toast 'Ajouté aux favoris'","OK","Sprint 2"],
    ["US-13","Marquer annonce comme Vendue","Annonce disparaît des résultats (status actif)","En attente","Sprint 4"],
    ["US-19","Admin valide annonce pending","status passe à 'active', visible dans recherches","En attente","Sprint 4"],
  ]).map(([us,sc,exp,st,spr],i)=>tRow([
    dc(us,800,i%2===0?C.grey:C.white,true,C.navy),
    dc(sc,3000,i%2===0?C.grey:C.white),
    dc(exp,2600,i%2===0?C.grey:C.white),
    dc(st,1126,i%2===0?C.grey:C.white,true,st==="OK"?C.teal:C.orange),
    dc(spr,1500,i%2===0?C.grey:C.white,false,C.mid),
  ]))
]),
...gap(1),

h2("4.6 Déploiement et coûts d'infrastructure"),
tbl([1800,2600,2400,2226],[
  tRow([hc("Service",1800,C.navy), hc("Rôle",2600,C.navy), hc("Plan utilisé",2400,C.navy), hc("Coût mensuel MVP",2226,C.navy)]),
  ...([
    ["Vercel","Hébergement frontend React + CDN mondial","Hobby (gratuit)","0 EUR/mois"],
    ["Render","Hébergement backend Node.js/Express","Free (750h/mois)","0 EUR/mois"],
    ["Supabase","PostgreSQL + Auth + Storage","Free (500MB, 50k req/j)","0 EUR/mois"],
    ["Cloudinary","Stockage images annonces + rendus IA","Free (25GB, 25k trans.)","0 EUR/mois"],
    ["Fal.ai","API génération IA décoration intérieure","Pay-as-you-go","~0.003 EUR/image"],
    ["OpenCage","Géocodage adresses marocaines","Free (2500 req/jour)","0 EUR/mois"],
    ["Posthog","Analytics événements produit","Free (1M events/mois)","0 EUR/mois"],
    ["Total MVP","Toute l'infrastructure complète","—","~0-5 EUR/mois (selon usage IA)"],
  ]).map(([s,r,p,c],i)=>{
    const costColor = c.includes("0-5")?C.orange : c.includes("0 EUR")?C.teal:C.blue;
    return tRow([dc(s,1800,i%2===0?C.grey:C.white,true,C.navy),dc(r,2600,i%2===0?C.grey:C.white),dc(p,2400,i%2===0?C.grey:C.white,false,C.mid),dc(c,2226,i%2===0?C.grey:C.white,true,costColor)]);
  })
]),
...gap(1),

h2("4.7 Conclusion et perspectives"),
para("Le projet DarNa a permis de développer en 4 semaines un MVP fonctionnel et présentable qui couvre l'ensemble des user stories Must Have et la majorité des Should Have du Product Backlog initial. L'application est déployée sur une infrastructure cloud managée à coût quasi nul."),
...gap(1),
para("Ce projet a mis en pratique l'ensemble des concepts enseignés dans le module Génie Logiciel EMSI :"),
bullet([bRun("Méthodologie Agile Scrum : "), run("découpage en sprints, artefacts (Product Backlog, Sprint Backlog, Incrément), événements Scrum (Planning, Daily, Review, Rétrospective).")]),
bullet([bRun("User stories et critères INVEST : "), run("20 user stories rédigées selon le format En tant que / Je veux / Afin de, avec critères d'acceptation Given/When/Then.")]),
bullet([bRun("Priorisation MoSCoW : "), run("hiérarchisation des fonctionnalités selon la valeur métier, la criticité et les contraintes de temps.")]),
bullet([bRun("Definition of Done : "), run("8 critères de qualité définis et respectés à chaque fin de sprint.")]),
bullet([bRun("Architecture full-stack découplée : "), run("SPA React + API REST Express + PostgreSQL Supabase + services cloud tiers.")]),
...gap(1),
para("Les évolutions envisagées pour la version 2 du projet DarNa incluent :"),
bullet("Intégration du moteur de recommandations Neo4j pour un système de suggestions basé sur le graphe d'interactions (Collaborative Filtering)."),
bullet("Migration vers Socket.io pour une messagerie temps réel (remplacement du polling toutes les 3 secondes)."),
bullet("Implémentation de PostGIS pour les recherches géospatiales avancées (biens dans un rayon de X km)."),
bullet("Développement d'une application mobile React Native pour étendre la plateforme aux utilisateurs mobiles."),
bullet("Mise en place d'une pipeline CI/CD complète avec tests automatisés (Jest + Supertest + Playwright E2E)."),
...gap(2),

// FIN
new Table({ width:{size:9026,type:WidthType.DXA}, columnWidths:[9026],
  rows:[tRow([new TableCell({ borders:bNone, shading:{fill:C.navy,type:ShadingType.CLEAR},
    margins:{top:280,bottom:280,left:400,right:400},
    children:[
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,80),children:[new TextRun({text:"DarNa — Fin du Rapport",bold:true,size:34,color:C.white,font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(0,40),children:[new TextRun({text:"React · Node.js · Supabase · Fal.ai · Agile Scrum",size:20,color:"93C5FD",font:"Arial"})]}),
      new Paragraph({alignment:AlignmentType.CENTER,spacing:sp(40,0),children:[new TextRun({text:"Module Génie Logiciel  |  EMSI 2024–2025",size:18,color:"BFDBFE",font:"Arial"})]}),
    ] })])] }),

    ]
  }]
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('/home/claude/Rapport_DarNa_EMSI.docx', b);
  console.log('Done!');
}).catch(e => { console.error(e); process.exit(1); });
  
