# # """
# # SEO Analyzer Service
# # --------------------
# # Computes keyword density, heading hierarchy, readability scores.
# # Strips markdown before textstat analysis to fix 0-score bug.
# # """
# # import re
# # from collections import Counter


# # def _strip_markdown(text: str) -> str:
# #     """Remove markdown so textstat reads prose only."""
# #     # Remove tables (lines with |)
# #     text = re.sub(r'\|[^\n]+\|', '', text)
# #     # Remove markdown bold/italic
# #     text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
# #     # Remove headings #
# #     text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
# #     # Remove bullet points
# #     text = re.sub(r'^[\s]*[-*•]\s+', '', text, flags=re.MULTILINE)
# #     # Remove [INSERT DATA] placeholders
# #     text = re.sub(r'\[INSERT[^\]]*\]', '', text)
# #     # Remove URLs
# #     text = re.sub(r'https?://\S+', '', text)
# #     # Remove extra symbols
# #     text = re.sub(r'[`|>_~]', '', text)
# #     # Collapse multiple spaces/newlines
# #     text = re.sub(r'\n{2,}', '\n', text)
# #     text = re.sub(r'[ \t]{2,}', ' ', text)
# #     return text.strip()


# # def compute_readability(text: str) -> dict:
# #     """Return Flesch, FK-Grade, Gunning Fog, and estimated reading time."""
# #     try:
# #         import textstat
# #         clean = _strip_markdown(text)
# #         if len(clean.split()) < 30:
# #             raise ValueError("Not enough words")
# #         words = len(clean.split())
# #         return {
# #             "flesch_reading_ease": round(textstat.flesch_reading_ease(clean), 2),
# #             "flesch_kincaid_grade": round(textstat.flesch_kincaid_grade(clean), 2),
# #             "gunning_fog": round(textstat.gunning_fog(clean), 2),
# #             "reading_time_minutes": round(words / 200, 2),
# #         }
# #     except Exception as e:
# #         print(f"Readability error: {e}")
# #         return {
# #             "flesch_reading_ease": 0.0,
# #             "flesch_kincaid_grade": 0.0,
# #             "gunning_fog": 0.0,
# #             "reading_time_minutes": 0.0,
# #         }


# # def compute_keyword_density(text: str, keywords: list[str]) -> dict:
# #     if not text or not keywords:
# #         return {}
# #     clean = _strip_markdown(text)
# #     words = re.findall(r"\b\w+\b", clean.lower())
# #     total = len(words)
# #     if total == 0:
# #         return {}
# #     result = {}
# #     for kw in keywords:
# #         kw_lower = kw.lower()
# #         kw_parts = kw_lower.split()
# #         if len(kw_parts) == 1:
# #             count = words.count(kw_parts[0])
# #         else:
# #             count = clean.lower().count(kw_lower)
# #         result[kw] = round((count / total) * 100, 3)
# #     return result


# # def score_keyword_density(densities: dict) -> float:
# #     if not densities:
# #         return 0.0
# #     ideal = sum(1 for d in densities.values() if 0.5 <= d <= 2.5)
# #     low = sum(1 for d in densities.values() if 0.2 <= d < 0.5)
# #     score = (ideal * 100 + low * 50) / len(densities)
# #     return round(min(100, score), 1)


# # def validate_heading_hierarchy(sections: list[dict]) -> tuple:
# #     issues = []
# #     if not sections:
# #         return 0.0, ["No sections found"]

# #     sorted_sections = sorted(sections, key=lambda s: s["order_index"])
# #     levels = [s["heading_level"] for s in sorted_sections]

# #     if levels[0] != 1:
# #         issues.append("⚠ Post should start with an H1 heading")

# #     h1_count = levels.count(1)
# #     if h1_count == 0:
# #         issues.append("⚠ No H1 heading found")
# #     elif h1_count > 1:
# #         issues.append(f"⚠ Multiple H1 headings ({h1_count}). Use only one H1.")

# #     for i in range(1, len(levels)):
# #         if levels[i] - levels[i - 1] > 1:
# #             issues.append(f"⚠ Heading jump at section {i+1}: H{levels[i-1]} → H{levels[i]}")

