import requests
from bs4 import BeautifulSoup
from slugify import slugify
import os
import sys
from datetime import datetime

# ========== CONFIG ==========

headers = {
    'User-Agent': 'Mozilla/5.0'
}

sources = [
    "https://banglachoti.live/",
    "https://www.banglachotix.com/",
    "https://www.banglachotikahinii.com/"
]

MAX_PAGES = 3  # default limit


# ========== STORY SCRAPER ==========

def scrape_story(url):
    try:
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')

        # Title
        title_tag = soup.select_one('h1.entry-title') or soup.select_one('h2.entry-title')
        title = title_tag.text.strip() if title_tag else 'No Title'

        # Content
        content_tag = soup.select_one('div.entry-content') or soup.select_one('div.td-post-content')
        content = content_tag.get_text(separator="\n").strip() if content_tag else ''

        # Date
        date_tag = soup.select_one('time.entry-date')
        date_str = date_tag.get('datetime') if date_tag else datetime.now().strftime("%Y-%m-%d")
        try:
            formatted_date = datetime.strptime(date_str[:10], "%Y-%m-%d").strftime("%d/%m/%Y")
        except:
            formatted_date = datetime.now().strftime("%d/%m/%Y")

        # Category
        cat_tag = soup.find('a', rel='category tag')
        category = cat_tag.text.strip() if cat_tag else "Uncategorized"

        # Tags
        tags = [tag.text.strip() for tag in soup.find_all('a', rel='tag')]
        tags_string = ", ".join(tags) if tags else "বাংলা,গল্প"

        return {
            "title": title,
            "content": content,
            "date": formatted_date,
            "url": url,
            "category": category,
            "tags": tags_string
        }

    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None


# ========== STORY SAVER ==========

def save_story(story):
    if not story or not story["title"]:
        print("⚠️ No story data to save.")
        return

    filename = slugify(story['title'])[:80] + ".md"
    filepath = os.path.join("src/stories", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    excerpt = story["content"][:200].replace("\n", " ").replace('"', "'")
    image_url = "https://placehold.co/600x400"  # Placeholder

    md = f"""---
title: "{story['title']}"
author: "Anonymous"
publishedDate: "{story['date']}"
category: "{story['category']}"
tags: [{', '.join([f'"{t.strip()}"' for t in story['tags'].split(',')])}]
imageUrl: "{image_url}"
excerpt: "{excerpt}..."
---

{story['content']}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(md)

    print(f"✅ Saved: {filepath}")


# ========== STORY LIST SCRAPER ==========

def scrape_listing_page(source, page=1):
    try:
        if "banglachotikahinii" in source:
            page_url = source + f"page/{page}/"
        else:
            page_url = source.rstrip("/") + f"/page/{page}/"

        r = requests.get(page_url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')

        links = [a['href'] for a in soup.select("h2.entry-title > a") if a.get('href')]
        return links
    except Exception as e:
        print(f"❌ Failed to get listing from {source} page {page}: {e}")
        return []


# ========== ENTRY POINT ==========

def main():
    args = sys.argv[1:]

    # From Telegram or Not
    from_telegram = args[0] == "telegram" if args else False
    base_url = args[1] if from_telegram else None
    page = int(args[2] if from_telegram else args[0] if args else 1)

    if page > MAX_PAGES:
        print(f"⚠️ Page {page} exceeds limit of {MAX_PAGES}. Skipping.")
        return

    sources_to_use = [base_url] if from_telegram and base_url else sources

    for src in sources_to_use:
        print(f"\n🌐 Source: {src} | Page: {page}")
        story_links = scrape_listing_page(src, page)

        if not story_links:
            print("⚠️ No stories found.")
            continue

        for story_url in story_links:
            story = scrape_story(story_url)
            save_story(story)


if __name__ == "__main__":
    main()
