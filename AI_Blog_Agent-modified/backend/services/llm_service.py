"""
LLM Service — Multi-Agent Pipeline
------------------------------------
Agent 1 (Planner):   Generates structured outline with GEO targets
Agent 2 (Writer):    Writes each section with BLUF + varied structure
Agent 3 (Reviewer):  Checks content vs SEO rules, returns improved version
"""
import json, re, httpx
from config import get_settings

settings = get_settings()
_is_ollama = "ollama" in settings.LLM_BASE_URL.lower()
_base = settings.LLM_BASE_URL.rstrip("/")
_CHAT_URL = f"{_base}/chat" if _is_ollama else f"{_base}/chat/completions"


async def _chat(system: str, user: str, temperature: float = 0.7) -> str:
    headers = {"Content-Type": "application/json"}
    if settings.LLM_API_KEY and settings.LLM_API_KEY.lower() not in ("none", ""):
        headers["Authorization"] = f"Bearer {settings.LLM_API_KEY}"

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
        "stream": False,
        **({"options": {"temperature": temperature}} if _is_ollama else {"temperature": temperature, "max_tokens": 2048}),
    }

    async with httpx.AsyncClient(verify=False, timeout=120.0) as client:
        resp = await client.post(_CHAT_URL, json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()

    content = data["message"]["content"].strip() if _is_ollama else data["choices"][0]["message"]["content"].strip()
    return content


def _extract_json(text: str) -> dict | list:
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    for pattern in [r'\{[\s\S]*\}', r'\[[\s\S]*\]']:
        m = re.search(pattern, text)
        if m:
            try:
                return json.loads(m.group())
            except json.JSONDecodeError:
                pass
    raise ValueError(f"No JSON in response: {text[:200]}")


# ════════════════════════════════════════════════════════
# AGENT 1 — PLANNER
# ════════════════════════════════════════════════════════

PLANNER_SYSTEM = """You are a Lead SEO Content Planner. Output ONLY strict JSON. No explanation. No markdown fences. Start immediately with {"""

PLANNER_USER = """Plan a complete blog post for:

Topic: {topic}
Target Keywords: {keywords}

Return ONLY this JSON:
{{
  "title": "SEO H1 title, under 60 chars, keyword near start",
  "intent": "Informational",
  "focus_keyword": "main keyword",
  "entities": ["noun1", "noun2", "noun3", "noun4", "noun5"],
  "sections": [
    {{
      "heading": "heading text",
      "heading_level": 1,
      "order_index": 0,
      "geo_target": "specific question this answers",
      "format": "Narrative"
    }}
  ],
  "suggested_keywords": ["kw1", "kw2", "kw3"]
}}

Strict rules:
- Exactly ONE H1 (intro section), four to six H2s, optionally one to two H3s
- Last H2 must be "Frequently Asked Questions about {topic}"
- Each heading must match a real Google search query
- format choices: Narrative, BLUF+Narrative, List, Table"""


async def generate_outline(topic: str, keywords: list[str]) -> dict:
    kw_str = ", ".join(keywords) if keywords else "none"
    raw = await _chat(PLANNER_SYSTEM, PLANNER_USER.format(topic=topic, keywords=kw_str), temperature=0.5)
    return _extract_json(raw)


# ════════════════════════════════════════════════════════
# AGENT 2 — WRITER
# ════════════════════════════════════════════════════════

WRITER_SYSTEM = """You are a professional blog writer producing content for Google and AI search engines.

STRICT RULES:
- Write in 3rd-person authoritative tone for technical/informational content
- Never use: "delve", "tapestry", "ever-evolving", "game-changer", "certainly", "it's worth noting"
- Never use placeholder text like [INSERT DATA] — use approximate well-known figures or omit
- No meta-commentary. Start the section immediately.
- Vary sentence length: mix short (5-8 words) with medium (15-20 words) sentences
- Use concrete examples and real-world scenarios, not generic statements
- Do NOT include the heading in output"""

WRITER_USER = """Write blog section:

Post Topic: {topic}
Section Heading: {heading}
Format: {format}
Keywords to use naturally: {keywords}
This section answers: {geo_target}
{extra}

Structure your output EXACTLY like this:

**{heading}**
[One clear sentence that directly answers "{geo_target}". This is the hook.]

[Paragraph 1 — 60-80 words. Introduce the concept with a concrete real-world scenario or example. Short punchy sentences.]

[Paragraph 2 — 70-90 words. Go deeper. Explain mechanism or process. Include at least one specific technical detail or real example.]

[Paragraph 3 — 50-70 words. Practical implication or takeaway. Transition sentence to next topic.]

{data_block_instruction}"""

DATA_BLOCK_TABLE = """End with a comparison or summary table (3-4 columns, 3-5 rows). Use real approximate data, not placeholders."""
DATA_BLOCK_LIST = """End with a bulleted list of 4-5 specific, actionable points. Each point: one concrete action + brief reason why."""
DATA_BLOCK_NONE = ""


async def generate_section_content(
    topic: str, heading: str, keywords: list[str],
    extra_instructions: str = "", format: str = "BLUF+Narrative", geo_target: str = "",
) -> str:
    kw_str = ", ".join(keywords) if keywords else "general"
    extra = f"Additional focus: {extra_instructions}" if extra_instructions else ""
    if not geo_target:
        geo_target = f"What is {heading} and why does it matter?"

    # Choose data block based on format
    data_block = DATA_BLOCK_TABLE if "table" in format.lower() else \
                 DATA_BLOCK_LIST if "list" in format.lower() else \
                 DATA_BLOCK_LIST  # default to list

    raw = await _chat(
        WRITER_SYSTEM,
        WRITER_USER.format(
            topic=topic, heading=heading, format=format,
            keywords=kw_str, geo_target=geo_target, extra=extra,
            data_block_instruction=data_block,
        ),
        temperature=0.7,
    )

    # Agent 3 — Reviewer: check and improve the content
    reviewed = await _review_content(raw, heading, keywords, geo_target)
    return reviewed


# ════════════════════════════════════════════════════════
# AGENT 3 — SEO REVIEWER
# ════════════════════════════════════════════════════════

REVIEWER_SYSTEM = """You are an SEO Quality Reviewer. Your job is to improve written content.
Return ONLY the improved content — no commentary, no "Here is the improved version", no explanation."""

REVIEWER_USER = """Review and improve this blog section for SEO quality.

Section heading: {heading}
Target keywords: {keywords}
GEO target question: {geo_target}

CONTENT TO REVIEW:
{content}

IMPROVE by:
1. Remove any placeholder text like [INSERT DATA] — replace with realistic approximate figures if known, or rewrite the sentence without data
2. Replace robotic phrases ("From a technical standpoint", "Industry data shows") with natural alternatives
3. Ensure keywords appear naturally 2-3 times
4. Vary any repetitive sentence structures
5. Make sure the section directly answers: "{geo_target}"
6. Keep all tables and bullet lists but ensure data looks realistic

Return ONLY the improved content. Same format, same length approximately."""


async def _review_content(content: str, heading: str, keywords: list[str], geo_target: str) -> str:
    try:
        reviewed = await _chat(
            REVIEWER_SYSTEM,
            REVIEWER_USER.format(
                heading=heading,
                keywords=", ".join(keywords) if keywords else "none",
                geo_target=geo_target,
                content=content,
            ),
            temperature=0.4,
        )
        return reviewed if len(reviewed) > 100 else content
    except Exception:
        return content  # Fall back to original if reviewer fails


# ════════════════════════════════════════════════════════
# META GENERATOR
# ════════════════════════════════════════════════════════

META_SYSTEM = """You are an SEO meta-tag specialist. Return ONLY valid JSON starting with {"""

META_USER = """Topic: {topic}
Title: {title}
Focus Keyword: {focus_keyword}
Summary: {summary}

Return ONLY this JSON:
{{
  "meta_title": "under 60 chars, focus keyword near start, no clickbait",
  "meta_description": "under 155 chars, includes keyword, ends with action",
  "og_title": "under 95 chars",
  "og_description": "under 200 chars",
  "title_variations": [
    "How-to format: How to [achieve result] with [topic]",
    "Number format: X [Things/Ways/Steps] to [result]",
    "Question format: What is [topic] and [benefit]?"
  ]
}}"""


async def generate_meta(title: str, topic: str, focus_keyword: str, content_summary: str) -> dict:
    raw = await _chat(META_SYSTEM,
        META_USER.format(title=title, topic=topic, focus_keyword=focus_keyword, summary=content_summary[:400]),
        temperature=0.4)
    return _extract_json(raw)


# ════════════════════════════════════════════════════════
# INTERNAL LINK SUGGESTER
# ════════════════════════════════════════════════════════

LINKS_SYSTEM = """You are an internal linking SEO expert. Return ONLY a JSON array starting with ["""

LINKS_USER = """Topic: {topic}
Keywords: {keywords}
Excerpt: {excerpt}

Return ONLY a JSON array:
[{{"anchor_text": "phrase to link", "suggested_slug": "/url-slug", "reason": "why this link adds value"}}]
4 items maximum."""


async def suggest_internal_links(topic: str, keywords: list[str], content_excerpt: str) -> list:
    try:
        raw = await _chat(LINKS_SYSTEM,
            LINKS_USER.format(topic=topic, keywords=", ".join(keywords), excerpt=content_excerpt[:800]),
            temperature=0.3)
        result = _extract_json(raw)
        return result if isinstance(result, list) else []
    except Exception:
        return []
