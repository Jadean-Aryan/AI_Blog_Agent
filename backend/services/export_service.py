"""
Export Service — Markdown and styled HTML with Jade Global branding.
"""
import re
from datetime import datetime


def _heading_marker(level: int) -> str:
    return "#" * level


def _markdown_to_html_content(text: str) -> str:
    """Convert basic markdown in section content to HTML."""
    if not text:
        return ""
    # Bold
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Tables
    lines = text.split('\n')
    html_lines = []
    in_table = False
    for line in lines:
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                html_lines.append('<div class="table-wrap"><table>')
                in_table = True
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if all(re.match(r'^[-:]+$', c.replace(' ', '')) for c in cells if c):
                html_lines.append('<tbody>')
                continue
            tag = 'th' if not any('<tbody>' in l for l in html_lines[-5:]) else 'td'
            html_lines.append('<tr>' + ''.join(f'<{tag}>{c}</{tag}>' for c in cells) + '</tr>')
        else:
            if in_table:
                html_lines.append('</table></div>')
                in_table = False
            if line.strip():
                html_lines.append(f'<p>{line}</p>')
    if in_table:
        html_lines.append('</table></div>')
    return '\n'.join(html_lines)


def to_markdown(post_title, sections, meta=None, seo=None):
    lines = ["---"]
    lines.append(f'title: "{post_title}"')
    if meta:
        if meta.get("meta_description"):
            lines.append(f'description: "{meta["meta_description"]}"')
        if meta.get("focus_keyword"):
            lines.append(f'keywords: "{meta["focus_keyword"]}"')
    lines.append(f'date: "{datetime.utcnow().strftime("%Y-%m-%d")}"')
    if seo:
        lines.append(f'seo_score: {seo.get("overall_seo_score", 0)}')
    lines.append("---\n")

    for section in sorted(sections, key=lambda s: s["order_index"]):
        level = section.get("heading_level", 2)
        heading = section["heading"]
        content = section.get("content") or "*[Content not generated yet]*"
        lines.append(f'{_heading_marker(level)} {heading}\n')
        lines.append(content)
        lines.append("")

    return "\n".join(lines)


def to_html(post_title, sections, meta=None, seo=None):
    meta_tags = f'  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    meta_tags += f'  <title>{post_title}</title>\n'
    if meta:
        if meta.get("meta_description"):
            meta_tags += f'  <meta name="description" content="{meta["meta_description"]}">\n'
        if meta.get("focus_keyword"):
            meta_tags += f'  <meta name="keywords" content="{meta["focus_keyword"]}">\n'
        if meta.get("og_title"):
            meta_tags += f'  <meta property="og:title" content="{meta["og_title"]}">\n'

    body_parts = []
    for section in sorted(sections, key=lambda s: s["order_index"]):
        level = section.get("heading_level", 2)
        heading = section["heading"]
        content = section.get("content") or ""
        body_parts.append(f'    <h{level}>{heading}</h{level}>')
        if content:
            body_parts.append(_markdown_to_html_content(content))

    body = "\n".join(body_parts)
    seo_score = seo.get("overall_seo_score", 0) if seo else 0
    flesch = seo.get("flesch_reading_ease", 0) if seo else 0
    read_time = seo.get("reading_time_minutes", 0) if seo else 0

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{meta_tags}
  <style>
    :root {{
      --bg: #f8f9fa;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #1a202c;
      --text-secondary: #4a5568;
      --accent: #5b21b6;
      --accent-light: #ede9fe;
      --green: #059669;
      --amber: #d97706;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Georgia', serif; background: var(--bg); color: var(--text); line-height: 1.8; }}
    .page-wrap {{ max-width: 820px; margin: 0 auto; padding: 40px 24px; }}

    /* Header */
    .doc-header {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 28px 32px; margin-bottom: 36px; display: flex; justify-content: space-between; align-items: center; }}
    .brand {{ display: flex; align-items: center; gap: 10px; }}
    .brand-logo {{ width: 36px; height: 36px; background: var(--accent); border-radius: 8px; display: flex; align-items: center; justify-content: center; }}
    .brand-logo svg {{ width: 20px; height: 20px; fill: white; }}
    .brand-name {{ font-family: sans-serif; font-weight: 700; color: var(--accent); font-size: 18px; letter-spacing: -0.5px; }}
    .brand-sub {{ font-family: sans-serif; font-size: 11px; color: var(--text-secondary); }}
    .doc-meta {{ text-align: right; font-family: sans-serif; font-size: 12px; color: var(--text-secondary); }}
    .seo-pill {{ display: inline-block; background: {'var(--accent-light)' if seo_score >= 70 else '#fef3c7' if seo_score >= 45 else '#fee2e2'}; color: {'var(--accent)' if seo_score >= 70 else '#92400e' if seo_score >= 45 else '#991b1b'}; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; margin-top: 4px; }}

    /* Content */
    .content {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 40px 48px; }}
    h1 {{ font-size: 2rem; color: var(--text); margin: 0 0 24px; line-height: 1.3; border-bottom: 2px solid var(--accent-light); padding-bottom: 16px; }}
    h2 {{ font-size: 1.4rem; color: var(--accent); margin: 36px 0 14px; }}
    h3 {{ font-size: 1.15rem; color: var(--text); margin: 24px 0 10px; }}
    p {{ margin: 0 0 14px; color: var(--text-secondary); }}
    strong {{ color: var(--text); font-weight: 600; }}

    /* Tables */
    .table-wrap {{ overflow-x: auto; margin: 20px 0; border-radius: 8px; border: 1px solid var(--border); }}
    table {{ width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 14px; }}
    th {{ background: var(--accent-light); color: var(--accent); font-weight: 600; padding: 10px 14px; text-align: left; }}
    td {{ padding: 10px 14px; border-top: 1px solid var(--border); color: var(--text-secondary); }}
    tr:hover td {{ background: #fafafa; }}

    /* Footer */
    .doc-footer {{ text-align: center; margin-top: 32px; font-family: sans-serif; font-size: 12px; color: var(--text-secondary); }}
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="doc-header">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <div class="brand-name">BlogForge</div>
          <div class="brand-sub">by Jade Global</div>
        </div>
      </div>
      <div class="doc-meta">
        <div>Generated {datetime.utcnow().strftime("%B %d, %Y")}</div>
        <div>Read time: {read_time} min</div>
        <div class="seo-pill">SEO Score: {seo_score}/100</div>
      </div>
    </div>

    <div class="content">
{body}
    </div>

    <div class="doc-footer">
      Generated by BlogForge AI · Jade Global · {datetime.utcnow().strftime("%Y")}
    </div>
  </div>
</body>
</html>"""
