# 🛡️ Guide de Configuration - Gestion Administrative des Utilisateurs

## Résumé des changements

Cette fonctionnalité permet aux administrateurs de gérer les comptes utilisateurs (activation, suspension, bannissement) pour assurer la conformité et la sécurité de la plateforme.

## 📊 Fichiers créés/modifiés

### Côté Serveur (Node.js + Express)

#### 1. **server/middleware/adminAuth.js** (NOUVEAU)
- Middleware qui vérifie que l'utilisateur est administrateur
- Requiert une colonne `role` dans la table `users`

#### 2. **server/routes/admin.js** (NOUVEAU)
- Route `GET /api/admin/users` - Récupère tous les utilisateurs
- Route `GET /api/admin/users/:id` - Détails d'un utilisateur
- Route `PATCH /api/admin/users/:id/status` - Change le statut (active/suspended/banned)
- Route `PATCH /api/admin/users/:id/role` - Modifie le rôle (user/admin)
- Route `DELETE /api/admin/users/:id` - Supprime un utilisateur

#### 3. **server/middleware/auth.js** (MODIFIÉ)
- Ajout de vérification du statut de l'utilisateur
- Les utilisateurs suspendus ou bannis ne peuvent pas accéder à la plateforme

#### 4. **server/index.js** (MODIFIÉ)
- Ajout de la route admin: `app.use('/api/admin', require('./routes/admin'))`

### Côté Client (React)

#### 5. **client/src/hooks/useAuth.jsx** (MODIFIÉ)
- Ajout des fonctions d'administration:
  - `getAllUsers()` - Récupère tous les utilisateurs
  - `suspendUser(userId)` - Suspend un utilisateur
  - `activateUser(userId)` - Active un utilisateur
  - `banUser(userId)` - Bannit un utilisateur
  - `updateUserRole(userId, role)` - Change le rôle
  - `deleteUser(userId)` - Supprime un utilisateur

#### 6. **client/src/pages/AdminPage.jsx** (NOUVEAU)
- Interface d'administration avec tableau des utilisateurs
- Actions: suspension, activation, bannissement, suppression
- Gestion des rôles (user/admin)
- Utilise Tailwind CSS pour le design
- Icônes Lucide React

## 🗄️ Configuration de la base de données Supabase

### ⚠️ ÉTAPE 1: Créer la structure de base de données

**IMPORTANT:** Avant toute chose, exécutez le script `database_init.sql` dans Supabase:

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Cliquez **"New Query"**
3. Copiez-collez le contenu de `database_init.sql`
4. Cliquez **"Run"** ✅

Ce script crée:
- Table `users` - Profils utilisateurs
- Table `annonces` - Propriétés immobilières
- Table `admin_audit_logs` - Logs des actions admin
- Colonnes `role` et `status`
- Politiques Row Level Security (RLS)
- Triggers pour mise à jour automatique

### Table `users` - Colonnes créées

## 🚀 Configuration

### 1. Variables d'environnement requises

**server/.env**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
CLIENT_URL=http://localhost:5173
PORT=3001
```

**client/.env**
```
VITE_API_URL=http://localhost:3001/api
```

### 2. Installation des dépendances

Les dépendances requises sont déjà dans `package.json`:

**Côté serveur**:
- express
- @supabase/supabase-js
- cors
- helmet
- morgan

**Côté client**:
- axios (pour les requêtes HTTP)
- lucide-react (pour les icônes)
- react-hot-toast (pour les notifications)

## 📝 Comment utiliser

### 1. Créer un administrateur

Connectez-vous à Supabase et modifiez directement la table `users`:
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### 2. Accéder à l'interface d'administration

Ajoutez la route à votre `App.jsx`:

```jsx
import AdminPage from './pages/AdminPage'

// Dans vos routes:
<Route path="/admin" element={<AdminPage />} />
```

### 3. Actions disponibles

#### Suspendre un utilisateur
```javascript
const { suspendUser } = useAuth()
await suspendUser(userId) // Statut: 'suspended'
```

#### Activer un utilisateur
```javascript
const { activateUser } = useAuth()
await activateUser(userId) // Statut: 'active'
```

#### Bannir un utilisateur
```javascript
const { banUser } = useAuth()
await banUser(userId) // Statut: 'banned'
```

#### Modifier le rôle
```javascript
const { updateUserRole } = useAuth()
await updateUserRole(userId, 'admin') // ou 'user'
```

#### Supprimer un utilisateur
```javascript
const { deleteUser } = useAuth()
await deleteUser(userId)
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. ✅ **Authentification JWT** - Toutes les routes admin requièrent un token valide
2. ✅ **Vérification du rôle** - Seuls les admins peuvent gérer les utilisateurs
3. ✅ **Protection contre l'auto-modification** - Les admins ne peuvent pas modifier leur propre statut
4. ✅ **Vérification du statut** - Les utilisateurs suspendus/bannis ne peuvent pas accéder à la plateforme
5. ✅ **CORS configuré** - Requêtes limitées à `CLIENT_URL`
6. ✅ **Helmet.js** - Headers de sécurité activés
7. ✅ **Rate limiting** - Limité à 10 requêtes/minute sur les routes auth

## 🐛 Dépannage

### Erreur: "Accès réservé aux administrateurs"
- Vérifiez que l'utilisateur a `role = 'admin'` dans la table `users`
- Vérifiez que le token est valide

### Erreur: "Vous ne pouvez pas modifier votre propre statut"
- Les admins ne peuvent pas modifier leur propre statut pour éviter le verrouillage accidentel

### Utilisateurs suspendus peuvent se connecter
- Vérifiez que la vérification du statut est active dans `server/middleware/auth.js`
- Assurez-vous que la colonne `status` existe dans la table `users`

## 📋 Checklist de déploiement

- [ ] Colonne `role` et `status` ajoutées à la table `users`
- [ ] Politiques RLS configurées
- [ ] Au moins un utilisateur a `role = 'admin'`
- [ ] Variables d'environnement configurées côté serveur et client
- [ ] Route `/admin` ajoutée à `App.jsx`
- [ ] Serveur et client redémarrés
- [ ] Test de suspension/activation d'un utilisateur

## 🎯 Prochaines étapes possibles

- Ajouter un système de logs pour auditer les actions admin
- Implémenter l'authentification 2FA pour les administrateurs
- Ajouter un système de permissions granulaires
- Implémenter des avertissements avant suspension/bannissement
- Ajouter un système de notifications pour les utilisateurs suspendus
