# 🛡️ Guide Complet - Gestion Administrative des Utilisateurs

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Installation et configuration](#installation-et-configuration)
3. [Structure de la base de données](#structure-de-la-base-de-données)
4. [API d'administration](#api-dadministration)
5. [Interface d'administration](#interface-dadministration)
6. [Sécurité](#sécurité)
7. [Utilisation](#utilisation)
8. [Dépannage](#dépannage)

---

## Vue d'ensemble

Cette fonctionnalité permet aux administrateurs de:
- ✅ **Suspendre** les utilisateurs temporairement
- ✅ **Activer** les utilisateurs bloqués
- ✅ **Bannir** les utilisateurs définitivement
- ✅ **Gérer les rôles** (user/admin)
- ✅ **Supprimer les comptes** (irréversible)
- ✅ **Auditer les actions** dans les logs

### Responsabilités de l'administrateur
- Conformité et respect des conditions d'utilisation
- Sécurité de la plateforme
- Gestion des utilisateurs non-conformes
- Modération et contrôle des contenus

---

## Installation et configuration

### ÉTAPE 1: Configuration de la base de données

#### 1.1 Créer la structure (OBLIGATOIRE)

**Exécutez `database_init.sql` dans Supabase:**

1. Allez dans [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** → **"New Query"**
4. Copiez le contenu de `database_init.sql`
5. Cliquez **"Run"** ✅

Ce script crée:
- Table `users` avec colonnes `role` et `status`
- Table `annonces` pour les propriétés
- Table `admin_audit_logs` pour les logs
- Politiques Row Level Security (RLS)
- Triggers et fonctions
- Trigger d'auto-création de profil à l'inscription

#### 1.2 Vérifier l'installation

```sql
-- Voir les tables créées
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Voir les colonnes de users
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';

-- Voir les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### ÉTAPE 2: Variables d'environnement

#### Serveur - `server/.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key
CLIENT_URL=http://localhost:5173
PORT=3001
```

#### Client - `client/.env`
```env
VITE_API_URL=http://localhost:3001/api
```

### ÉTAPE 3: Démarrer le serveur

```terminal
cd server
npm install
npx nodemon index.js
```

### ÉTAPE 4: Intégrer la route admin dans le client

Modifiez `client/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AdminPage from './pages/AdminPage'

function ProtectedAdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return <div>Chargement...</div>
    if (!user) return <Navigate to="/auth" replace />

    return children
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* ... autres routes ... */}
                    <Route path="/admin" element={
                        <ProtectedAdminRoute>
                            <AdminPage />
                        </ProtectedAdminRoute>
                    } />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
```

---

## Structure de la base de données

### Table `users`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Référence à auth.users(id) |
| `email` | VARCHAR | Email unique |
| `full_name` | VARCHAR | Nom complet |
| `avatar_url` | TEXT | URL de l'avatar |
| `role` | VARCHAR | `'user'` ou `'admin'` |
| `status` | VARCHAR | `'active'` ‖ `'suspended'` ‖ `'banned'` |
| `created_at` | TIMESTAMP | Date d'inscription |
| `updated_at` | TIMESTAMP | Mise à jour auto |

### Table `annonces`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `user_id` | UUID | Propriétaire de l'annonce |
| `title` | VARCHAR | Titre |
| `description` | TEXT | Description |
| `price` | DECIMAL | Prix |
| `location` | VARCHAR | Localisation |
| `status` | VARCHAR | `'active'` ou `'archived'` |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Mise à jour auto |

### Table `admin_audit_logs`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `admin_id` | UUID | Admin qui a effectué l'action |
| `action` | VARCHAR | `'suspend'`, `'activate'`, etc |
| `target_user_id` | UUID | Utilisateur cible |
| `details` | JSONB | Détails supplémentaires |
| `created_at` | TIMESTAMP | Date de l'action |

---

## API d'administration

### Routes disponibles

#### 1. Récupérer tous les utilisateurs
```
GET /api/admin/users
Authorization: Bearer {token}
```

**Réponse:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "status": "active",
    "created_at": "2026-05-01T10:00:00Z"
  }
]
```

#### 2. Obtenir les détails d'un utilisateur
```
GET /api/admin/users/:userId
Authorization: Bearer {token}
```

#### 3. Changer le statut d'un utilisateur
```
PATCH /api/admin/users/:userId/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "suspended" | "active" | "banned"
}
```

**Réponse:**
```json
{
  "message": "Utilisateur suspendu avec succès",
  "data": { /* utilisateur mis à jour */ }
}
```

#### 4. Modifier le rôle d'un utilisateur
```
PATCH /api/admin/users/:userId/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "user" | "admin"
}
```

#### 5. Supprimer un utilisateur
```
DELETE /api/admin/users/:userId
Authorization: Bearer {token}
```

⚠️ **Attention:** Cette action est irréversible!

---

## Interface d'administration

### Page d'administration: `/admin`

La page affiche un tableau avec:
- **Email** de l'utilisateur
- **Nom** complet
- **Statut** (badge coloré)
- **Rôle** (sélecteur)
- **Date d'inscription**
- **Actions** (boutons):
  - 🟡 **Suspendre** - Bloquer temporairement
  - 🟢 **Activer** - Réactiver un utilisateur
  - 🔴 **Bannir** - Bloquer définitivement
  - 🗑️ **Supprimer** - Suppression irréversible

### Modifications possibles en direct:
1. Sélecteur de **Rôle** - Changer entre `user` et `admin`
2. Boutons d'**Actions** - Suspendre/Activer/Bannir/Supprimer

### Légende des statuts

| Statut | Couleur | Signification |
|--------|---------|---------------|
| Active | 🟢 Vert | Utilisateur normal, accès autorisé |
| Suspended | 🟡 Jaune | Accès temporairement bloqué |
| Banned | 🔴 Rouge | Accès définitivement bloqué |

---

## Sécurité

### Mesures implémentées

#### 1. Authentification JWT
- ✅ Tous les endpoints admin requièrent un token JWT valide
- ✅ Token stocké dans Supabase Auth

#### 2. Vérification du rôle
- ✅ Seuls les utilisateurs avec `role = 'admin'` peuvent accéder
- ✅ Vérifié côté serveur à chaque requête

#### 3. Protection des données
- ✅ Row Level Security (RLS) activé
- ✅ Les utilisateurs ne voient que leurs données
- ✅ Les admins voient toutes les données

#### 4. Vérification du statut
- ✅ Les utilisateurs suspendus/bannis ne peuvent pas se connecter
- ✅ Vérifié dans le middleware `requireAuth`

#### 5. Protection contre l'auto-modification
- ✅ Les admins ne peuvent pas modifier leur propre statut
- ✅ Les admins ne peuvent pas modifier leur propre rôle
- ✅ Prévient les blocages accidentels

#### 6. Sécurité HTTP
- ✅ Helmet.js - Headers de sécurité
- ✅ CORS - Requêtes limitées au CLIENT_URL
- ✅ Rate limiting - 10 requêtes/minute sur /api/auth

---

## Utilisation

### Comment créer un administrateur

#### Méthode 1: Via Supabase Dashboard

1. Allez dans **SQL Editor**
2. Exécutez:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

#### Méthode 2: Voir qui est admin

```sql
SELECT id, email, full_name FROM users WHERE role = 'admin';
```

### Actions courantes

#### Suspendre un utilisateur
```javascript
const { suspendUser } = useAuth()
await suspendUser(userId)
```

#### Activer un utilisateur
```javascript
const { activateUser } = useAuth()
await activateUser(userId)
```

#### Bannir un utilisateur
```javascript
const { banUser } = useAuth()
await banUser(userId)
```

#### Promouvoir en administrateur
```javascript
const { updateUserRole } = useAuth()
await updateUserRole(userId, 'admin')
```

#### Rétrograder un administrateur
```javascript
const { updateUserRole } = useAuth()
await updateUserRole(userId, 'user')
```

#### Supprimer un utilisateur
```javascript
const { deleteUser } = useAuth()
await deleteUser(userId)
```

---

## Dépannage

### ❌ Erreur: "relation 'users' does not exist"

**Solution:** Exécutez d'abord `database_init.sql`

### ❌ Erreur: "Accès réservé aux administrateurs"

**Solution:**
1. Vérifiez que vous êtes connecté
2. Vérifiez que votre compte a `role = 'admin'`:
```sql
SELECT role FROM users WHERE email = 'your-email@example.com';
```

### ❌ Les utilisateurs suspendus peuvent se connecter

**Solution:** Vérifiez que le middleware `requireAuth` vérifie le statut:
```javascript
// server/middleware/auth.js doit contenir la vérification du status
```

### ❌ Impossible d'accéder à `/admin`

**Solution:**
1. Vérifiez que la route est ajoutée à `App.jsx`
2. Vérifiez que vous êtes authentifié
3. Vérifiez que vous avez le rôle `admin`

### ❌ "Vous ne pouvez pas modifier votre propre statut"

**Solution:** C'est normal! Les admins ne peuvent pas se bloquer eux-mêmes.
Pour changer votre statut, demandez à un autre admin.

---

## 📊 Fichiers modifiés/créés

| Fichier | Type | Description |
|---------|------|-------------|
| `database_init.sql` | 📄 SQL | Initialisation BD (OBLIGATOIRE) |
| `database_admin_setup.sql` | 📄 SQL | Queries utiles (optionnel) |
| `server/middleware/adminAuth.js` | ✨ NOUVEAU | Middleware vérification admin |
| `server/routes/admin.js` | ✨ NOUVEAU | Routes API admin |
| `server/middleware/auth.js` | 🔧 MODIFIÉ | Ajout vérification statut |
| `server/index.js` | 🔧 MODIFIÉ | Ajout route admin |
| `client/src/hooks/useAuth.jsx` | 🔧 MODIFIÉ | Ajout fonctions admin |
| `client/src/pages/AdminPage.jsx` | ✨ NOUVEAU | Interface admin |
| `ADMIN_SETUP.md` | 📚 NOUVEAU | Ce fichier |

---

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Express.js](https://expressjs.com/)
- [React Router](https://reactrouter.com/)

---

**Dernière mise à jour:** May 5, 2026  
**Version:** 1.0