# #     score = max(0.0, 100.0 - (len(issues) * 20))
# #     return round(score, 1), issues


# # def compute_overall_seo_score(
# #     keyword_density_score: float,
# #     heading_hierarchy_score: float,
# #     flesch_reading_ease: float,
# #     word_count: int,
# #     meta_description,
# #     meta_title,
# # ) -> float:
# #     readability_score = max(0, min(100, 100 - abs(flesch_reading_ease - 60))) if flesch_reading_ease else 50

# #     if 800 <= word_count <= 2500:
# #         wc_score = 100.0
# #     elif word_count < 800:
# #         wc_score = (word_count / 800) * 100
# #     else:
# #         wc_score = max(60, 100 - ((word_count - 2500) / 100))

# #     meta_score = 0.0
# #     if meta_title and 30 <= len(meta_title) <= 60:
# #         meta_score += 50
# #     elif meta_title:
# #         meta_score += 25
# #     if meta_description and 120 <= len(meta_description) <= 160:
# #         meta_score += 50
# #     elif meta_description:
# #         meta_score += 25

# #     overall = (
# #         keyword_density_score * 0.25
# #         + heading_hierarchy_score * 0.20
# #         + readability_score * 0.20
# #         + wc_score * 0.15
# #         + meta_score * 0.20
# #     )
# #     return round(min(100, overall), 1)


# # def analyze_post(full_text, keywords, sections, meta_title=None, meta_description=None):
# #     readability = compute_readability(full_text)
# #     densities = compute_keyword_density(full_text, keywords)
# #     kd_score = score_keyword_density(densities)
# #     hh_score, hh_issues = validate_heading_hierarchy(sections)
# #     word_count = len(_strip_markdown(full_text).split()) if full_text else 0

# #     overall = compute_overall_seo_score(
# #         kd_score, hh_score,
# #         readability["flesch_reading_ease"],
# #         word_count, meta_description, meta_title,
# #     )

# #     return {
# #         **readability,
# #         "keyword_density_score": kd_score,
# #         "heading_hierarchy_score": hh_score,
# #         "overall_seo_score": overall,
# #         "keyword_densities": densities,
# #         "heading_issues": hh_issues,
# #     }


# """
# SEO Analyzer Service
# --------------------
# Computes keyword density, heading hierarchy, readability scores.
# Strips markdown before textstat analysis to fix 0-score bug.
# """
# import re
# from collections import Counter


# def _strip_markdown(text: str) -> str:
#     """Remove markdown so textstat reads prose only."""
#     text = re.sub(r'\|[^\n]+\|', '', text)
#     text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text)
#     text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
#     text = re.sub(r'^[\s]*[-*•]\s+', '', text, flags=re.MULTILINE)
#     text = re.sub(r'\[INSERT[^\]]*\]', '', text)
#     text = re.sub(r'https?://\S+', '', text)
#     text = re.sub(r'[`|>_~]', '', text)
#     text = re.sub(r'\n{2,}', '\n', text)
#     text = re.sub(r'[ \t]{2,}', ' ', text)
#     return text.strip()


# def _build_full_text(sections: list[dict]) -> str:
#     """
#     Concatenate ALL section content in order to get the true full blog text.
#     Each section contributes its heading + content.
#     """
#     sorted_sections = sorted(sections, key=lambda s: s.get("order_index", 0))
#     parts = []
#     for s in sorted_sections:
#         heading = s.get("heading", "")
#         content = s.get("content", "") or ""
#         if heading:
#             parts.append(f"{'#' * s.get('heading_level', 2)} {heading}")
#         if content:
#             parts.append(content)
#     return "\n\n".join(parts)


