#!/usr/bin/env python3
"""
Deterministic resume parser (no AI/LLM).
Extracts structured data from PDF or DOCX using heuristics.
Usage: python parse_resume.py <file_path>
Output: JSON to stdout
"""

import sys
import re
import json
from pathlib import Path
from datetime import datetime

# Section heading normalization and mapping
SECTION_MAP = {
    "EDUCATION": "education",
    "ACADEMIC BACKGROUND": "education",
    "EXPERIENCE": "work",
    "WORK EXPERIENCE": "work",
    "PROFESSIONAL EXPERIENCE": "work",
    "EMPLOYMENT": "work",
    "PROJECTS": "project",
    "PERSONAL PROJECTS": "project",
    "SELECTED PROJECTS": "project",
    "SKILLS": "skills",
    "TECHNICAL SKILLS": "skills",
    "TECHNOLOGIES": "skills",
    "TOOLS": "skills",
    "LEADERSHIP": "leadership",
    "LEADERSHIP EXPERIENCE": "leadership",
    "ACTIVITIES": "leadership",
    "EXTRACURRICULAR": "leadership",
    "INVOLVEMENT": "leadership",
    "RELEVANT COURSEWORK": "coursework",
    "COURSEWORK": "coursework",
    "AWARDS": "award",
    "HONORS": "award",
    "PUBLICATIONS": "publication",
}

# Month names (full and abbrev) for regex
MONTH_PATTERN = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|"
    r"Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
)

# DATE_SPAN: detects date ranges for experience segmentation
# Matches: Month YYYY – Month YYYY | Month YYYY – Present | Mon YYYY – Mon YYYY | partial 'Jul 2025 –'
DATE_SPAN = re.compile(
    r"("
    r"(?:" + MONTH_PATTERN + r"\s+\d{4})\s+[–-]\s+(?:" + MONTH_PATTERN + r"\s+\d{4})"  # Month YYYY – Month YYYY
    r"|"
    r"(?:" + MONTH_PATTERN + r"\s+\d{4})\s+[–-]\s+(?:Present|Current)"  # Month YYYY – Present
    r"|"
    r"(?:" + MONTH_PATTERN + r"\s+\d{4})\s+[–-]\s*"  # Month YYYY – (partial, end_date null)
    r")",
    re.IGNORECASE,
)

# Legacy date pattern for inline date detection
DATE_PATTERN = re.compile(
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|"
    r"\d{4}\s*[-–—]\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|"
    r"\d{4}\s*[-–—]\s*\d{4}|"
    r"(?:Expected\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\d{4}|"
    r"(?:Present|Current)"
)

MONTHS = {
    "jan": "01", "january": "01", "feb": "02", "february": "02",
    "mar": "03", "march": "03", "apr": "04", "april": "04",
    "may": "05", "jun": "06", "june": "06", "jul": "07", "july": "07",
    "aug": "08", "august": "08", "sep": "09", "september": "09",
    "oct": "10", "october": "10", "nov": "11", "november": "11",
    "dec": "12", "december": "12",
}


def normalize_heading(text):
    """Uppercase, strip punctuation, collapse spaces."""
    t = re.sub(r"[^\w\s]", "", text.upper())
    return " ".join(t.split())


def normalize_extracted_text(text):
    """
    Normalize extracted text before parsing.
    - dehyphenate line breaks: word-\nword -> wordword
    - normalize dash variants to ' – '
    - ensure bullets are on their own lines
    - collapse repeated spaces
    """
    if not text:
        return ""
    # dehyphenate: (\w)-\n(\w) -> \1\2
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    # normalize dash variants (em-dash, en-dash, hyphen) to ' – '
    text = re.sub(r"\s*[-–—]\s*", " – ", text)
    # ensure bullets on own lines: split when bullet appears mid-line
    lines = text.split("\n")
    out = []
    for line in lines:
        # if line has content then bullet, split so bullet starts new line
        m = re.search(r"^(.+?)\s+([•\-*◦▪])\s*(.*)$", line)
        if m:
            before, bullet_char, after = m.groups()
            if before.strip():
                out.append(before.rstrip())
                out.append((bullet_char + " " + after).strip() if after else bullet_char)
            else:
                out.append(line)
        else:
            out.append(line)
    text = "\n".join(out)
    # collapse repeated spaces (but preserve newlines)
    text = re.sub(r"[^\S\n]+", " ", text)
    return text.strip()


