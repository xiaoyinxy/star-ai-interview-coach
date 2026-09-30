"""Scrape work/project experiences from upcv.tech resume samples via API."""
import json
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE = "https://upcv.tech"
API = f"{BASE}/api/samples"
OUTPUT = Path(__file__).parent / "产品经理简历经历汇总.md"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}


def fetch_json(url, params=None):
    for attempt in range(3):
        try:
            r = requests.get(url, headers=HEADERS, params=params, timeout=30)
            r.raise_for_status()
            r.encoding = "utf-8"
            return r.json()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(1)


def get_all_samples(tag_id=6, page_size=12):
    """Fetch all samples for a tag, handling pagination."""
    all_items = []
    page = 1
    total = None
    while True:
        data = fetch_json(API, params={
            "tagIds[]": tag_id,
            "page": page,
            "pageSize": page_size,
        })
        items = data.get("data") or []
        total = data.get("total", total)
        all_items.extend(items)
        if not items or len(all_items) >= (total or 0):
            break
        page += 1
    return all_items[:total] if total else all_items


def get_sample_detail(sample_id: int) -> dict:
    return fetch_json(f"{BASE}/api/samples/by-id/{sample_id}")


def html_to_paragraphs(html_text: str) -> list[str]:
    if not html_text:
        return []
    soup = BeautifulSoup(html_text, "html.parser")
    lines = [li.get_text(strip=True) for li in soup.find_all("li")]
    lines = [t for t in lines if t]
    if lines:
        return lines
    text = soup.get_text("\n", strip=True)
    return [p.strip() for p in text.split("\n") if p.strip()]


def normalize_company(name: str) -> str:
    name = (name or "").strip()
    personal = {"个人独立项目", "个人项目", "独立项目", "个人", "个人实践项目", "自主项目"}
    if not name or name in personal:
        return "个人项目"
    return name


def normalize_position(title: str) -> str:
    title = (title or "").strip()
    return title if title else "产品助理"


def format_experience(exp: dict) -> str:
    exp_type = (exp.get("type") or "").lower()
    is_project = exp_type in ("project", "projects")
    company = normalize_company(exp.get("organization") or exp.get("company") or "")
    if is_project:
        position = normalize_position(exp.get("position") or "")
    else:
        position = normalize_position(exp.get("title") or exp.get("position") or "")
    bullets = html_to_paragraphs(exp.get("description") or "")
    desc = "\n\n".join(bullets)
    return f"**{company}\t{position}**\n\n{desc}"


def extract_experiences(sample: dict) -> str:
    resume = sample.get("resumeData") or {}
    experiences = resume.get("experiences") or []
    work_types = {"work", "internship", "volunteer", "parttime", "fulltime"}
    project_types = {"project", "projects"}
    blocks = []
    for exp in experiences:
        if not isinstance(exp, dict):
            continue
        t = (exp.get("type") or "").lower()
        if t in work_types or t in project_types:
            block = format_experience(exp)
            if block.strip():
                blocks.append(block)
    return "\n\n".join(blocks)


def main():
    print("Fetching sample list from API...")
    samples = get_all_samples(tag_id=6, page_size=12)
    print(f"Found {len(samples)} samples")

    sections = []
    for i, sample in enumerate(samples, 1):
        sid = sample["id"]
        title = sample.get("title", str(sid))
        url = f"{BASE}/jianlifanwen/{sid}.html"
        print(f"[{i}/{len(samples)}] {sid} {title[:40]}")

        if not sample.get("resumeData"):
            sample = get_sample_detail(sid)

        body = extract_experiences(sample)
        section = f"## {title}\n\n来源：{url}\n\n{body if body else '（未找到工作经历或项目经历）'}"
        sections.append(section)
        time.sleep(0.1)

    content = f"# 产品经理简历工作经历与项目经历汇总\n\n共爬取 {len(samples)} 篇简历范文\n\n"
    content += "\n\n---\n\n".join(sections) + "\n"
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"Saved to {OUTPUT}")


if __name__ == "__main__":
    main()
