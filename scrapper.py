import os
import sys
import requests
import subprocess
import random
import time
from bs4 import BeautifulSoup
from slugify import slugify
from datetime import datetime

OUTPUT_DIR = "src/stories/"
headers = {'User-Agent': 'Mozilla/5.0'}

SOURCES = [
    {
        "name": "banglachoti.live",
        "base_url": "https://banglachoti.live",
        "page_limit": 3
    },
    {
        "name": "banglachotix.com",
        "base_url": "https://banglachotix.com",
        "page_limit": 3
    }
]

def get_story_links(base_url, pages):
    links = set()
    for i in pages:
        url = f"{base_url}/page/{i}/"
        print(f"[*] Scanning: {url}")
        try:
            r = requests.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(r.text, 'html.parser')
            for a in soup.select('article a'):
                href = a.get('href')
                if href and href.startswith('http') and base_url in href:
                    links.add(href)
        except Exception as e:
            print(f"[!] Error loading page {url}: {e}")
        time.sleep(random.uniform(1, 2))
    return list(links)

def scrape_story(url):
    r = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(r.text, 'html.parser')

    title_tag = soup.select_one('h1.entry-title') or soup.select_one('h2.entry-title')
    title = title_tag.text.strip() if title_tag else 'No Title'

    content_tag = soup.select_one('div.entry-content') or soup.select_one('div.td-post-content')
    content = content_tag.get_text(separator="\n").strip() if content_tag else ''

    date_tag = soup.select_one('time.entry-date')
    if date_tag and date_tag.has_attr("datetime"):
        raw_date = date_tag["datetime"]
        try:
            parsed_date = datetime.fromisoformat(raw_date.rstrip('Z')).strftime("%d/%m/%Y")
        except Exception:
            parsed_date = datetime.now().strftime("%d/%m/%Y")
    else:
        print(f"[!] No valid datetime found in {url}, skipping.")
        return None

    category_tag = soup.select_one('a[rel="category tag"]')
    category = category_tag.text.strip() if category_tag else "unknown"

    tag_elements = soup.select('a[rel="tag"]')
    tags = [tag.text.strip() for tag in tag_elements]
    tag_str = ",".join(tags)

    return {
        "title": title,
        "content": content,
        "date": parsed_date,
        "url": url,
        "category": category,
        "tags": tag_str
    }

def save_story(story, image_url):
    slug = slugify(story['title'])[:50]
    filename = f"{story['date'].replace('/', '-')}-{slug}.md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    if os.path.exists(filepath):
        print(f"[!] Skipped duplicate: {filename}")
        return None

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    excerpt = story['content'][:120].replace("\n", " ")

    md = f"""---
title: "{story['title']}"
author: "Anonymous"
publishedDate: "{story['date']}"
category: "{story['category']}"
tags: {story['tags']}
imageUrl: "{image_url}"
excerpt: "{excerpt}..."
---

{story['content']}
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"[✅] Saved: {filepath}")
    return filepath

def fetch_page_with_curl(url):
    try:
        result = subprocess.run(
            [
                "curl", "-sSL",
                "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "-H", "Accept-Language: en-US,en;q=0.9",
                url
            ],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"curl failed for {url}: {e}")
        return None

def extract_contenturl_srcs(html):
    soup = BeautifulSoup(html, 'html.parser')
    images = soup.find_all('img', itemprop='contentUrl')
    return [img.get('src') for img in images if img.get('src')]

def scrape_porn_images(required_count):
    images = []
    page = 1
    while len(images) < required_count:
        url = f"https://www.indianpornpics.pro/en/hot/{page}"
        html = fetch_page_with_curl(url)
        if html:
            new_imgs = extract_contenturl_srcs(html)
            images.extend(new_imgs)
        page += 1
    return images[:required_count]

def parse_range(pagestr):
    if '-' in pagestr:
        start, end = pagestr.split('-')
        return list(range(int(start), int(end) + 1))
    else:
        return [int(pagestr)]

def run_telegram_mode(url, page_str):
    pages = parse_range(page_str)
    story_links = get_story_links(url, pages)
    images = scrape_porn_images(len(story_links))
    for idx, link in enumerate(story_links):
        try:
            story = scrape_story(link)
            if not story:
                continue
            save_story(story, images[idx])
        except Exception as e:
            print(f"[!] Error scraping {link}: {e}")

def run_custom_page_mode(page_num):
    all_links = []
    for source in SOURCES:
        links = get_story_links(source['base_url'], [int(page_num)])
        all_links.extend(links)

    images = scrape_porn_images(len(all_links))
    for idx, link in enumerate(all_links):
        try:
            story = scrape_story(link)
            if not story:
                continue
            save_story(story, images[idx])
        except Exception as e:
            print(f"[!] Error scraping {link}: {e}")

def run_default_mode():
    all_links = []
    for source in SOURCES:
        links = get_story_links(source['base_url'], list(range(1, source['page_limit'] + 1)))
        all_links.extend(links)

    images = scrape_porn_images(len(all_links))
    for idx, link in enumerate(all_links):
        try:
            story = scrape_story(link)
            if not story:
                continue
            save_story(story, images[idx])
        except Exception as e:
            print(f"[!] Error scraping {link}: {e}")

def main():
    args = sys.argv

    if len(args) == 4 and args[1] == "telegram":
        url = args[2]
        page_range = args[3]
        print(f"[📨] Telegram mode: {url} | pages: {page_range}")
        run_telegram_mode(url, page_range)

    elif len(args) == 2 and args[1].isdigit():
        page_num = args[1]
        print(f"[📄] Custom page mode: scraping page {page_num} from all sources")
        run_custom_page_mode(page_num)

    else:
        print(f"[🚀] Default mode: scraping 3 pages per source")
        run_default_mode()

if __name__ == "__main__":
    main()
