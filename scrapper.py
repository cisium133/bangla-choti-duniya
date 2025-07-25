import requests
from bs4 import BeautifulSoup
from slugify import slugify
import os
import sys
import subprocess
from datetime import datetime
from urllib.parse import urljoin, urlparse
import random

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

sources = [
    "https://banglachoti.live/",
    "https://www.banglachotix.com/",
    "https://www.banglachotikahinii.com/"
]

MAX_PAGES = 3


# ========= CURL IMAGE SCRAPER ==========

def fetch_page_with_curl(url):
    try:
        result = subprocess.run(
            [
                "curl",
                "-sSL",
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


# ========= STORY SCRAPER ==========

def extract_image_from_story(soup, base_url):
    """Extract the main image from the story content"""
    # Try to find featured image
    featured_img = soup.select_one('img.wp-post-image') or soup.select_one('img.attachment-thumbnail')
    if featured_img and featured_img.get('src'):
        return urljoin(base_url, featured_img['src'])
    
    # Try to find first image in content
    content_imgs = soup.select('div.entry-content img, div.td-post-content img')
    for img in content_imgs:
        src = img.get('src') or img.get('data-src')
        if src:
            return urljoin(base_url, src)
    
    # Try meta og:image
    og_image = soup.select_one('meta[property="og:image"]')
    if og_image and og_image.get('content'):
        return urljoin(base_url, og_image['content'])
    
    # Fallback to placeholder
    return "https://placehold.co/600x400"


def normalize_url(url, base_url):
    """Ensure URL is absolute and properly formatted"""
    if not url:
        return None
    
    # If it's already absolute, return as is
    if url.startswith(('http://', 'https://')):
        return url
    
    # If it starts with //, add protocol
    if url.startswith('//'):
        return 'https:' + url
    
    # Otherwise, join with base URL
    return urljoin(base_url, url)


def scrape_story(url):
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()  # Raise exception for bad status codes
        soup = BeautifulSoup(r.text, 'html.parser')

        # Extract title
        title_selectors = [
            'h1.entry-title',
            'h2.entry-title', 
            'h1.post-title',
            'h1.title',
            '.post-title h1',
            'article h1'
        ]
        title = 'No Title'
        for selector in title_selectors:
            title_tag = soup.select_one(selector)
            if title_tag:
                title = title_tag.get_text().strip()
                break

        # Extract content
        content_selectors = [
            'div.entry-content',
            'div.td-post-content',
            'div.post-content',
            'article .content',
            '.story-content'
        ]
        content = ''
        for selector in content_selectors:
            content_tag = soup.select_one(selector)
            if content_tag:
                # Remove script and style elements
                for script in content_tag(["script", "style"]):
                    script.decompose()
                content = content_tag.get_text(separator="\n").strip()
                break

        # Extract date
        date_selectors = [
            'time.entry-date',
            'time.published',
            '.post-date time',
            'meta[property="article:published_time"]'
        ]
        date_str = None
        for selector in date_selectors:
            date_tag = soup.select_one(selector)
            if date_tag:
                date_str = date_tag.get('datetime') or date_tag.get('content') or date_tag.get_text()
                break
        
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
        
        try:
            # Handle various date formats
            if 'T' in date_str:
                date_str = date_str.split('T')[0]
            formatted_date = datetime.strptime(date_str[:10], "%Y-%m-%d").strftime("%d/%m/%Y")
        except:
            formatted_date = datetime.now().strftime("%d/%m/%Y")

        # Extract category
        category_selectors = [
            'a[rel="category tag"]',
            '.post-category a',
            '.category a',
            'meta[property="article:section"]'
        ]
        category = "Uncategorized"
        for selector in category_selectors:
            cat_tag = soup.select_one(selector)
            if cat_tag:
                category = cat_tag.get('content') or cat_tag.get_text().strip()
                break

        # Extract tags
        tag_selectors = [
            'a[rel="tag"]',
            '.post-tags a',
            '.tags a'
        ]
        tags = []
        for selector in tag_selectors:
            tag_elements = soup.select(selector)
            tags.extend([tag.get_text().strip() for tag in tag_elements])
        
        tags_string = ", ".join(tags) if tags else "বাংলা,গল্প"

        # Extract image
        base_url = f"{urlparse(url).scheme}://{urlparse(url).netloc}"
        image_url = extract_image_from_story(soup, base_url)

        return {
            "title": title,
            "content": content,
            "date": formatted_date,
            "url": url,
            "category": category,
            "tags": tags_string,
            "image_url": image_url
        }

    except requests.RequestException as e:
        print(f"❌ Network error scraping {url}: {e}")
        return None
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None


def save_story(story):
    if not story or not story["title"]:
        print("⚠️ No story data to save.")
        return

    # Clean title for filename
    clean_title = story['title'].replace('"', '').replace("'", "").replace('\n', ' ')
    filename = slugify(clean_title)[:80] + ".md"
    filepath = os.path.join("src/stories", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)

    # Create excerpt
    excerpt = story["content"][:200].replace("\n", " ").replace('"', "'").strip()
    if not excerpt.endswith('.'):
        excerpt += "..."

    # Use extracted image URL
    image_url = story.get("image_url", "https://placehold.co/600x400")

    # Format tags properly
    tag_list = [f'"{t.strip()}"' for t in story['tags'].split(',') if t.strip()]

    md = f"""---
title: "{clean_title}"
author: "Anonymous"
publishedDate: "{story['date']}"
category: "{story['category']}"
tags: [{', '.join(tag_list)}]
imageUrl: "{image_url}"
excerpt: "{excerpt}"
---

{story['content']}
"""
    
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md)
        print(f"✅ Saved: {filepath}")
    except Exception as e:
        print(f"❌ Error saving {filepath}: {e}")


def scrape_listing_page(source, page=1):
    try:
        # Handle different URL structures
        if "banglachotikahinii" in source:
            page_url = source.rstrip("/") + f"/page/{page}/"
        else:
            page_url = source.rstrip("/") + f"/page/{page}/"

        print(f"🔍 Fetching: {page_url}")
        
        r = requests.get(page_url, headers=headers, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')

        # Try multiple selectors for story links
        link_selectors = [
            "h2.entry-title > a",
            "h3.entry-title > a", 
            ".post-title > a",
            "h2 > a[href*='/']",
            "h3 > a[href*='/']",
            ".story-title a"
        ]
        
        links = []
        for selector in link_selectors:
            found_links = soup.select(selector)
            if found_links:
                base_url = f"{urlparse(source).scheme}://{urlparse(source).netloc}"
                for link in found_links:
                    href = link.get('href')
                    if href:
                        full_url = normalize_url(href, base_url)
                        if full_url and full_url not in links:
                            links.append(full_url)
                break
        
        print(f"📄 Found {len(links)} story links")
        return links
        
    except requests.RequestException as e:
        print(f"❌ Network error fetching listing from {source} page {page}: {e}")
        return []
    except Exception as e:
        print(f"❌ Failed to get listing from {source} page {page}: {e}")
        return []


def main():
    args = sys.argv[1:]
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

        print(f"📚 Processing {len(story_links)} stories...")
        for i, story_url in enumerate(story_links, 1):
            print(f"[{i}/{len(story_links)}] Processing: {story_url}")
            story = scrape_story(story_url)
            if story:
                save_story(story)
            else:
                print(f"⚠️ Failed to scrape story from {story_url}")


if __name__ == "__main__":
    main()
