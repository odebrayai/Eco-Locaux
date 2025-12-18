# Prompt Bolt - ProspectMap CRM

Copie et colle ce prompt dans Bolt :

---

Crée une application CRM de prospection commerciale appelée "ProspectMap" connectée à Supabase avec authentification.

## BASE DE DONNÉES SUPABASE

Crée ces tables dans Supabase :

### Table "profiles" (utilisateurs/commerciaux)
- id (uuid, primary key, references auth.users.id on delete cascade)
- created_at (timestamp with time zone, default now())
- email (text, not null)
- nom (text)
- prenom (text)
- role (text, default 'commercial') -- 'admin' ou 'commercial'
- telephone (text)
- avatar_url (text)
- actif (boolean, default true)

### Table "commerces"
- id (uuid, primary key, default gen_random_uuid())
- created_at (timestamp with time zone, default now())
- updated_at (timestamp with time zone, default now())
- nom (text, not null)
- adresse (text)
- telephone (text)
- email (text)
- site_web (text)
- place_id (text, unique)
- url_google_maps (text)
- note (decimal(2,1))
- nombre_avis (integer, default 0)
- panier_moyen (text)
- type_commerce (text)
- categorie (text)
- contact_nom (text)
- contact_poste (text)
- linkedin (text)
- facebook (text)
- instagram (text)
- enrichi_gemini (boolean, default false)
- scoring_ia (integer, default 0, check between 0 and 10)
- statut (text, default 'À contacter')
- commercial_id (uuid, foreign key references profiles.id)
- priorite (text, default 'Normale')
- ville_recherche (text)
- date_scraping (timestamp with time zone)
- notes_internes (text)

### Table "rdv"
- id (uuid, primary key, default gen_random_uuid())
- created_at (timestamp with time zone, default now())
- commerce_id (uuid, foreign key references commerces.id on delete cascade)
- commercial_id (uuid, foreign key references profiles.id)
- date_rdv (date, not null)
- heure (text, not null)
- duree (integer, default 30)
- statut (text, default 'En attente')
- type_rdv (text, default 'Prospection')
- lieu (text)
- notes (text)
- rappel_envoye (boolean, default false)

### Table "historique_actions"
- id (uuid, primary key, default gen_random_uuid())
- created_at (timestamp with time zone, default now())
- commerce_id (uuid, foreign key references commerces.id on delete cascade)
- commercial_id (uuid, foreign key references profiles.id)
- type_action (text, not null)
- description (text)

Active Row Level Security sur toutes les tables.

Policies RLS :
- profiles : les utilisateurs peuvent lire tous les profils, mais modifier seulement le leur
- commerces : lecture pour tous les users authentifiés, modification selon le rôle
- rdv : lecture/écriture pour le commercial assigné ou les admins
- historique_actions : lecture pour tous, insertion pour users authentifiés

Crée un trigger pour créer automatiquement un profil quand un user s'inscrit via auth.users.

## FRONTEND - PAGES ET FONCTIONNALITÉS

### Layout principal
- Sidebar gauche (collapsible sur mobile) avec :
  - Logo "⚡ ProspectMap" en haut
  - Navigation : Recherche, Commerces, Agenda, Équipe (admin only)
  - Profil utilisateur en bas avec menu dropdown (Mon profil, Déconnexion)
- Header avec titre de la page actuelle et boutons d'action contextuels

### Page 0 : AUTHENTIFICATION

#### Route "/login"
- Formulaire de connexion :
  - Email
  - Mot de passe
  - Bouton "Se connecter"
  - Lien "Mot de passe oublié ?"
- Design centré, card sur fond sombre

#### Route "/register" (accessible seulement par les admins)
- Formulaire d'inscription d'un nouveau commercial :
  - Email
  - Mot de passe
  - Nom
  - Prénom
  - Téléphone
  - Rôle (dropdown : Commercial / Admin)
  - Bouton "Créer le compte"

#### Protection des routes
- Toutes les routes sauf /login nécessitent une authentification
- Redirection vers /login si non connecté
- Stockage du user dans un context React

### Page 1 : RECHERCHE (route "/", page d'accueil après login)

Formulaire de recherche de commerces :

- Input "Ville ou Code Postal"
  - Placeholder: "Ex: Paris, 75001, Lyon..."
  - Icône 📍 à gauche
  
