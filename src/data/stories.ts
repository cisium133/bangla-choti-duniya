import { Story, StoryCategory } from '../types/story';
import { getViewCount, initializeViewCounts } from '../utils/viewTracker';

export const categories: StoryCategory[] = [
  { id: 'romance', name: 'প্রেমের গল্প', description: 'হৃদয়স্পর্শী প্রেমের কাহিনী', count: 15 },
  { id: 'adventure', name: 'রোমাঞ্চ', description: 'দুঃসাহসিক অভিযানের গল্প', count: 12 },
  { id: 'mystery', name: 'রহস্য', description: 'রহস্যময় ও রোমাঞ্চকর কাহিনী', count: 8 },
  { id: 'social', name: 'সামাজিক', description: 'সমাজের নানা সমস্যার গল্প', count: 10 },
  { id: 'historical', name: 'ঐতিহাসিক', description: 'ইতিহাসভিত্তিক কাহিনী', count: 6 },
  { id: 'fantasy', name: 'কল্পকাহিনী', description: 'কল্পনার জগতের গল্প', count: 9 },
  { id: 'adult', name: 'প্রাপ্তবয়স্ক', description: 'প্রাপ্তবয়স্কদের গল্প', count: 25 },
  { id: 'unknown', name: 'অন্যান্য', description: 'বিভিন্ন ধরনের গল্প', count: 50 }
];

// Parse frontmatter from markdown content
function parseFrontmatter(content: string): { metadata: any; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontmatterStr, markdownContent] = match;
  const metadata: any = {};
  
  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      
      // Parse arrays (tags)
      if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
        metadata[key.trim()] = cleanValue
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^["']|["']$/g, ''));
      } else if (cleanValue === 'true' || cleanValue === 'false') {
        metadata[key.trim()] = cleanValue === 'true';
      } else if (!isNaN(Number(cleanValue))) {
        metadata[key.trim()] = Number(cleanValue);
      } else {
        metadata[key.trim()] = cleanValue;
      }
    }
  });

  return { metadata, content: markdownContent };
}

// Convert markdown content to HTML (basic implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>');
}

// Strip HTML tags from text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Create stories from your markdown files
async function createStoriesFromMarkdown(): Promise<Story[]> {
  const stories: Story[] = [];
  
  try {
    // Try to load markdown files using dynamic imports
    const storyModules = import.meta.glob('/src/stories/*.md', { as: 'raw', eager: true });
    
    console.log('Loading stories from markdown files...');
    console.log('Found files:', Object.keys(storyModules));
    
    Object.entries(storyModules).forEach(([path, content], index) => {
      const filename = path.split('/').pop()?.replace('.md', '') || `story-${index}`;
      
      try {
        const { metadata, content: markdownContent } = parseFrontmatter(content);
        
        // Get clean excerpt from markdown content (not HTML)
        const cleanMarkdown = markdownContent.replace(/^#.*$/gm, '').trim(); // Remove headers  
        const cleanExcerpt = metadata.excerpt ? 
          stripHtml(metadata.excerpt) : 
          cleanMarkdown.substring(0, 300) + '...';
        
        const story: Story = {
          id: filename,
          title: stripHtml(metadata.title || 'অজানা গল্প'),
          excerpt: cleanExcerpt,
          content: stripHtml(markdownContent.replace(/^#+\s/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')),
          author: stripHtml(metadata.author || 'অজানা'),
          publishedDate: metadata.publishedDate || '2024-01-01',
          category: metadata.category || 'unknown',
          tags: Array.isArray(metadata.tags) ? metadata.tags : ['বাংলা', 'গল্প'],
          imageUrl: metadata.imageUrl || 'https://source.unsplash.com/800x600/?bangladesh',
          views: getViewCount(filename),
          featured: metadata.featured || false
        };
        
        console.log(`Story parsed:`, { title: story.title, tags: story.tags, isArray: Array.isArray(story.tags) });
        
        stories.push(story);
        console.log(`Loaded story: ${story.title}`);
      } catch (error) {
        console.error(`Error parsing story ${filename}:`, error);
      }
    });
    
    console.log(`Total stories loaded: ${stories.length}`);
    
    // Initialize view counts for all stories
    initializeViewCounts(stories.map(s => s.id));
  } catch (error) {
    console.error('Error loading markdown files:', error);
  }
  
  // Sort by date (newest first)
  return stories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
}

// Create a promise that resolves to stories
const storiesPromise = createStoriesFromMarkdown();

// Story functions
export async function getAllStories(): Promise<Story[]> {
  return await storiesPromise;
}

export async function getLatestStories(limit: number = 20): Promise<Story[]> {
  const stories = await storiesPromise;
  return stories.slice(0, limit);
}

export async function getFeaturedStories(): Promise<Story[]> {
  const stories = await storiesPromise;
  return stories.filter(story => story.featured);
}

export async function getStoriesByCategory(categoryId: string): Promise<Story[]> {
  const stories = await storiesPromise;
  return stories.filter(story => story.category === categoryId);
}

export async function searchStories(query: string): Promise<Story[]> {
  const stories = await storiesPromise;
  const lowercaseQuery = query.toLowerCase();
  return stories.filter(story => 
    story.title.toLowerCase().includes(lowercaseQuery) ||
    story.excerpt.toLowerCase().includes(lowercaseQuery) ||
    story.content.toLowerCase().includes(lowercaseQuery) ||
    story.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const stories = await storiesPromise;
  return stories.find(story => story.id === id);
}

export async function getRelatedStories(currentStory: Story, limit: number = 3): Promise<Story[]> {
  const stories = await storiesPromise;
  return stories
    .filter(story => 
      story.id !== currentStory.id && 
      (story.category === currentStory.category || 
       story.tags.some(tag => currentStory.tags.includes(tag)))
    )
    .slice(0, limit);
}