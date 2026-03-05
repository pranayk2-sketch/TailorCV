#!/usr/bin/env node
/**
 * Node wrapper for the Python resume parser.
 * Usage:
 *   node scripts/parseResume.mjs <local_file_path>
 *   node scripts/parseResume.mjs --resume-id <uploaded_resumes.id>
 *
 * With --resume-id, fetches file from Supabase Storage and parses it.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { spawn } from 'child_process';
import { createReadStream, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const envPath = resolve(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch (_) {}
}

loadEnv();

async function runPythonParser(filePath) {
  const parserPath = resolve(__dirname, 'parse_resume.py');
  const pythonCandidates = [
    process.env.PYTHON_PATH,
    process.env.PYTHON_CMD,
    'python3',
    'python',
    'py',
  ].filter(Boolean);

  let lastError = null;

  for (const pythonCmd of pythonCandidates) {
    try {
      const parsed = await new Promise((resolvePromise, rejectPromise) => {
        const args = pythonCmd === 'py' ? ['-3', parserPath, filePath] : [parserPath, filePath];
        const py = spawn(pythonCmd, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        py.stdout.on('data', (d) => (stdout += d.toString()));
        py.stderr.on('data', (d) => (stderr += d.toString()));
        py.on('close', (code) => {
          if (code !== 0) {
            rejectPromise(new Error(stderr || `${pythonCmd} exited ${code}`));
          } else {
            try {
              resolvePromise(JSON.parse(stdout));
            } catch (e) {
              rejectPromise(new Error('Invalid JSON from parser: ' + stdout.slice(0, 200)));
            }
          }
        });
        py.on('error', (err) => rejectPromise(err));
      });

      return parsed;
    } catch (err) {
      lastError = err;
      // Continue to next candidate only if executable wasn't found.
      if (err?.code !== 'ENOENT' && !String(err?.message || '').includes('not found')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('No working Python executable found');
}

async function fetchResumeFromSupabase(resumeId) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  const supabase = createClient(url, key);

  const { data: row, error } = await supabase
    .from('uploaded_resumes')
    .select('file_path, file_name')
    .eq('id', resumeId)
    .single();

  if (error || !row) throw new Error('Resume not found: ' + resumeId);

  const tmpDir = mkdtempSync(join(tmpdir(), 'resume-'));
  const ext = row.file_name?.match(/\.[^.]+$/)?.[0] || '.pdf';
  const localPath = join(tmpDir, 'resume' + ext);

  const { data: blob, error: dlError } = await supabase.storage.from('user-files').download(row.file_path);
  if (dlError || !blob) throw new Error('Failed to download: ' + (dlError?.message || 'No data'));

  const { writeFileSync } = await import('fs');
  writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()));

  try {
    const parsed = await runPythonParser(localPath);
    return parsed;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node parseResume.mjs <file_path>');
    console.error('       node parseResume.mjs --resume-id <uploaded_resumes.id>');
    process.exit(1);
  }

  let parsed;
  if (args[0] === '--resume-id' && args[1]) {
    parsed = await fetchResumeFromSupabase(args[1]);
  } else {
    const filePath = resolve(process.cwd(), args[0]);
    parsed = await runPythonParser(filePath);
  }

  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