def extract_text_pdf(path):
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        return "\n".join(text_parts)
    except ImportError:
        sys.stderr.write("Install pdfplumber: pip install pdfplumber\n")
        sys.exit(1)


def extract_text_docx(path):
    try:
        from docx import Document
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    except ImportError:
        sys.stderr.write("Install python-docx: pip install python-docx\n")
        sys.exit(1)


def extract_raw_text(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"File not found: {path}")
    suf = p.suffix.lower()
    if suf == ".pdf":
        return extract_text_pdf(str(p))
    if suf in (".docx", ".doc"):
        return extract_text_docx(str(p))
    raise ValueError(f"Unsupported format: {suf}. Use PDF or DOCX.")


def split_into_sections(raw_text):
    """Split text by detected section headings. Returns list of (section_type, content)."""
    lines = raw_text.split("\n")
    sections = []
    current_type = None
    current_lines = []

    for line in lines:
        normalized = normalize_heading(line.strip())
        if not normalized:
            if current_type:
                current_lines.append(line)
            continue

        matched_type = None
        for heading, stype in SECTION_MAP.items():
            if normalized == heading or normalized.startswith(heading + " "):
                matched_type = stype
                break

        if matched_type:
            if current_type and current_lines:
                sections.append((current_type, "\n".join(current_lines)))
            current_type = matched_type
            current_lines = []
        else:
            if current_type:
                current_lines.append(line)

    if current_type and current_lines:
        sections.append((current_type, "\n".join(current_lines)))

    return sections


def parse_date_range(text):
    """Extract start_date, end_date, is_current from date string."""
    text = text.strip()
    is_current = "present" in text.lower() or "current" in text.lower()
    start_date = None
    end_date = None

    # Month YYYY – Month YYYY or YYYY – YYYY
    m = re.search(r"(\w+)\s*(\d{4})\s*[-–—]\s*(\w+)\s*(\d{4})", text, re.I)
    if m:
        start_date = f"{m.group(2)}-{MONTHS.get(m.group(1).lower()[:3], '01')}-01"
        end_date = f"{m.group(4)}-{MONTHS.get(m.group(3).lower()[:3], '12')}-28"
        return start_date, end_date, False

    m = re.search(r"(\d{4})\s*[-–—]\s*(\d{4})", text)
    if m:
        start_date = f"{m.group(1)}-01-01"
        end_date = f"{m.group(2)}-12-31"
        return start_date, end_date, False

    m = re.search(r"(\w+)\s*(\d{4})\s*[-–—]\s*(?:Present|Current)", text, re.I)
    if m:
        start_date = f"{m.group(2)}-{MONTHS.get(m.group(1).lower()[:3], '01')}-01"
        return start_date, None, True

    # Partial: Month YYYY – (no end date)
    m = re.search(r"(\w+)\s*(\d{4})\s*[-–—]\s*$", text, re.I)
    if m:
        start_date = f"{m.group(2)}-{MONTHS.get(m.group(1).lower()[:3], '01')}-01"
        return start_date, None, False

    m = re.search(r"(\w+)\s*(\d{4})", text, re.I)
    if m:
        start_date = f"{m.group(2)}-{MONTHS.get(m.group(1).lower()[:3], '01')}-01"
        return start_date, None, is_current

    return None, None, is_current


BULLET_CHARS = ("•", "-", "*", "◦", "▪")

# Action verbs that typically start bullet sentences (case-insensitive)
ACTION_VERBS = (
    "designed", "developed", "built", "created", "implemented", "led", "managed",
    "optimized", "applied", "analyzed", "collaborated", "completed", "contributed",
    "preparing", "prepared", "research", "researched", "conducted", "wrote",
    "improved", "designed", "developed", "established", "coordinated", "delivered",
)


def looks_like_bullet_sentence(line):
    """
    Returns True if line appears to be a bullet sentence rather than a header.
    - Starts with action verb
    - OR line length > 80 and contains commas/periods like a sentence
    - OR line ends with period and contains verb-like patterns
    """
    line = (line or "").strip()
    if not line:
        return False
    lower = line.lower()
    # Starts with action verb
    first_word = line.split()[0].lower() if line.split() else ""
    if first_word in ACTION_VERBS:
        return True
    # Length > 80 and contains commas/periods like a sentence
    if len(line) > 80 and ("," in line or "." in line):
        return True
    # Ends with period and has sentence-like structure
    if line.endswith(".") and len(line) > 40:
        return True
    return False


