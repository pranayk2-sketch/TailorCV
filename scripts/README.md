# Resume Parser (Phase 2)

Deterministic resume parsing — no AI/LLM. Extracts structured data from PDF/DOCX using heuristics.

## Setup

### 1. Python dependencies

```bash
pip install -r requirements-parse.txt
```

Or:

```bash
pip install pdfplumber python-docx
```

### 2. Environment variables

Add to your `.env` (for the parse server):

```
SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The parse server uses the user's access token (passed from the frontend) with the anon key to access their resumes via RLS. `SUPABASE_SERVICE_ROLE_KEY` is optional (used only if no access token is provided).

## Usage

### Option A: Parse server (for frontend "Import From Resume")

1. Start the parse server (in a separate terminal):

```bash
npm run parse-server
```

2. Start the app: `npm run dev`
3. Upload a resume, then click **Import From Resume**. The frontend will call `http://localhost:3001/parse` with the resume ID.

### Option B: CLI (parse a local file)

```bash
node scripts/parseResume.mjs /path/to/resume.pdf
```

Output: JSON to stdout.

### Option C: Parse a Supabase resume by ID

```bash
node scripts/parseResume.mjs --resume-id <uploaded_resumes.id>
```

Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

### Option D: Run parser tests

```bash
npm run test:parse
```

Runs unit tests for experience segmentation (4+ roles from fixture).

## Output format

```json
{
  "profile": { "full_name": "", "headline": "", "email": "" },
  "skills": [{ "name": "", "category": "" }],
  "coursework": [{ "course_code": "", "course_name": "" }],
  "experiences": [{
    "type": "work|project|leadership|education",
    "org": "",
    "role_title": "",
    "location": "",
    "start_date": "YYYY-MM-DD|null",
    "end_date": "YYYY-MM-DD|null",
    "is_current": false,
    "bullets": ["...", "..."]
  }]
}
```