# def compute_readability(text: str) -> dict:
#     """Return Flesch, FK-Grade, Gunning Fog, and estimated reading time."""
#     try:
#         import textstat
#         clean = _strip_markdown(text)
#         if len(clean.split()) < 30:
#             raise ValueError("Not enough words")
#         words = len(clean.split())
#         return {
#             "flesch_reading_ease": round(textstat.flesch_reading_ease(clean), 2),
#             "flesch_kincaid_grade": round(textstat.flesch_kincaid_grade(clean), 2),
#             "gunning_fog": round(textstat.gunning_fog(clean), 2),
#             "reading_time_minutes": round(words / 200, 2),
#         }
#     except Exception as e:
#         print(f"Readability error: {e}")
#         return {
#             "flesch_reading_ease": 0.0,
#             "flesch_kincaid_grade": 0.0,
#             "gunning_fog": 0.0,
#             "reading_time_minutes": 0.0,
#         }


# def compute_keyword_density(text: str, keywords: list[str]) -> dict:
#     if not text or not keywords:
#         return {}
#     clean = _strip_markdown(text)
#     words = re.findall(r"\b\w+\b", clean.lower())
#     total = len(words)
#     if total == 0:
#         return {}
#     result = {}
#     for kw in keywords:
#         kw_lower = kw.lower()
#         kw_parts = kw_lower.split()
#         if len(kw_parts) == 1:
#             count = words.count(kw_parts[0])
#         else:
#             count = clean.lower().count(kw_lower)
#         result[kw] = round((count / total) * 100, 3)
#     return result


# def score_keyword_density(densities: dict) -> float:
#     if not densities:
#         return 0.0
#     ideal = sum(1 for d in densities.values() if 0.5 <= d <= 2.5)
#     low = sum(1 for d in densities.values() if 0.2 <= d < 0.5)
#     score = (ideal * 100 + low * 50) / len(densities)
#     return round(min(100, score), 1)


# def validate_heading_hierarchy(sections: list[dict]) -> tuple:
#     issues = []
#     if not sections:
#         return 0.0, ["No sections found"]

#     sorted_sections = sorted(sections, key=lambda s: s["order_index"])
#     levels = [s["heading_level"] for s in sorted_sections]

#     if levels[0] != 1:
#         issues.append("⚠ Post should start with an H1 heading")

#     h1_count = levels.count(1)
#     if h1_count == 0:
#         issues.append("⚠ No H1 heading found")
#     elif h1_count > 1:
#         issues.append(f"⚠ Multiple H1 headings ({h1_count}). Use only one H1.")

#     for i in range(1, len(levels)):
#         if levels[i] - levels[i - 1] > 1:
#             issues.append(f"⚠ Heading jump at section {i+1}: H{levels[i-1]} → H{levels[i]}")

#     score = max(0.0, 100.0 - (len(issues) * 20))
#     return round(score, 1), issues


# def compute_overall_seo_score(
#     keyword_density_score: float,
#     heading_hierarchy_score: float,
#     flesch_reading_ease: float,
#     word_count: int,
#     meta_description,
#     meta_title,
# ) -> float:
#     readability_score = max(0, min(100, 100 - abs(flesch_reading_ease - 60))) if flesch_reading_ease else 50

#     if 800 <= word_count <= 2500:
#         wc_score = 100.0
#     elif word_count < 800:
#         wc_score = (word_count / 800) * 100
#     else:
#         wc_score = max(60, 100 - ((word_count - 2500) / 100))

#     meta_score = 0.0
#     if meta_title and 30 <= len(meta_title) <= 60:
#         meta_score += 50
#     elif meta_title:
#         meta_score += 25
#     if meta_description and 120 <= len(meta_description) <= 160:
#         meta_score += 50
#     elif meta_description:
#         meta_score += 25

#     overall = (
#         keyword_density_score * 0.25
#         + heading_hierarchy_score * 0.20
#         + readability_score * 0.20
#         + wc_score * 0.15
#         + meta_score * 0.20
#     )
#     return round(min(100, overall), 1)


# def analyze_post(full_text, keywords, sections, meta_title=None, meta_description=None):
#     """
#     Analyze the full blog post.
#     - full_text: may be a single section or partial — we always rebuild from sections
#     - sections: list of all section dicts with heading, content, order_index, heading_level
#     """
#     # Always build complete text from ALL sections so word count is accurate
#     if sections:
#         combined_text = _build_full_text(sections)
#     else:
#         combined_text = full_text or ""

