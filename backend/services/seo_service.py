"""
SEO Analyzer Service
--------------------
Computes keyword density, heading hierarchy, readability scores.
Strips markdown before textstat analysis to fix 0-score bug.
"""
import re
from collections import Counter


def _strip_markdown(text: str) -> str:
    """Remove markdown so textstat reads prose only."""
    # Remove tables (lines with |)
    text = re.sub(r'\|[^\n]+\|', '', text)
    # Remove markdown bold/italic
    text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
    # Remove headings #
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bullet points
    text = re.sub(r'^[\s]*[-*•]\s+', '', text, flags=re.MULTILINE)
    # Remove [INSERT DATA] placeholders
    text = re.sub(r'\[INSERT[^\]]*\]', '', text)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove extra symbols
    text = re.sub(r'[`|>_~]', '', text)
    # Collapse multiple spaces/newlines
    text = re.sub(r'\n{2,}', '\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


def compute_readability(text: str) -> dict:
    """Return Flesch, FK-Grade, Gunning Fog, and estimated reading time."""
    try:
        import textstat
        clean = _strip_markdown(text)
        if len(clean.split()) < 30:
            raise ValueError("Not enough words")
        words = len(clean.split())
        return {
            "flesch_reading_ease": round(textstat.flesch_reading_ease(clean), 2),
            "flesch_kincaid_grade": round(textstat.flesch_kincaid_grade(clean), 2),
            "gunning_fog": round(textstat.gunning_fog(clean), 2),
            "reading_time_minutes": round(words / 200, 2),
        }
    except Exception as e:
        print(f"Readability error: {e}")
        return {
            "flesch_reading_ease": 0.0,
            "flesch_kincaid_grade": 0.0,
            "gunning_fog": 0.0,
            "reading_time_minutes": 0.0,
        }


def compute_keyword_density(text: str, keywords: list[str]) -> dict:
    if not text or not keywords:
        return {}
    clean = _strip_markdown(text)
    words = re.findall(r"\b\w+\b", clean.lower())
    total = len(words)
    if total == 0:
        return {}
    result = {}
    for kw in keywords:
        kw_lower = kw.lower()
        kw_parts = kw_lower.split()
        if len(kw_parts) == 1:
            count = words.count(kw_parts[0])
        else:
            count = clean.lower().count(kw_lower)
        result[kw] = round((count / total) * 100, 3)
    return result


def score_keyword_density(densities: dict) -> float:
    if not densities:
        return 0.0
    ideal = sum(1 for d in densities.values() if 0.5 <= d <= 2.5)
    low = sum(1 for d in densities.values() if 0.2 <= d < 0.5)
    score = (ideal * 100 + low * 50) / len(densities)
    return round(min(100, score), 1)


def validate_heading_hierarchy(sections: list[dict]) -> tuple:
    issues = []
    if not sections:
        return 0.0, ["No sections found"]

    sorted_sections = sorted(sections, key=lambda s: s["order_index"])
    levels = [s["heading_level"] for s in sorted_sections]

    if levels[0] != 1:
        issues.append("⚠ Post should start with an H1 heading")

    h1_count = levels.count(1)
    if h1_count == 0:
        issues.append("⚠ No H1 heading found")
    elif h1_count > 1:
        issues.append(f"⚠ Multiple H1 headings ({h1_count}). Use only one H1.")

    for i in range(1, len(levels)):
        if levels[i] - levels[i - 1] > 1:
            issues.append(f"⚠ Heading jump at section {i+1}: H{levels[i-1]} → H{levels[i]}")

    score = max(0.0, 100.0 - (len(issues) * 20))
    return round(score, 1), issues


def compute_overall_seo_score(
    keyword_density_score: float,
    heading_hierarchy_score: float,
    flesch_reading_ease: float,
    word_count: int,
    meta_description,
    meta_title,
) -> float:
    readability_score = max(0, min(100, 100 - abs(flesch_reading_ease - 60))) if flesch_reading_ease else 50

    if 800 <= word_count <= 2500:
        wc_score = 100.0
    elif word_count < 800:
        wc_score = (word_count / 800) * 100
    else:
        wc_score = max(60, 100 - ((word_count - 2500) / 100))

    meta_score = 0.0
    if meta_title and 30 <= len(meta_title) <= 60:
        meta_score += 50
    elif meta_title:
        meta_score += 25
    if meta_description and 120 <= len(meta_description) <= 160:
        meta_score += 50
    elif meta_description:
        meta_score += 25

    overall = (
        keyword_density_score * 0.25
        + heading_hierarchy_score * 0.20
        + readability_score * 0.20
        + wc_score * 0.15
        + meta_score * 0.20
    )
    return round(min(100, overall), 1)


def analyze_post(full_text, keywords, sections, meta_title=None, meta_description=None):
    readability = compute_readability(full_text)
    densities = compute_keyword_density(full_text, keywords)
    kd_score = score_keyword_density(densities)
    hh_score, hh_issues = validate_heading_hierarchy(sections)
    word_count = len(_strip_markdown(full_text).split()) if full_text else 0

    overall = compute_overall_seo_score(
        kd_score, hh_score,
        readability["flesch_reading_ease"],
        word_count, meta_description, meta_title,
    )

    return {
        **readability,
        "keyword_density_score": kd_score,
        "heading_hierarchy_score": hh_score,
        "overall_seo_score": overall,
        "keyword_densities": densities,
        "heading_issues": hh_issues,
    }