def _is_bullet_line(line):
    stripped = line.lstrip()
    return any(stripped.startswith(c) for c in BULLET_CHARS)


def _is_date_span_line(line):
    return bool(DATE_SPAN.search(line))


def _parse_header_into_role_org(header_text):
    """Parse header into role_title and org. Split by comma first, else — or |."""
    header_text = header_text.strip()
    if not header_text:
        return "", ""
    # Split by comma first
    if "," in header_text:
        parts = header_text.split(",", 1)
        role_title = parts[0].strip()
        org = parts[1].strip() if len(parts) > 1 else ""
        return role_title, org
    # Else split by — or |
    for sep in (" – ", " — ", " | "):
        if sep in header_text:
            parts = header_text.split(sep, 1)
            role_title = parts[0].strip()
            org = parts[1].strip() if len(parts) > 1 else ""
            return role_title, org
    return header_text, ""


def _extract_bullets_with_continuations(lines):
    """Extract bullets, merging continuation lines (indented or not starting with bullet/header/date)."""
    bullets = []
    bullet_chars = BULLET_CHARS
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()
        if any(stripped.startswith(c) for c in bullet_chars):
            bullet_text = re.sub(r"^[\s•\-*◦▪]+\s*", "", stripped).strip()
            i += 1
            # Merge continuation lines
            while i < len(lines):
                next_line = lines[i]
                next_stripped = next_line.lstrip()
                is_continuation = (
                    next_line.startswith(" ") or next_line.startswith("\t")
                ) or (
                    not any(next_stripped.startswith(c) for c in bullet_chars)
                    and not _is_date_span_line(next_line)
                    and next_stripped
                )
                if is_continuation and next_stripped:
                    bullet_text += " " + next_stripped
                    i += 1
                else:
                    break
            if bullet_text:
                bullets.append(bullet_text)
        else:
            i += 1
    return bullets


