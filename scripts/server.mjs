#!/usr/bin/env node
/**
 * Local parse server for resume parsing.
 * Run: npm run parse-server
 * Then frontend can POST to http://localhost:3001/parse with { resumeId }
 *
 * Requires: SUPABASE_URL (or VITE_SUPABASE_URL), VITE_SUPABASE_ANON_KEY in .env.
 * Frontend must pass accessToken in the request body for auth.
 */

import express from 'express';
import { spawn } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

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

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

async function runPythonParser(filePath) {
  return new Promise((resolvePromise, rejectPromise) => {
    const py = spawn('python3', [resolve(__dirname, 'parse_resume.py'), filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d) => (stdout += d.toString()));
    py.stderr.on('data', (d) => (stderr += d.toString()));
    py.on('close', (code) => {
      if (code !== 0) {
        rejectPromise(new Error(stderr || `Python exited ${code}`));
      } else {
        try {
          resolvePromise(JSON.parse(stdout));
        } catch (e) {
          rejectPromise(new Error('Invalid JSON from parser'));
        }
      }
    });
    py.on('error', (err) => rejectPromise(err));
  });
}

app.post('/parse', async (req, res) => {
  const resumeId = req.body?.resumeId;
  const accessToken = req.body?.accessToken;

  if (!resumeId) {
    return res.status(400).json({ error: 'Missing resumeId' });
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    return res.status(500).json({ error: 'Missing Supabase URL in .env' });
  }

  // Prefer user's access token (works with anon key + RLS). Fall back to service role if no token.
  const supabase =
    accessToken && anonKey
      ? createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        })
      : serviceKey
        ? createClient(url, serviceKey)
        : null;

  if (!supabase) {
    return res.status(500).json({
      error: 'Missing Supabase keys. Set VITE_SUPABASE_ANON_KEY (with accessToken) or SUPABASE_SERVICE_ROLE_KEY in .env',
    });
  }

  try {
    const { data: row, error } = await supabase
      .from('uploaded_resumes')
      .select('file_path, file_name')
      .eq('id', resumeId)
      .single();

    if (error || !row) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const { data: blob, error: dlError } = await supabase.storage
      .from('user-files')
      .download(row.file_path);

    if (dlError || !blob) {
      return res.status(500).json({ error: 'Failed to download file' });
    }

    const tmpDir = mkdtempSync(join(tmpdir(), 'resume-'));
    const ext = row.file_name?.match(/\.[^.]+$/)?.[0] || '.pdf';
    const localPath = join(tmpDir, 'resume' + ext);

    const buffer = Buffer.from(await blob.arrayBuffer());
    writeFileSync(localPath, buffer);

    try {
      const parsed = await runPythonParser(localPath);
      res.json(parsed);
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Parse failed' });
  }
});

const PORT = process.env.PARSE_SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Parse server running at http://localhost:${PORT}`);
});
