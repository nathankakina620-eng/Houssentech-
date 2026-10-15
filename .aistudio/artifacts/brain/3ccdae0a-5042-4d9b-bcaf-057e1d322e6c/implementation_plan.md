# Plan de Déploiement et Mise en Production — HOUSSETECH

Plan opérationnel complet pour déployer l'application web et mobile HOUSSETECH sur une infrastructure Cloud haute performance (Vercel / Netlify), connecter le nom de domaine personnalisé `houssetech.com` et distribuer l'application PWA installable aux clients de Kinshasa et d'Angola.

---

### Synthèse des Choix Utilisateur & Décisions Clés

> [!IMPORTANT]
> Décisions validées lors de la phase de clarification :
> - **Plateforme d'hébergement** : Hébergement Cloud moderne haute disponibilité (Vercel ou Netlify) avec CDN mondial, déploiements continus (CI/CD) et SSL HTTPS automatisé.
> - **Nom de domaine** : Association d'un nom de domaine officiel personnalisé `houssetech.com` avec redirection DNS sécurisée.
> - **Distribution & Installation** : Application Web Progressive (PWA) installable en un clic sur smartphones Android, iOS et ordinateurs sans passer par les commissions des stores.

---

### 1. Vue d'Ensemble & Objectifs de Déploiement

- **Objectif Principal** : Rendre la boutique en ligne et l'Angle Client HOUSSETECH accessibles au grand public 24h/24 sous une adresse web professionnelle (`https://houssetech.com`) avec une vitesse de chargement instantanée.
- **Public Cible** : 
  - Clients et motards à Kinshasa consultant le catalogue, commandant des pièces, suivant leurs colis de convois du samedi et payant leur acompte de 70%.
  - Gérant et administrateur (`nathankakina620@gmail.com`) supervisant les commandes, validant les acomptes, répondant aux messages avec photos et administrant les stocks depuis mobile ou PC.
- **Bénéfices Clés** : Zéro coût d'infrastructure serveur lourd, disponibilité 99.99%, certificats SSL gratuits automatiques et expérience PWA plein écran identique à une application native.

---

### 2. Expérience Utilisateur & Parcours Post-Déploiement

1. **Accès & Premier Contact** :
   - L'utilisateur tape `houssetech.com` ou clique sur un lien WhatsApp/SMS partagé par l'entreprise.
   - Chargement immédiat (assets pré-mis en cache grâce au Service Worker PWA).
2. **Installation PWA en 1 Clic** :
   - Une invite discrète ou le bouton dans le tiroir latéral propose : *"Installer l'application HOUSSETECH sur votre écran d'accueil"*.
   - Une fois installée, l'icône rouge HOUSSETECH apparaît aux côtés des autres applications du smartphone.
3. **Espace Client & Suivi Autonome** :
   - Le client retrouve instantanément ses articles, la progression en 5 étapes de son colis, la messagerie privée avec photos et la FAQ dynamique sur les délais (départs chaque samedi matin) et les acomptes 70%.
4. **Panneau d'Administration Sécurisé** :
   - Accès protégé par mot de passe administrateur et validation du compte certifié, permettant une gestion en temps réel des commandes et des stocks.

---

### 3. Architecture Technique & Schéma de Déploiement

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VISITEUR / CLIENT MOTO                          │
│               Navigateur Web Mobile / PC / Application PWA             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Requête HTTPS
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 FOURNISSEUR DNS (ex: Cloudflare / Registrar)           │
│                 houssetech.com ──► CNAME / ALIAS Vercel                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EDGE CDN & HÉBERGEMENT (Vercel / Netlify)            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Bundle Statique Optimisé (dist/) : React 19 + Vite + Tailwind    │  │
│  │ Service Worker PWA & Manifeste (Offline Cache, Icônes HD)        │  │
│  │ Headers de Sécurité (CSP, HSTS, X-Content-Type-Options)          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             STOCKAGE LOCAL & SYNCHRONISATION MULTI-SUPPORTS            │
│  - Persistance LocalStorage réactive des commandes & historiques      │
│  - Passerelle messagerie & photos base64 vers l'Admin                  │
│  - Intégration WhatsApp direct (+243 897 662 089)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Étapes Chronologiques de Mise en Œuvre

#### Étape 1 : Préparation & Validation du Bundle de Production
- Exécuter la compilation de production (`npm run build`) pour générer le dossier optimisé `dist/`.
- Vérifier que les assets PWA (`manifest.webmanifest`, `sw.js`, icônes `pwa-192x192.png` et `pwa-512x512.png`) sont générés et prêts pour le cache hors-ligne.
- Valider l'absence totale d'erreurs TypeScript via `npm run lint`.

#### Étape 2 : Création du Dépôt & Connexion à l'Hébergeur Cloud
- Initialiser le dépôt Git et pousser le code sur GitHub (dépôt privé ou public).
- Se connecter à **Vercel** (vercel.com) ou **Netlify** (netlify.com).
- Sélectionner le dépôt : l'hébergeur détecte automatiquement le framework **Vite** :
  - *Build Command* : `npm run build`
  - *Output Directory* : `dist`
  - *Node Version* : Node.js 20+

#### Étape 3 : Configuration du Routage SPA (Single Page Application)
- Créer le fichier de configuration de réécriture pour éviter les erreurs 404 lors du rechargement des pages profondes :
  - Sur Vercel : `vercel.json` avec réécriture vers `/index.html`.
  - Sur Netlify : `_redirects` avec `/* /index.html 200`.

#### Étape 4 : Liaison du Nom de Domaine `houssetech.com`
- Dans les paramètres Vercel/Netlify > *Domains* : ajouter `houssetech.com` et `www.houssetech.com`.
- Chez le registraire du domaine (ex: Namecheap, GoDaddy, Hostinger ou OVH) :
  - Ajouter un enregistrement **A Record** pointant vers `76.76.21.21` (IP Vercel).
  - Ajouter un enregistrement **CNAME** pour `www` pointant vers `cname.vercel-dns.com`.
- Activation automatique du certificat SSL/TLS gratuit Let's Encrypt en moins de 15 minutes.

#### Étape 5 : Tests Post-Déploiement & Audit Final
- Vérifier l'installation de la PWA sur smartphone Android (Chrome) et iPhone (Safari "Ajouter sur l'écran d'accueil").
- Tester la commande d'une pièce avec calcul de l'acompte 70% et affichage du convoi du samedi.
- Tester l'envoi de photos dans la messagerie client et la réception côté administrateur.
- Vérifier les horaires officiels de travail affichés en haut de la conversation (Lun-Ven 8h-16h30, Sam 8h-14h).
- Valider le bon fonctionnement de la FAQ dynamique avec réponses instantanées.
