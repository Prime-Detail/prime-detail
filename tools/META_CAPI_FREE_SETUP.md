# Meta CAPI gratuit (Cloudflare Worker) – Setup rapide

Objectif : envoyer les mêmes conversions à Meta côté serveur (CAPI) en plus du Pixel navigateur.

## 1) Ce qui est déjà en place dans le site

Le front envoie maintenant un payload CAPI optionnel vers `window.__META_CAPI_ENDPOINT__`.

Variable publique à définir pour Astro :

- `PUBLIC_META_CAPI_ENDPOINT`
  
- Exemple : `https://prime-detail-meta-capi.<ton-subdomain>.workers.dev`

## 2) Créer le Worker (gratuit)

1. Créer un compte Cloudflare (plan gratuit)
2. Créer un Worker
3. Coller le code de `tools/meta-capi-cloudflare-worker.js`
4. Ajouter les secrets Worker :
   - `META_PIXEL_ID` = `1189334119528421`
   - `META_ACCESS_TOKEN` = token CAPI Meta
   - `CORS_ORIGIN` = URL de ton site (ex : `https://prime-detail.github.io`)
   - `META_TEST_EVENT_CODE` = optionnel (utile pendant les tests)

Commandes utiles avec Wrangler :

```bash
wrangler secret put META_PIXEL_ID
wrangler secret put META_ACCESS_TOKEN
wrangler secret put CORS_ORIGIN
wrangler secret put META_TEST_EVENT_CODE
wrangler deploy
```

## 3) Ajouter la variable front

Dans ton environnement build Astro, définir :

- `PUBLIC_META_CAPI_ENDPOINT=https://...workers.dev`

## 4) Vérifier la déduplication

Le front envoie :

Meta déduplique automatiquement les doublons.
Meta déduplique automatiquement les doublons.

## 5) Test en 2 minutes

1. Ouvrir Meta Events Manager > Test Events
2. Ouvrir le site sans bloqueur pub
3. Cliquer Appeler / WhatsApp / envoyer formulaire
4. Vérifier réception browser + server
5. Vérifier qu'il n'y a pas de double conversion en reporting

Test HTTP direct du Worker :

```bash
curl -X POST "https://<ton-worker>.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
    "event_name":"contact_whatsapp_clicked",
    "standard_event_name":"Contact",
    "event_id":"manual_test_001",
    "event_source_url":"https://prime-detail.github.io/prime-detail/",
    "event_time": 1730000000,
    "custom_data": {"source":"manual_test"}
  }'
```

## 6) Variables côté Astro

Dans l'environnement de build Astro, définir :

- `PUBLIC_META_CAPI_ENDPOINT=https://<ton-worker>.workers.dev`

Sans cette variable, le site continue à envoyer le Pixel browser uniquement (fallback propre).
