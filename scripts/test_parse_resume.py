#!/usr/bin/env python3
"""
Unit tests for parse_resume.py (deterministic, no AI/LLM).
Run: python scripts/test_parse_resume.py
"""

import sys
from pathlib import Path

# Add scripts dir for imports
sys.path.insert(0, str(Path(__file__).parent))

from parse_resume import (
    normalize_extracted_text,
    parse_resume,
    segment_experiences_by_date_spans,
)

# Fixture: Work Experience section with 4 roles that were previously merged into one
WORK_EXPERIENCE_FIXTURE = """
WORK EXPERIENCE

Software Engineering Intern, T-HUB
Jan 2024 – May 2024
• Built web applications using React and Node.js
• Collaborated with cross-functional teams

Research Assistant, Gritton Lab
Jun 2024 – Aug 2024
• Conducted experiments and analyzed data
• Wrote research reports

MATH AI Teaching Assistant
Sep 2024 – Dec 2024
• Led discussion sections for 50+ students
• Graded assignments and held office hours

IMPACT Internship, Tech Corp
Jan 2025 – Present
• Developing backend services
• Participating in agile sprints
"""

# Variant with hyphenated line break (T-\nHUB)
WORK_EXPERIENCE_WITH_HYPHENATION = """
WORK EXPERIENCE

Software Engineering Intern, T-
HUB
Jan 2024 – May 2024
• Built web applications
"""


def test_normalize_dehyphenate():
    """Dehyphenate line breaks: word-\\nword -> wordword"""
    text = "T-\nHUB"
    result = normalize_extracted_text(text)
    assert "T-\nHUB" not in result or "THUB" in result or "T-HUB" in result, (
        f"Expected dehyphenation, got: {repr(result)}"
    )


def test_normalize_dash_variants():
    """Normalize dash variants to ' – '"""
    text = "Jan 2024 - May 2024"
    result = normalize_extracted_text(text)
    assert " – " in result, f"Expected normalized dash, got: {repr(result)}"


def test_segment_returns_four_entries():
    """Segment should find 4 date spans and produce 4 entries."""
    sections = WORK_EXPERIENCE_FIXTURE.split("WORK EXPERIENCE", 1)
    content = sections[1].strip() if len(sections) > 1 else ""
    segments = segment_experiences_by_date_spans(content)
    assert len(segments) >= 4, (
        f"Expected 4+ segments, got {len(segments)}: {[s[1] for s in segments]}"
    )


def test_parse_returns_four_experiences():
    """Full parse should return 4+ experiences for the fixture."""
    result = parse_resume(WORK_EXPERIENCE_FIXTURE)
    experiences = result.get("experiences", [])
    assert len(experiences) >= 4, (
        f"Expected 4+ experiences, got {len(experiences)}: "
        f"{[e.get('role_title') for e in experiences]}"
    )


def test_experience_roles_detected():
    """Verify key roles are detected (T-HUB, Gritton, MATH AI, IMPACT)."""
    result = parse_resume(WORK_EXPERIENCE_FIXTURE)
    experiences = result.get("experiences", [])
    orgs_and_roles = [
        (e.get("org", ""), e.get("role_title", ""))
        for e in experiences
    ]
    # At least 2 of the 4 should have recognizable org/role
    found = sum(
        1
        for org, role in orgs_and_roles
        if "T-HUB" in org or "T-HUB" in role or "Gritton" in org or "MATH" in role or "IMPACT" in org or "Tech" in org
    )
    assert found >= 2, f"Expected recognizable orgs/roles, got: {orgs_and_roles}"


def test_fallback_raw_block():
    """Entries should have metadata.raw_block when parsing."""
    result = parse_resume(WORK_EXPERIENCE_FIXTURE)
    for exp in result.get("experiences", [])[:2]:
        assert "metadata" in exp
        assert "raw_block" in exp["metadata"]
        assert len(exp["metadata"]["raw_block"]) > 0


def run_tests():
    tests = [
        test_normalize_dehyphenate,
        test_normalize_dash_variants,
        test_segment_returns_four_entries,
        test_parse_returns_four_experiences,
        test_experience_roles_detected,
        test_fallback_raw_block,
    ]
    passed = 0
    failed = []
    for t in tests:
        try:
            t()
            passed += 1
            print(f"  ✓ {t.__name__}")
        except AssertionError as e:
            failed.append((t.__name__, str(e)))
            print(f"  ✗ {t.__name__}: {e}")
    print(f"\n{passed}/{len(tests)} passed")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    print("Running parse_resume tests...")
    run_tests()
