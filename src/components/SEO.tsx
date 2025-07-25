import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  structuredData?: object;
}

export const SEO = ({ 
  title = 'চটি দুনিয়া - বাংলা গল্পের সংগ্রহ',
  description = 'বাংলা ভাষার সেরা গল্পের সংগ্রহ। পড়ুন রোমাঞ্চকর, আবেগময় এবং চিন্তাশীল গল্প। বাংলা সাহিত্যের নতুন দিগন্ত আবিষ্কার করুন।',
  keywords = 'বাংলা গল্প, বাংলা সাহিত্য, গল্প, কাহিনী, বাংলা লেখা',
  image = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=630&fit=crop',
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  structuredData
}: SEOProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author || 'চটি দুনিয়া');
    
    // Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:image', image);
    updateMetaProperty('og:url', url);
    updateMetaProperty('og:type', type);
    updateMetaProperty('og:site_name', 'চটি দুনিয়া');
    updateMetaProperty('og:locale', 'bn_BD');
    
    // Twitter Card tags
    updateMetaName('twitter:card', 'summary_large_image');
    updateMetaName('twitter:title', title);
    updateMetaName('twitter:description', description);
    updateMetaName('twitter:image', image);
    
    // Article specific tags
    if (type === 'article') {
      updateMetaProperty('article:author', author || '');
      updateMetaProperty('article:published_time', publishedTime || '');
      updateMetaProperty('article:section', 'গল্প');
      updateMetaProperty('article:tag', keywords);
    }
    
    // Canonical URL
    updateCanonical(url);
    
    // Structured Data
    if (structuredData) {
      updateStructuredData(structuredData);
    }
    
  }, [title, description, keywords, image, url, type, author, publishedTime, structuredData]);

  return null;
};

function updateMetaTag(name: string, content: string) {
  if (!content) return;
  
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateMetaProperty(property: string, content: string) {
  if (!content) return;
  
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateMetaName(name: string, content: string) {
  if (!content) return;
  
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonical(url: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}