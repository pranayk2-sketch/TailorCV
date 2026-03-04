#!/usr/bin/env node
/**
 * TailorCV API Server — Descriptions + Variants
 * Run: npm run api
 * Port: 3002 (parse-server uses 3001)
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { fetchAndExtract } from './lib/descriptionFetcher.js';
import {
  extractKeywords,
  classifyRoleFamily,
  computeFingerprint,
  buildUserTokens,
  computeRelevanceScore,
} from './lib/scoring.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
try {
  const envPath = resolve(__dirname, '..', '.env');
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch (_) {}

const PORT = process.env.API_PORT || process.env.PORT || 3002;

const app = express();
app.use(express.json());

// CORS: allow localhost:5173 (Vite dev)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Rate limit: 30 req/min per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many requests' },
  }),
);

/** Extract user ID from Authorization Bearer JWT */
async function getUserIdFromAuth(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}

// ─── POST /api/description/fetch ────────────────────────────────────────────
app.post('/api/description/fetch', async (req, res) => {
  try {
    const { internshipId } = req.body || {};
    if (!internshipId || typeof internshipId !== 'string') {
      return res.status(400).json({ error: 'Missing internshipId' });
    }

    const { data: internship, error: internErr } = await supabaseAdmin
      .from('internships')
      .select('id, url')
      .eq('id', internshipId)
      .single();

    if (internErr || !internship?.url) {
      return res.status(404).json({ error: 'Internship not found or has no URL' });
    }

    const { rawText, cleanedText, checksum } = await fetchAndExtract(internship.url);

    const { error: upsertErr } = await supabaseAdmin.from('internship_descriptions').upsert(
      {
        internship_id: internshipId,
        raw_text: rawText,
        cleaned_text: cleanedText,
        source: 'scrape',
        fetched_at: new Date().toISOString(),
        checksum,
        tokens_estimate: Math.ceil(cleanedText.length / 4),
        metadata: {},
      },
      { onConflict: 'internship_id' },
    );

    if (upsertErr) {
      return res.status(500).json({ error: upsertErr.message });
    }

    return res.json({
      internshipId,
      fetchedAt: new Date().toISOString(),
      checksum,
      cleanedPreview: cleanedText.slice(0, 1200),
    });
  } catch (e) {
    console.error('description/fetch:', e);
    return res.status(500).json({
      error: e.message || 'Fetch failed',
    });
  }
});

// ─── POST /api/description/fetch-bulk ────────────────────────────────────────
app.post('/api/description/fetch-bulk', async (req, res) => {
  try {
    const { internshipIds } = req.body || {};
    if (!Array.isArray(internshipIds) || internshipIds.length > 20) {
      return res.status(400).json({ error: 'internshipIds must be an array of up to 20 IDs' });
    }

    const results = [];
    const concurrency = 2;
    for (let i = 0; i < internshipIds.length; i += concurrency) {
      const batch = internshipIds.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(async (id) => {
          const { data: internship } = await supabaseAdmin
            .from('internships')
            .select('id, url')
            .eq('id', id)
            .single();
          if (!internship?.url) return { internshipId: id, error: 'No URL' };
          const { rawText, cleanedText, checksum } = await fetchAndExtract(internship.url);
          await supabaseAdmin.from('internship_descriptions').upsert(
            {
              internship_id: id,
              raw_text: rawText,
              cleaned_text: cleanedText,
              source: 'scrape',
              fetched_at: new Date().toISOString(),
              checksum,
              tokens_estimate: Math.ceil(cleanedText.length / 4),
              metadata: {},
            },
            { onConflict: 'internship_id' },
          );
          return { internshipId: id, fetchedAt: new Date().toISOString(), checksum };
        }),
      );
      for (const r of batchResults) {
        results.push(r.status === 'fulfilled' ? r.value : { error: r.reason?.message });
      }
    }

    return res.json({ results });
  } catch (e) {
    console.error('description/fetch-bulk:', e);
    return res.status(500).json({ error: e.message || 'Bulk fetch failed' });
  }
});