#     readability = compute_readability(combined_text)
#     densities = compute_keyword_density(combined_text, keywords)
#     kd_score = score_keyword_density(densities)
#     hh_score, hh_issues = validate_heading_hierarchy(sections)

#     # Word count from full combined text (all sections, markdown stripped)
#     word_count = len(_strip_markdown(combined_text).split()) if combined_text else 0

#     overall = compute_overall_seo_score(
#         kd_score, hh_score,
#         readability["flesch_reading_ease"],
#         word_count, meta_description, meta_title,
#     )

#     return {
#         **readability,
#         "keyword_density_score": kd_score,
#         "heading_hierarchy_score": hh_score,
#         "overall_seo_score": overall,
#         "keyword_densities": densities,
#         "heading_issues": hh_issues,
#         "word_count": word_count,  # total across all sections
#     }

"""
SEO Analyzer Service
--------------------
Computes keyword density, heading hierarchy, readability scores.
Strips markdown before textstat analysis to fix 0-score bug.

Fixes applied:
  1. Readability always runs on full combined text (all sections), never a single section.
  2. Returns None (not 0.0) on readability failure so frontend can show "N/A" instead of "GO".
  3. Keyword density normalizes whitespace before phrase matching to catch cross-line phrases.
  4. Heading validator accepts optional has_separate_title flag so H2-start posts aren't penalized.
  5. _strip_markdown no longer collapses paragraph breaks into nothing.
"""

import re
from collections import Counter


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _strip_markdown(text: str) -> str:
    """Remove markdown formatting so textstat reads clean prose only."""
    # Remove table rows (lines that are mostly | separated)
    text = re.sub(r'\|[^\n]+\|', '', text)
    # Remove bold / italic markers but keep the inner text
    text = re.sub(r'\*{1,3}(.*?)\*{1,3}', r'\1', text, flags=re.DOTALL)
    # Remove heading hashes at line start
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bullet / list markers
    text = re.sub(r'^[\s]*[-*•]\s+', '', text, flags=re.MULTILINE)
    # Remove [INSERT ...] placeholders
    text = re.sub(r'\[INSERT[^\]]*\]', '', text)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove stray markdown symbols
    text = re.sub(r'[`|>_~]', '', text)
    # Collapse 3+ blank lines to 2 (preserve paragraph structure)
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Collapse inline multiple spaces/tabs
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


def _normalize_whitespace(text: str) -> str:
    """Flatten all whitespace (newlines, tabs, multiple spaces) to single spaces.
    Used for multi-word phrase matching so line breaks don't break phrases.
    """
    return re.sub(r'\s+', ' ', text).strip()


def _build_full_text(sections: list[dict]) -> str:
    """
    Concatenate ALL section content in order to get the true full blog text.
    Each section contributes its heading + content.
    """
    sorted_sections = sorted(sections, key=lambda s: s.get("order_index", 0))
    parts = []
    for s in sorted_sections:
        heading = s.get("heading", "")
        content = s.get("content", "") or ""
        if heading:
            level = s.get("heading_level", 2)
            parts.append(f"{'#' * level} {heading}")
        if content:
            parts.append(content)
    return "\n\n".join(parts)


# ---------------------------------------------------------------------------
# Readability
# ---------------------------------------------------------------------------

def compute_readability(text: str) -> dict:
    """
    Return Flesch Reading Ease, FK-Grade, Gunning Fog, and estimated reading time.

    Returns None for all scores (instead of 0.0) when analysis cannot be performed,
    so the frontend can distinguish "failed" from a genuine score of zero.
    """
    _FAILURE = {
        "flesch_reading_ease": None,
        "flesch_kincaid_grade": None,
        "gunning_fog": None,
        "reading_time_minutes": None,
    }

    if not text:
        print("Readability error: empty text")
        return _FAILURE

    try:
        import textstat

        clean = _strip_markdown(text)
        word_list = clean.split()

        if not word_list:
            raise ValueError("No readable words found after markdown cleanup.")

        words = len(word_list)
        return {
            "flesch_reading_ease": round(textstat.flesch_reading_ease(clean), 2),
            "flesch_kincaid_grade": round(textstat.flesch_kincaid_grade(clean), 2),
            "gunning_fog": round(textstat.gunning_fog(clean), 2),
            "reading_time_minutes": round(words / 200, 2),
        }

    except Exception as e:
        print(f"Readability error: {e}")
        clean = _strip_markdown(text)
        words = len(clean.split()) if clean else 0
        return {
            **_FAILURE,
            "reading_time_minutes": round(words / 200, 2) if words > 0 else None,
        }


