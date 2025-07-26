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

MAX_PAGES = 100  # Increased limit to allow more pages


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
    images = set()  # Use set to avoid duplicates
    page = 1
    max_pages = 50  # Prevent infinite loop
    
    print(f"🔍 Scraping unique images (need {required_count})...")
    
    while len(images) < required_count and page <= max_pages:
        url = f"https://www.indianpornpics.pro/en/hot/{page}"
        print(f"  📄 Checking page {page}... (found {len(images)} unique images)")
        
        html = fetch_page_with_curl(url)
        if html:
            new_imgs = extract_contenturl_srcs(html)
            if new_imgs:
                # Add only new unique images
                before_count = len(images)
                for img in new_imgs:
                    if img and img.startswith(('http://', 'https://')):
                        images.add(img)
                print(f"    ➕ Added {len(images) - before_count} new unique images")
            else:
                print(f"    ⚠️ No images found on page {page}")
        else:
            print(f"    ❌ Failed to fetch page {page}")
        
        page += 1
        
        # If we haven't found new images in several pages, try different sources
        if page > 10 and len(images) < required_count // 2:
            print("  🔄 Trying additional image sources...")
            # Try different category pages
            for category in ['amateur', 'indian', 'asian', 'girls']:
                cat_url = f"https://www.indianpornpics.pro/en/{category}/{page}"
                html = fetch_page_with_curl(cat_url)
                if html:
                    new_imgs = extract_contenturl_srcs(html)
                    for img in new_imgs:
                        if img and img.startswith(('http://', 'https://')):
                            images.add(img)
                if len(images) >= required_count:
                    break
    
    unique_images = list(images)
    print(f"✅ Collected {len(unique_images)} unique images")
    
    # If we still don't have enough, generate some placeholder variations
    if len(unique_images) < required_count:
        print(f"⚠️ Only found {len(unique_images)} unique images, adding placeholder variations...")
        for i in range(len(unique_images), required_count):
            # Create unique placeholder URLs with different dimensions/colors
            width = 600 + (i % 5) * 50  # 600, 650, 700, 750, 800
            height = 400 + (i % 4) * 50  # 400, 450, 500, 550
            color = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8'][i % 5]
            unique_images.append(f"https://placehold.co/{width}x{height}/{color}/FFFFFF")
    
    return unique_images[:required_count]


def parse_range(pagestr):
    if '-' in pagestr:
        start, end = pagestr.split('-')
        return list(range(int(start), int(end) + 1))
    else:
        return [int(pagestr)]


# ========= STORY SCRAPER ==========

# Global image pool to ensure each story gets a unique image
IMAGE_POOL = []
IMAGE_INDEX = 0

def get_image_pool(required_count):
    """Get a pool of unique images to use for stories"""
    global IMAGE_POOL
    if len(IMAGE_POOL) < required_count:
        print(f"🖼️ Need {required_count} unique images for stories...")
        IMAGE_POOL = scrape_porn_images(required_count)
        # Shuffle the images to add randomness
        import random
        random.shuffle(IMAGE_POOL)
        print(f"✅ Loaded and shuffled {len(IMAGE_POOL)} unique images")
    return IMAGE_POOL

def get_next_image():
    """Get the next unique image from the pool"""
    global IMAGE_POOL, IMAGE_INDEX
    
    if not IMAGE_POOL:
        return "https://placehold.co/600x400"
    
    if IMAGE_INDEX >= len(IMAGE_POOL):
        print("⚠️ Ran out of unique images, cycling back (this shouldn't happen)")
        IMAGE_INDEX = 0
    
    image = IMAGE_POOL[IMAGE_INDEX]
    IMAGE_INDEX += 1
    
    print(f"  🖼️ Assigned image {IMAGE_INDEX}/{len(IMAGE_POOL)}: {image[:50]}...")
    return image

def extract_image_from_story(soup, base_url):
    """Extract the main image from the story content, with fallback to image pool"""
    # Try to find featured image
    featured_img = soup.select_one('img.wp-post-image') or soup.select_one('img.attachment-thumbnail')
    if featured_img and featured_img.get('src'):
        img_url = urljoin(base_url, featured_img['src'])
        if img_url and img_url != base_url:  # Ensure it's a valid image URL
            return img_url
    
    # Try to find first image in content
    content_imgs = soup.select('div.entry-content img, div.td-post-content img')
    for img in content_imgs:
        src = img.get('src') or img.get('data-src')
        if src:
            img_url = urljoin(base_url, src)
            if img_url and img_url != base_url:
                return img_url
    
    # Try meta og:image
    og_image = soup.select_one('meta[property="og:image"]')
    if og_image and og_image.get('content'):
        img_url = urljoin(base_url, og_image['content'])
        if img_url and img_url != base_url:
            return img_url
    
    # Fallback to image from pool
    return get_next_image()


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

    # More flexible page limit handling
    if page > MAX_PAGES:
        print(f"⚠️ Page {page} exceeds limit of {MAX_PAGES}.")
        user_input = input(f"Do you want to proceed anyway? (y/n): ").lower().strip()
        if user_input != 'y' and user_input != 'yes':
            print("Operation cancelled.")
            return
        else:
            print(f"✅ Proceeding with page {page}...")

    sources_to_use = [base_url] if from_telegram and base_url else sources

    # First, count total stories we'll process to pre-load images
    total_stories = 0
    all_story_links = []
    
    for src in sources_to_use:
        print(f"\n🔍 Scanning source: {src} | Page: {page}")
        story_links = scrape_listing_page(src, page)
        if story_links:
            all_story_links.extend([(src, link) for link in story_links])
            total_stories += len(story_links)
    
    if total_stories == 0:
        print("⚠️ No stories found across all sources.")
        return
    
    # Pre-load image pool with exact number needed (no extras to avoid confusion)
    print(f"\n📊 Found {total_stories} total stories")
    get_image_pool(total_stories)
    
    # Process all stories
    story_count = 0
    for src, story_url in all_story_links:
        story_count += 1
        print(f"\n📖 [{story_count}/{total_stories}] Processing: {story_url}")
        print(f"🌐 Source: {src}")
        story = scrape_story(story_url)
        if story:
            save_story(story)
        else:
            print(f"⚠️ Failed to scrape story from {story_url}")
    
    print(f"\n🎉 Finished processing {story_count} stories with unique images!")


if __name__ == "__main__":
    main()