- Sélection du type de commerce (grille 2x3 de boutons toggle) :
  - Boulangerie 🥖
  - Restaurant 🍽️
  - Pizzeria 🍕
  - Poissonnerie 🐟
  - Pressing 👔
  - Boucherie 🥩
  
- Slider "Nombre de résultats"
  - Min: 5, Max: 50, Default: 10
  - Afficher la valeur dans un badge
  
- Bouton "🚀 Lancer la Recherche"
  - État loading pendant la requête
  - Désactivé si ville ou type non rempli

Au submit :
```javascript
POST https://n8n.srv1194290.hstgr.cloud/webhook/prospect-search
Headers: { "Content-Type": "application/json" }
Body: {
  "ville": "valeur input",
  "type_etablissement": "type sélectionné",
  "nombre_resultats": valeur_slider,
  "commercial_id": "uuid du user connecté"
}
```

Afficher un toast :
- Succès : "✅ Recherche lancée ! Les résultats arriveront dans quelques instants."
- Erreur : "❌ Erreur lors de la recherche. Réessayez."

Section "Recherches récentes" en dessous :
- Liste des 5 dernières recherches (depuis historique_actions où type = 'recherche')
- Clic pour relancer la même recherche

### Page 2 : COMMERCES (route "/commerces")

#### Header de page
- Titre "Mes Commerces" avec badge compteur
- Bouton "📥 Exporter CSV" à droite

#### Barre de filtres
- Input recherche texte (cherche dans nom, adresse, email)
- Dropdown "Type" : Tous, Boulangerie, Restaurant, Pizzeria, Poissonnerie, Pressing, Boucherie
- Dropdown "Statut" : Tous, À contacter, En cours, RDV planifié, Converti, Perdu
- Dropdown "Commercial" : Tous + liste des commerciaux (admin only, sinon filtré sur le user)
- Dropdown "Priorité" : Toutes, Basse, Normale, Haute
- Bouton "Réinitialiser les filtres"

#### Grille de cartes commerces (responsive : 1 col mobile, 2 tablet, 3 desktop)

Chaque carte affiche :
- Header :
  - Icône du type (🥖🍽️🍕🐟👔🥩)
  - Badge Score IA coloré (vert >= 8, orange >= 5, rouge < 5)
  - Menu "..." avec actions (Modifier, Supprimer, Voir historique)
- Body :
  - Nom du commerce (gras, tronqué si trop long)
  - Adresse (texte gris, 2 lignes max)
  - Note Google : ⭐ 4.5 (234 avis)
- Footer :
  - Badge statut coloré :
    - "À contacter" → bleu/cyan
    - "En cours" → jaune
    - "RDV planifié" → violet
    - "Converti" → vert
    - "Perdu" → gris
  - Badge priorité si Haute (🔴)
  - Avatar du commercial assigné (petit cercle)
- Actions (icônes) :
  - 📞 Appeler (href tel:)
  - ✉️ Email (href mailto:)
  - 🗺️ Google Maps (target blank)
  - 🌐 Site web (target blank, disabled si pas de site)

Au clic sur la carte → ouvre la modal détail

#### Modal détail commerce

Onglets : Informations | Historique | RDV

**Onglet Informations :**
- Toutes les infos du commerce en mode éditable
- Section "Contact" : nom, poste, téléphone, email
- Section "Réseaux sociaux" : LinkedIn, Facebook, Instagram (liens cliquables)
- Section "Prospection" :
  - Dropdown Statut
  - Dropdown Priorité
  - Dropdown Commercial assigné
  - Textarea Notes internes
- Bouton "💾 Sauvegarder"

**Onglet Historique :**
- Timeline des actions sur ce commerce
- Filtrer par type d'action

**Onglet RDV :**
- Liste des RDV liés à ce commerce
- Bouton "➕ Nouveau RDV"

Footer modal :
- Bouton "🗑️ Supprimer" (avec confirmation)
- Bouton "Fermer"

#### Export CSV
Au clic sur "Exporter CSV" :
- Exporte les commerces filtrés (pas tous)
- Colonnes : Nom, Adresse, Téléphone, Email, Type, Statut, Note, Commercial, Date création
- Nom du fichier : commerces_export_YYYY-MM-DD.csv

### Page 3 : AGENDA (route "/agenda")

#### Header
- Titre "Agenda des Rendez-vous"
- Toggle vue : "Liste" | "Calendrier"
- Bouton "➕ Nouveau RDV"

#### Stats cards (4 colonnes)
- Total RDV (ce mois) - icône 📅
- Confirmés - vert ✅
- En attente - orange ⏳
- Annulés - rouge ❌

