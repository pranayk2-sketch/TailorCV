# Supabase Edge Functions

## fetch-description

Fetches job description from an internship's URL and stores it in `internship_descriptions`.

**Deploy:**
```bash
supabase functions deploy fetch-description
```

**Invoke:** The frontend uses `supabase.functions.invoke('fetch-description', { body: { internshipId } })`.

## fetch-descriptions-bulk

Fetches descriptions for up to 20 internships.

**Deploy:**
```bash
supabase functions deploy fetch-descriptions-bulk
```

## Using Edge Functions (no local API server)

Set in `.env`:
```
VITE_USE_DESCRIPTION_EDGE_FUNCTIONS=true
```

Comment out or remove `VITE_API_URL` to use Edge Functions for Fetch Description. No need to run `npm run api` for description fetching.

**Note:** "Map to Variant" still requires the API server (`npm run api`) unless migrated to Edge Functions.