def segment_experiences_by_date_spans(content):
    """
    Segment an Experience-like section into entries using date spans as anchors.

    Robust rules:
    - Only consider DATE_SPAN matches on non-bullet lines.
    - Support "header + date span on same line" by splitting the line.
    - Determine entry starts using the actual header line index (not guessed -3).
    - Merge wrapped headers (e.g., "Intern, T" + "HUB. Project: ...") using heuristics.
    - Build blocks using consecutive start indices: block = [start_i : start_{i+1})
    Returns list of (header_text, date_span_text, block_lines).
    """
    lines = content.split("\n")
    if not lines:
        return []

    def is_blank(s: str) -> bool:
        return not s or not s.strip()

    def clean(s: str) -> str:
        return (s or "").strip()

    def looks_like_header(s: str) -> bool:
        """
        Heuristic: header is a non-bullet, non-date line with some letters,
        not too short, and not obviously a continuation of a bullet.
        """
        s = clean(s)
        if not s:
            return False
        if _is_bullet_line(s):
            return False
        if _is_date_span_line(s):
            return False
        # must contain at least one letter
        if not re.search(r"[A-Za-z]", s):
            return False
        # avoid lines that are just "Role" / "Organization" etc.
        if len(s) < 3:
            return False
        return True

    def merge_wrapped_header(start_idx: int) -> (int, str):
        """
        Given an index that likely points to a header line, merge with adjacent
        header fragments above/below if they look like a wrapped header.

        Returns (new_start_idx, merged_header_text).
        """
        # Start from start_idx and potentially merge upward and downward.
        idx = start_idx
        header = clean(lines[idx])

        # Merge upward: if previous line also looks like header fragment.
        # NEVER merge upward if prev looks like a bullet sentence.
        for _ in range(2):
            prev_idx = idx - 1
            if prev_idx < 0:
                break
            prev = clean(lines[prev_idx])
            if looks_like_bullet_sentence(prev):
                break
            if not looks_like_header(prev):
                break

            # Only merge upward if either:
            # - current header is short, OR
            # - previous line is short and looks like it continues, OR
            # - previous ends with comma/period and current doesn't start like a bullet/date
            short_curr = len(header) <= 25
            short_prev = len(prev) <= 25
            prev_ends_soft = prev.endswith((",", ".", "•", ":", "—", "–", "-"))
            # If prev seems like a standalone different thing (e.g. a long bullet-like sentence), skip
            if not (short_curr or short_prev or prev_ends_soft):
                break

            # Merge: prev + " " + header
            header = (prev + " " + header).strip()
            idx = prev_idx

        # Merge downward: common case for broken company name: "Intern, T" + "HUB. Project..."
        # NEVER merge downward if next looks like a bullet sentence.
        for _ in range(2):
            next_idx = idx + 1
            if next_idx >= len(lines):
                break
            nxt = clean(lines[next_idx])
            if looks_like_bullet_sentence(nxt):
                break
            if not looks_like_header(nxt):
                break

            # Stop if next looks like a new section heading (all caps and short)
            if nxt.isupper() and len(nxt) <= 24:
                break

            short_header = len(header) <= 30
            ends_with_comma = header.endswith(",")
            tail_token = header.split()[-1] if header.split() else ""
            tail_short_token = len(tail_token) <= 2  # e.g. "T"
            # Merge if header likely incomplete
            if short_header or ends_with_comma or tail_short_token:
                # If header ends with comma, remove comma before merge to avoid "T, HUB"
                if ends_with_comma:
                    header = header[:-1].rstrip()
                header = (header + " " + nxt).strip()
                # Consume the next line as part of header by blanking it in place for block construction safety
                # (optional, but helps avoid header showing up again in bullets extraction)
                lines[next_idx] = ""
            else:
                break

        return idx, header

    def strip_date_from_line(line: str, date_match: re.Match) -> str:
        """
        Remove the matched date span substring from the line to get header text.
        """
        if not date_match:
            return clean(line)
        before = line[:date_match.start()]
        after = line[date_match.end():]
        # Keep only non-date content, collapse spaces
        header = (before + " " + after).strip()
        header = re.sub(r"[^\S\n]+", " ", header).strip()
        return header

    # 1) Detect candidate entry anchors (start_idx, header_text, date_span_text)
    anchors = []
    for i, line in enumerate(lines):
        if is_blank(line):
            continue
        if _is_bullet_line(line):
            continue

        m = DATE_SPAN.search(line)
        if not m:
            continue

        date_span_text = clean(m.group(0))
        # Case A: header and date on same line
        header_inline = strip_date_from_line(line, m)
        if header_inline:
            start_idx = i
            # Merge wrapped header around i if needed (header might be fragmented)
            # Put the inline header into lines[i] temporarily so merge logic sees it
            original_line = lines[i]
            lines[i] = header_inline
            merged_start, merged_header = merge_wrapped_header(i)
            # restore (doesn't matter much, but keep consistent)
            lines[i] = header_inline
            anchors.append({
                "start_idx": merged_start,
                "header_text": merged_header,
                "date_span_text": date_span_text,
            })
            # Keep lines[i] as header_inline for later block slicing
            continue

        # Case B: date on its own line or extracted line with only dates
        # Collect up to 5 previous non-empty, non-bullet, non-date lines and score them.
        TITLE_KEYWORDS = ("intern", "engineer", "assistant", "research", "developer", "analyst", "manager", "lead")
        ORG_KEYWORDS = ("lab", "inc", "llc", "university", "project")

        def score_header_candidate(cand_line):
            cand = clean(cand_line)
            if not cand or _is_bullet_line(cand) or _is_date_span_line(cand):
                return -999
            score = 0
            lower = cand.lower()
            if "," in cand:
                score += 3
            for kw in TITLE_KEYWORDS:
                if kw in lower:
                    score += 2
                    break
            for kw in ORG_KEYWORDS:
                if kw in lower:
                    score += 1
                    break
            if looks_like_bullet_sentence(cand):
                score -= 4
            if len(cand) > 90:
                score -= 2
            return score

        candidates = []
        for j in range(i - 1, max(-1, i - 6), -1):
            if j < 0:
                break
            cand = clean(lines[j])
            if is_blank(cand):
                continue
            if _is_bullet_line(cand):
                continue
            if _is_date_span_line(cand):
                continue
            score = score_header_candidate(lines[j])
            if score > -999:
                candidates.append((j, score))

        header_idx = None
        if candidates:
            header_idx = max(candidates, key=lambda x: x[1])[0]

        if header_idx is None:
            # Fallback: treat the date line itself as start
            header_idx = i
            header_text = ""
        else:
            # Merge wrapped header fragments
            merged_start, merged_header = merge_wrapped_header(header_idx)
            header_idx = merged_start
            header_text = merged_header

        anchors.append({
            "start_idx": header_idx,
            "header_text": header_text,
            "date_span_text": date_span_text,
        })

    if not anchors:
        return []

    # 2) Deduplicate anchors by start_idx (sometimes multiple DATE_SPAN hits occur in same region)
    anchors.sort(key=lambda a: a["start_idx"])
    deduped = []
    for a in anchors:
        if not deduped:
            deduped.append(a)
            continue
        prev = deduped[-1]
        # If same start index, keep the one with "more informative" header/date
        if a["start_idx"] == prev["start_idx"]:
            # Prefer longer header or longer date span
            if len(a["header_text"]) + len(a["date_span_text"]) > len(prev["header_text"]) + len(prev["date_span_text"]):
                deduped[-1] = a
        else:
            # If starts are extremely close (within 1 line) and header is empty, ignore
            if a["start_idx"] <= prev["start_idx"] + 1 and not a["header_text"]:
                continue
            deduped.append(a)

    anchors = deduped

    # 3) Build blocks from anchors using actual start indices
    entries = []
    for idx, a in enumerate(anchors):
        start = a["start_idx"]
        end = anchors[idx + 1]["start_idx"] if idx + 1 < len(anchors) else len(lines)

        # Guard: ensure monotonic
        if end <= start:
            continue

        block_lines = [lines[k] for k in range(start, end) if lines[k] is not None]
        # Trim leading/trailing blanks in block
        while block_lines and is_blank(block_lines[0]):
            block_lines.pop(0)
        while block_lines and is_blank(block_lines[-1]):
            block_lines.pop()

        if not block_lines:
            continue

        entries.append((a["header_text"], a["date_span_text"], block_lines))

    return entries