#### Filtres
- Date picker range (du / au)
- Dropdown Commercial (admin: tous, commercial: seulement lui)
- Dropdown Statut : Tous, En attente, Confirmé, Annulé, Terminé

#### Vue Liste (default)
Grouper les RDV par date :
- Header de groupe : "Lundi 20 janvier 2025" (format français)
- Cartes RDV :
  - Colonne gauche : Heure (gros) + durée en dessous
  - Colonne centrale :
    - Nom du commerce (cliquable → ouvre modal commerce)
    - Type de RDV + Lieu
    - Notes (tronquées)
  - Colonne droite :
    - Badge statut
    - Avatar commercial
    - Menu actions (Modifier, Annuler, Supprimer)

#### Vue Calendrier
- Calendrier mensuel
- Les jours avec RDV ont un indicateur (point coloré)
- Au clic sur un jour → affiche les RDV du jour dans un panel latéral

#### Modal création/édition RDV
- Dropdown "Commerce" (recherche autocomplete dans les commerces)
- Date picker "Date du RDV"
- Time picker "Heure"
- Input "Durée" (minutes, default 30)
- Dropdown "Type" : Prospection, Suivi, Signature, Autre
- Input "Lieu" (optionnel)
- Textarea "Notes"
- Dropdown "Statut" : En attente, Confirmé
- Boutons : Annuler | Créer/Sauvegarder

#### FAB Button
- Bouton "+" flottant en bas à droite
- Au clic → ouvre la modal création RDV

### Page 4 : ÉQUIPE (route "/equipe", admin only)

#### Header
- Titre "Gestion de l'équipe"
- Bouton "➕ Ajouter un commercial"

#### Liste des commerciaux
Table avec colonnes :
- Avatar + Nom Prénom
- Email
- Téléphone
- Rôle (badge Admin ou Commercial)
- Statut (badge Actif vert ou Inactif gris)
- Stats : X commerces assignés, Y RDV ce mois
- Actions : Modifier, Désactiver/Activer

#### Modal ajout/édition commercial
- Utilise Supabase Auth pour créer le user
- Formulaire : Email, Mot de passe (création only), Nom, Prénom, Téléphone, Rôle
- Boutons : Annuler | Créer/Sauvegarder

### Page 5 : MON PROFIL (route "/profil")

- Avatar (avec upload vers Supabase Storage)
- Formulaire édition : Nom, Prénom, Téléphone
- Section "Changer mot de passe"
- Bouton "💾 Sauvegarder"
- Stats personnelles : Mes commerces, Mes RDV ce mois, Taux de conversion

## STYLE ET UX

### Thème
- Mode sombre par défaut
- Couleurs :
  - Background : #0a0a0f
  - Cards : #1a1a25
  - Borders : rgba(255,255,255,0.1)
  - Text primary : #ffffff
  - Text secondary : #a0a0b0
  - Accent primary : #00f0ff (cyan)
  - Accent secondary : #7c3aed (violet)
  - Success : #10b981
  - Warning : #f59e0b
  - Error : #ef4444

### Typography
- Font : Space Grotesk (Google Fonts)
- Headings : bold
- Body : regular

### Composants
- Utilise shadcn/ui pour les composants (Dialog, Dropdown, Toast, etc.)
- Tailwind CSS pour le styling
- Animations :
  - Hover sur cartes : légère élévation + glow cyan
  - Transitions douces (200ms)
  - Loading skeletons pendant les chargements

### Responsive
- Mobile first
- Sidebar devient bottom navigation sur mobile
- Grilles adaptatives
- Modals full screen sur mobile

### Toasts/Notifications
- Position : top-right
- Auto-dismiss après 5s
- Types : success (vert), error (rouge), info (cyan), warning (orange)

## FONCTIONNALITÉS TECHNIQUES

### État global
- Utilise React Context pour :
  - User authentifié
  - Thème (si tu ajoutes un toggle light/dark plus tard)

### Temps réel
- Active Supabase Realtime sur la table "commerces"
- Quand un nouveau commerce est ajouté (par n8n), il apparaît automatiquement dans la liste

### Optimisations
- Pagination des commerces (20 par page)
- Debounce sur la recherche texte (300ms)
- Lazy loading des images

### Gestion d'erreurs
- Try/catch sur tous les appels Supabase
- Affichage de messages d'erreur clairs
- État vide avec illustration si pas de données

---
