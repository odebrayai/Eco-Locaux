# ProspectMap - CRM de Prospection Commerciale

Application React + Supabase pour la prospection de commerces via Google Maps avec analyse IA (Gemini).

## 🚀 Import dans Bolt

### Étape 1 : Exécuter le SQL dans Supabase

1. Va dans ton projet Supabase
2. Clique sur **SQL Editor** (icône dans le menu gauche)
3. Copie tout le contenu du fichier `supabase-schema.sql`
4. Colle et clique sur **Run**

Cela va créer :
- Table `profiles` (utilisateurs/commerciaux)
- Table `commerces` (prospects)
- Table `rdv` (rendez-vous)
- Table `historique_actions` (logs)
- Toutes les policies RLS
- Les triggers automatiques

### Étape 2 : Créer un premier utilisateur admin

Dans Supabase :
1. Va dans **Authentication** > **Users**
2. Clique sur **Add user** > **Create new user**
3. Remplis email et mot de passe
4. Une fois créé, va dans **Table Editor** > **profiles**
5. Modifie le rôle de l'utilisateur en `admin`

### Étape 3 : Importer dans Bolt

Dans Bolt, colle ce message :

```
Importe ce projet React + Supabase. La connexion Supabase est déjà configurée.

Structure des fichiers à créer :

1. src/lib/supabase.ts - Client Supabase + types + helpers
2. src/lib/auth-context.tsx - Context d'authentification React
3. src/App.tsx - Routing principal
4. src/components/Layout.tsx - Layout avec sidebar
5. src/pages/LoginPage.tsx - Page de connexion
6. src/pages/SearchPage.tsx - Formulaire de recherche
7. src/pages/CommercesPage.tsx - Liste des commerces CRM
8. src/pages/AgendaPage.tsx - Agenda des RDV
9. src/pages/EquipePage.tsx - Gestion équipe (admin)
10. src/pages/ProfilePage.tsx - Mon profil

Dépendances : @supabase/supabase-js, react-router-dom, react-hot-toast, lucide-react

Design : Dark theme (#0a0a0f), accents cyan (#00f0ff) et violet (#7c3aed), font Space Grotesk
```

Puis colle le contenu de chaque fichier un par un.

### Étape 4 : Configurer les variables d'environnement

Dans Bolt, va dans les settings du projet et ajoute :
- `VITE_SUPABASE_URL` = ton URL Supabase
- `VITE_SUPABASE_ANON_KEY` = ta clé anon

## 📁 Structure des fichiers

```
src/
├── lib/
│   ├── supabase.ts      # Client + types + helpers
│   └── auth-context.tsx # Context auth React
├── components/
│   └── Layout.tsx       # Sidebar + navigation
├── pages/
│   ├── LoginPage.tsx    # Connexion
│   ├── SearchPage.tsx   # Recherche commerces
│   ├── CommercesPage.tsx # Liste CRM
│   ├── AgendaPage.tsx   # Rendez-vous
│   ├── EquipePage.tsx   # Gestion équipe
│   └── ProfilePage.tsx  # Mon profil
├── App.tsx              # Routing
├── main.tsx             # Point d'entrée
└── index.css            # Styles Tailwind
```

## 🔗 Webhook n8n

L'URL du webhook pour la recherche est configurée dans `SearchPage.tsx` :

```
https://n8n.srv1194290.hstgr.cloud/webhook/prospect-search
```

À modifier une fois le webhook créé dans n8n.

## 📋 Fonctionnalités

- ✅ Authentification (login, profils)
- ✅ Recherche de commerces via webhook n8n
- ✅ Liste des commerces avec filtres
- ✅ Détail commerce avec édition
- ✅ Export CSV
- ✅ Agenda des RDV
- ✅ Gestion équipe (admin)
- ✅ Temps réel (Supabase Realtime)