def _cleanup_parsed_entry(entry, header_text):
    """
    Post-process a parsed entry: fix role_title/org when bullets were misclassified.
    """
    role_title = entry.get("role_title", "")
    org = entry.get("org", "")
    bullets = entry.get("bullets", [])

    # If role_title length > 90 and bullets exist: move role_title into bullets[0], shorten role_title
    if len(role_title) > 90 and bullets:
        bullets = [role_title] + bullets
        role_title, org = _parse_header_into_role_org(header_text)
        if len(role_title) > 90:
            role_title = "Role"
        entry["role_title"] = role_title
        entry["bullets"] = bullets

    # If org is "Unknown" but header_text contains comma, re-split
    if org == "Unknown" and header_text and "," in header_text:
        role_title, org = _parse_header_into_role_org(header_text)
        entry["role_title"] = role_title or entry.get("role_title", "Role")
        entry["org"] = org or "Unknown"

    return entry


def parse_single_experience_entry(header_text, date_span_text, block_lines, exp_type):
    """
    Parse one experience entry from header, date span, and block lines.
    Returns dict or None.
    """
    role_title, org = _parse_header_into_role_org(header_text)
    start_date, end_date, is_current = parse_date_range(date_span_text)

    # Extract bullets from block (skip header/date lines)
    bullets = _extract_bullets_with_continuations(block_lines)

    raw_block = "\n".join(block_lines).strip()

    entry = {
        "type": exp_type,
        "org": org or "Unknown",
        "role_title": role_title or "Role",
        "location": None,
        "start_date": start_date,
        "end_date": end_date,
        "is_current": is_current,
        "bullets": bullets,
        "metadata": {"raw_block": raw_block[:500]},
    }
    return _cleanup_parsed_entry(entry, header_text)


def parse_experience_block(block, exp_type):
    """
    Fallback: parse one experience block when date-span segmentation didn't apply.
    Used for blocks that don't have clear date spans.
    """
    lines = [l.strip() for l in block.strip().split("\n") if l.strip()]
    if not lines:
        return None

    first = lines[0]
    bullets = []
    org = ""
    role_title = ""
    location = ""
    start_date = None
    end_date = None
    is_current = False

    parts = re.split(r"\s*[-–—|]\s*", first, maxsplit=3)
    if len(parts) >= 2:
        role_title = parts[0].strip()
        org = parts[1].strip()
        if len(parts) >= 3:
            rest = parts[2]
            date_m = DATE_PATTERN.search(rest)
            if date_m:
                start_date, end_date, is_current = parse_date_range(date_m.group(0))
                loc = rest[: date_m.start()].strip()
                if loc and loc.lower() not in ("present", "current"):
                    location = loc
            else:
                location = rest.strip()
    else:
        role_title = first
        org = first

    for line in lines[1:]:
        stripped = line.lstrip()
        if any(stripped.startswith(c) for c in BULLET_CHARS):
            stripped = re.sub(r"^[\s•\-*◦▪]+\s*", "", stripped)
        if stripped and stripped != role_title and stripped != org:
            bullets.append(stripped)

    entry = {
        "type": exp_type,
        "org": org or "Unknown",
        "role_title": role_title or "Role",
        "location": location or None,
        "start_date": start_date,
        "end_date": end_date,
        "is_current": is_current,
        "bullets": bullets,
        "metadata": {"raw_block": block[:500]},
    }
    return _cleanup_parsed_entry(entry, first)