// ─── POST /api/variant/map ───────────────────────────────────────────────────
app.post('/api/variant/map', async (req, res) => {
  try {
    const userId = await getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { internshipId } = req.body || {};
    if (!internshipId || typeof internshipId !== 'string') {
      return res.status(400).json({ error: 'Missing internshipId' });
    }

    // Get description (fetch if missing)
    let { data: desc } = await supabaseAdmin
      .from('internship_descriptions')
      .select('cleaned_text')
      .eq('internship_id', internshipId)
      .single();

    if (!desc?.cleaned_text) {
      const { data: internship } = await supabaseAdmin
        .from('internships')
        .select('url')
        .eq('id', internshipId)
        .single();
      if (!internship?.url) {
        return res.status(404).json({ error: 'Internship not found or has no URL' });
      }
      const { cleanedText } = await fetchAndExtract(internship.url);
      await supabaseAdmin.from('internship_descriptions').upsert(
        {
          internship_id: internshipId,
          raw_text: cleanedText,
          cleaned_text: cleanedText,
          source: 'scrape',
          fetched_at: new Date().toISOString(),
          metadata: {},
        },
        { onConflict: 'internship_id' },
      );
      desc = { cleaned_text: cleanedText };
    }

    // Get user skills + bullets
    const { data: skills } = await supabaseAdmin
      .from('skills')
      .select('name')
      .eq('user_id', userId);
    const { data: experiences } = await supabaseAdmin
      .from('experiences')
      .select('id')
      .eq('user_id', userId);
    const expIds = (experiences || []).map((e) => e.id);
    let bullets = [];
    if (expIds.length > 0) {
      const { data: bulletRows } = await supabaseAdmin
        .from('experience_bullets')
        .select('bullet')
        .in('experience_id', expIds);
      bullets = (bulletRows || []).map((b) => b.bullet);
    }

    const jobKeywords = extractKeywords(desc.cleaned_text);
    const roleFamily = classifyRoleFamily(jobKeywords);
    const fingerprint = computeFingerprint(roleFamily, jobKeywords);
    const userTokens = buildUserTokens(skills || [], bullets);
    const { score, matchedSkills, matchedFromBullets, missingKeywords } = computeRelevanceScore(
      jobKeywords,
      userTokens,
    );

    // Upsert resume_variant
    const { data: variant, error: variantErr } = await supabaseAdmin
      .from('resume_variants')
      .upsert(
        {
          user_id: userId,
          role_family: roleFamily,
          fingerprint,
          keywords: jobKeywords,
          plan_json: {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,fingerprint', ignoreDuplicates: false },
      )
      .select()
      .single();

    if (variantErr) {
      return res.status(500).json({ error: variantErr.message });
    }

    // Link internship to variant
    await supabaseAdmin.from('variant_internships').upsert(
      { variant_id: variant.id, internship_id: internshipId },
      { onConflict: 'variant_id,internship_id' },
    );

    return res.json({
      variantId: variant.id,
      roleFamily,
      fingerprint,
      score,
      breakdown: { matchedSkills, matchedFromBullets, missingKeywords },
      keywords: jobKeywords,
    });
  } catch (e) {
    console.error('variant/map:', e);
    return res.status(500).json({ error: e.message || 'Map failed' });
  }
});

// ─── GET /api/variant/:id ────────────────────────────────────────────────────
app.get('/api/variant/:id', async (req, res) => {
  try {
    const userId = await getUserIdFromAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { data: variant, error: vErr } = await supabaseAdmin
      .from('resume_variants')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (vErr || !variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    const { data: links } = await supabaseAdmin
      .from('variant_internships')
      .select('internship_id')
      .eq('variant_id', id);

    const internshipIds = (links || []).map((l) => l.internship_id);
    let internships = [];
    if (internshipIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('internships')
        .select('id, company_name, title, url')
        .in('id', internshipIds);
      internships = data || [];
    }

    return res.json({ variant, internships });
  } catch (e) {
    console.error('variant get:', e);
    return res.status(500).json({ error: e.message || 'Failed' });
  }
});

// ─── GET /api/description/:internshipId ───────────────────────────────────────
app.get('/api/description/:internshipId', async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { data, error } = await supabaseAdmin
      .from('internship_descriptions')
      .select('cleaned_text, fetched_at, checksum')
      .eq('internship_id', internshipId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Description not found' });
    }

    return res.json({
      cleanedText: data.cleaned_text,
      fetchedAt: data.fetched_at,
      checksum: data.checksum,
      preview: data.cleaned_text?.slice(0, 1200),
    });
  } catch (e) {
    console.error('description get:', e);
    return res.status(500).json({ error: e.message || 'Failed' });
  }
});

// ─── GET /api/internship/:id/variant ──────────────────────────────────────────
app.get('/api/internship/:id/variant', async (req, res) => {
  try {
    const userId = await getUserIdFromAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id: internshipId } = req.params;
    const { data: link } = await supabaseAdmin
      .from('variant_internships')
      .select('variant_id')
      .eq('internship_id', internshipId)
      .limit(1)
      .single();

    if (!link) return res.json({ variant: null });

    const { data: variant } = await supabaseAdmin
      .from('resume_variants')
      .select('id, role_family, fingerprint, keywords')
      .eq('id', link.variant_id)
      .eq('user_id', userId)
      .single();

    return res.json({ variant: variant || null });
  } catch (e) {
    console.error('internship variant:', e);
    return res.status(500).json({ error: e.message || 'Failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