# ---------------------------------------------------------------------------
# Keyword density
# ---------------------------------------------------------------------------

def compute_keyword_density(text: str, keywords: list[str]) -> dict:
    """
    Compute what percentage of the total word count each keyword (or phrase) represents.

    Multi-word phrases are matched on whitespace-normalised text so that a phrase
    that spans a line break in the raw markdown is still found.
    """
    if not text or not keywords:
        return {}

    clean = _strip_markdown(text)
    # Normalised version used for phrase (multi-word) searching
    clean_normalized = _normalize_whitespace(clean).lower()
    # Token list used for single-word counting
    words = re.findall(r"\b\w+\b", clean_normalized)
    total = len(words)

    if total == 0:
        return {}

    result = {}
    for kw in keywords:
        kw_lower = kw.lower().strip()
        kw_parts = kw_lower.split()

        if len(kw_parts) == 1:
            # Single word — count exact token matches
            count = words.count(kw_parts[0])
        else:
            # Multi-word phrase — search in the whitespace-normalised string
            # so phrases split across lines are still found
            count = clean_normalized.count(kw_lower)

        result[kw] = round((count / total) * 100, 3)

    return result


def score_keyword_density(densities: dict) -> float:
    """
    Score overall keyword density health.

    Ideal range : 0.5 % – 2.5 %  →  100 points each
    Low range   : 0.2 % – 0.5 %  →   50 points each
    Outside     : 0.0 %           →    0 points each
    """
    if not densities:
        return 0.0

    ideal = sum(1 for d in densities.values() if 0.5 <= d <= 2.5)
    low   = sum(1 for d in densities.values() if 0.2 <= d < 0.5)
    score = (ideal * 100 + low * 50) / len(densities)
    return round(min(100.0, score), 1)


# ---------------------------------------------------------------------------
# Heading hierarchy
# ---------------------------------------------------------------------------

def validate_heading_hierarchy(
    sections: list[dict],
    has_separate_title: bool = False,
) -> tuple:
    """
    Validate the heading structure of the post.

    Parameters
    ----------
    sections : list[dict]
        Each dict must have keys: order_index (int), heading_level (int).
    has_separate_title : bool
        Set True when the post title is stored outside the sections list
        (e.g. in a dedicated `title` field on the post model).
        In that case the first section is expected to start at H2, not H1,
        and starting at H2 is NOT penalised.

    Returns
    -------
    (score: float, issues: list[str])
    """
    issues = []

    if not sections:
        return 0.0, ["No sections found"]

    sorted_sections = sorted(sections, key=lambda s: s["order_index"])
    levels = [s["heading_level"] for s in sorted_sections]

    # Determine the expected starting level
    expected_start = 2 if has_separate_title else 1

    if levels[0] != expected_start:
        issues.append(
            f"⚠ Post should start with an H{expected_start} heading "
            f"(found H{levels[0]})"
        )

    if not has_separate_title:
        h1_count = levels.count(1)
        if h1_count == 0:
            issues.append("⚠ No H1 heading found")
        elif h1_count > 1:
            issues.append(
                f"⚠ Multiple H1 headings ({h1_count}). Use only one H1."
            )

    # Check for skipped heading levels (e.g. H2 → H4)
    for i in range(1, len(levels)):
        jump = levels[i] - levels[i - 1]
        if jump > 1:
            issues.append(
                f"⚠ Heading jump at section {i + 1}: "
                f"H{levels[i - 1]} → H{levels[i]}"
            )

    score = max(0.0, 100.0 - (len(issues) * 20))
    return round(score, 1), issues


# ---------------------------------------------------------------------------
# Overall SEO score
# ---------------------------------------------------------------------------