def parse_skills_section(content):
    """Parse skills section. Look for 'Category: item1, item2'."""
    skills = []
    lines = content.split("\n")
    current_cat = "Other"

    for line in lines:
        line = line.strip()
        if not line:
            continue
        # "Programming Languages: Python, Java, C++"
        m = re.match(r"([\w\s]+):\s*(.+)", line, re.I)
        if m:
            cat = m.group(1).strip()
            if cat.lower() in ("languages", "programming languages"):
                current_cat = "Languages"
            elif cat.lower() in ("frameworks", "libraries"):
                current_cat = "Frameworks"
            elif cat.lower() in ("tools", "technologies"):
                current_cat = "Tools"
            else:
                current_cat = cat
            items = re.split(r"[,;]|\band\b", m.group(2), flags=re.I)
            for item in items:
                name = item.strip()
                if name:
                    skills.append({"name": name, "category": current_cat})
        else:
            # Comma-separated list
            items = re.split(r"[,;]|\band\b", line, flags=re.I)
            for item in items:
                name = item.strip()
                if name and len(name) > 1:
                    skills.append({"name": name, "category": current_cat})

    return skills


def parse_coursework_section(content):
    """Parse coursework. Split by comma or newline."""
    items = re.split(r"[,;\n]|\band\b", content, flags=re.I)
    coursework = []
    for item in items:
        item = item.strip()
        if not item or len(item) < 3:
            continue
        # Try "CS 101 - Intro to CS" or "CS101: Intro"
        m = re.match(r"([A-Za-z]+\s*\d+[A-Za-z]?)\s*[-–—:]\s*(.+)", item)
        if m:
            coursework.append({"course_code": m.group(1).strip(), "course_name": m.group(2).strip()})
        else:
            coursework.append({"course_code": "", "course_name": item})
    return coursework


def parse_experience_section(content, exp_type):
    """
    Parse experience section. Prefer date-span segmentation when date spans are found.
    Fall back to blank-line block parsing otherwise.
    """
    content = content.strip()
    if not content:
        return []

    # Try date-span segmentation first
    segments = segment_experiences_by_date_spans(content)
    if segments:
        experiences = []
        for header_text, date_span_text, block_lines in segments:
            parsed = parse_single_experience_entry(
                header_text, date_span_text, block_lines, exp_type
            )
            if parsed:
                experiences.append(parsed)
        if experiences:
            return experiences

    # Fallback: blocks separated by blank lines
    blocks = re.split(r"\n\s*\n", content)
    experiences = []
    for block in blocks:
        block = block.strip()
        if not block or len(block) < 10:
            continue
        parsed = parse_experience_block(block, exp_type)
        if parsed:
            experiences.append(parsed)
    return experiences


def parse_resume(raw_text):
    """Main parse logic."""
    raw_text = normalize_extracted_text(raw_text)
    sections = split_into_sections(raw_text)

    result = {
        "profile": {"full_name": "", "headline": "", "email": ""},
        "skills": [],
        "coursework": [],
        "experiences": [],
    }

    for section_type, content in sections:
        if section_type == "skills":
            result["skills"] = parse_skills_section(content)
        elif section_type == "coursework":
            result["coursework"] = parse_coursework_section(content)
        elif section_type in ("work", "project", "leadership", "education", "award", "publication"):
            result["experiences"].extend(parse_experience_section(content, section_type))

    return result


def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python parse_resume.py <file_path>\n")
        sys.exit(1)

    path = sys.argv[1]
    raw_text = extract_raw_text(path)
    parsed = parse_resume(raw_text)
    parsed["_meta"] = {"raw_text_preview": raw_text[:2000], "parsed_at": datetime.utcnow().isoformat() + "Z"}
    print(json.dumps(parsed, indent=2))


if __name__ == "__main__":
    main()