def compute_overall_seo_score(
    keyword_density_score: float,
    heading_hierarchy_score: float,
    flesch_reading_ease,        # float or None
    word_count: int,
    meta_description,           # str or None
    meta_title,                 # str or None
) -> float:
    """
    Weighted combination of sub-scores → overall SEO score (0–100).

    Weights:
        Keyword density   25 %
        Heading hierarchy 20 %
        Readability       20 %
        Word count        15 %
        Meta quality      20 %
    """
    # --- Readability sub-score ---
    # Target Flesch score ≈ 60 (plain English).
    # If readability failed (None) default to a neutral 50.
    if flesch_reading_ease is not None:
        readability_score = max(0.0, min(100.0, 100.0 - abs(flesch_reading_ease - 60)))
    else:
        readability_score = 50.0

    # --- Word count sub-score ---
    if 800 <= word_count <= 2500:
        wc_score = 100.0
    elif word_count < 800:
        wc_score = (word_count / 800) * 100.0
    else:
        # Penalise gently beyond 2 500 words
        wc_score = max(60.0, 100.0 - ((word_count - 2500) / 100.0))

    # --- Meta sub-score ---
    meta_score = 0.0
    if meta_title:
        if 30 <= len(meta_title) <= 60:
            meta_score += 50.0
        else:
            meta_score += 25.0
    if meta_description:
        if 120 <= len(meta_description) <= 160:
            meta_score += 50.0
        else:
            meta_score += 25.0

    overall = (
        keyword_density_score   * 0.25
        + heading_hierarchy_score * 0.20
        + readability_score       * 0.20
        + wc_score                * 0.15
        + meta_score              * 0.20
    )
    return round(min(100.0, overall), 1)


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def analyze_post(
    full_text,
    keywords,
    sections,
    meta_title=None,
    meta_description=None,
    has_separate_title: bool = False,
):
    """
    Analyze the full blog post and return an SEO metrics dict.

    Parameters
    ----------
    full_text : str
        Raw text of the post (may be partial / single section).
        When `sections` is provided this parameter is ignored in favour of
        rebuilding the complete text from all sections.
    keywords : list[str]
        Target keywords / phrases to measure density for.
    sections : list[dict]
        All section dicts.  Each must contain:
            - order_index   (int)
            - heading_level (int)
            - heading       (str)
            - content       (str)
    meta_title : str or None
    meta_description : str or None
    has_separate_title : bool
        Pass True if the post title lives outside the sections list.
        Prevents false "missing H1" warnings when sections start at H2.

    Returns
    -------
    dict with keys:
        flesch_reading_ease, flesch_kincaid_grade, gunning_fog,
        reading_time_minutes, keyword_density_score,
        heading_hierarchy_score, overall_seo_score,
        keyword_densities, heading_issues, word_count
    """
    # Always build the complete text from ALL sections so metrics are accurate.
    if sections:
        combined_text = _build_full_text(sections)
    else:
        combined_text = full_text or ""

    readability   = compute_readability(combined_text)
    densities     = compute_keyword_density(combined_text, keywords)
    kd_score      = score_keyword_density(densities)
    hh_score, hh_issues = validate_heading_hierarchy(
        sections, has_separate_title=has_separate_title
    )

    # Word count from the fully combined, markdown-stripped text
    word_count = len(_strip_markdown(combined_text).split()) if combined_text else 0

    overall = compute_overall_seo_score(
        kd_score,
        hh_score,
        readability["flesch_reading_ease"],   # may be None — handled inside
        word_count,
        meta_description,
        meta_title,
    )

    return {
        # Readability metrics (None when analysis could not run)
        "flesch_reading_ease":    readability["flesch_reading_ease"],
        "flesch_kincaid_grade":   readability["flesch_kincaid_grade"],
        "gunning_fog":            readability["gunning_fog"],
        "reading_time_minutes":   readability["reading_time_minutes"],
        # Keyword metrics
        "keyword_density_score":  kd_score,
        "keyword_densities":      densities,
        # Heading metrics
        "heading_hierarchy_score": hh_score,
        "heading_issues":          hh_issues,
        # Overall
        "overall_seo_score": overall,
        "word_count":        word_count,
    }
