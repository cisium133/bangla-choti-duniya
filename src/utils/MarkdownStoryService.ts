import { Story } from '@/types/story';

export interface MarkdownStory {
  metadata: {
    title: string;
    author: string;
    publishedDate: string;
    category: string;
    tags: string[];
    imageUrl: string;
    readingTime: number;
    featured: boolean;
    excerpt: string;
  };
  content: string;
  filename: string;
}

export class MarkdownStoryService {
  private static storiesCache: Story[] | null = null;

  // Parse frontmatter from markdown content
  private static parseFrontmatter(content: string): { metadata: any; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      throw new Error('Invalid markdown format: missing frontmatter');
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
  private static markdownToHtml(markdown: string): string {
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

  // Load all stories from markdown files using Vite's glob import
  static async loadStories(): Promise<Story[]> {
    if (this.storiesCache) {
      return this.storiesCache;
    }

    const stories: Story[] = [];

    try {
      // Use Vite's glob import to get all markdown files
      const modules = import.meta.glob('/src/stories/*.md', { as: 'raw' });
      
      console.log('Found markdown files:', Object.keys(modules));
      
      let storyIndex = 1;
      
      for (const [path, moduleLoader] of Object.entries(modules)) {
        const filename = path.split('/').pop() || '';
        
        try {
          const content = await moduleLoader();
          console.log(`Loading ${filename}, content length:`, content.length);
          
          const { metadata, content: markdownContent } = this.parseFrontmatter(content);
          console.log(`Parsed metadata for ${filename}:`, metadata);
          
          const story: Story = {
            id: filename.replace('.md', ''),
            title: metadata.title || 'Untitled',
            excerpt: metadata.excerpt || markdownContent.substring(0, 100) + '...',
            content: this.markdownToHtml(markdownContent),
            author: metadata.author || 'Anonymous',
            publishedDate: metadata.publishedDate || new Date().toISOString().split('T')[0],
            category: metadata.category || 'unknown',
            tags: metadata.tags || [],
            imageUrl: metadata.imageUrl || 'https://source.unsplash.com/800x600/?bangladesh',
            views: metadata.views || 0,
            featured: metadata.featured || false
          };
          
          stories.push(story);
          console.log(`Added story: ${story.title}`);
        } catch (error) {
          console.warn(`Could not load story file: ${filename}`, error);
        }
      }
      
      console.log(`Total stories loaded: ${stories.length}`);
    } catch (error) {
      console.error('Error loading stories from markdown files:', error);
    }

    // Sort stories by published date (newest first)
    stories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

    this.storiesCache = stories;
    return stories;
  }

  // Save story to markdown file (for admin editing)
  static async saveStory(story: Story, filename?: string): Promise<void> {
    const storyFilename = filename || `story-${story.id}.md`;
    
    const frontmatter = [
      '---',
      `title: "${story.title}"`,
      `author: "${story.author}"`,
      `publishedDate: "${story.publishedDate}"`,
      `category: "${story.category}"`,
      `tags: [${story.tags.map(tag => `"${tag}"`).join(', ')}]`,
      `imageUrl: "${story.imageUrl}"`,
      `views: ${story.views}`,
      `featured: ${story.featured}`,
      `excerpt: "${story.excerpt}"`,
      '---',
      ''
    ].join('\n');

    // Convert HTML back to markdown (basic implementation)
    const markdownContent = story.content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1') 
      .replace(/<h3>(.*?)<\/h3>/g, '### $1')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/\n\n$/, '');

    const fullContent = frontmatter + markdownContent;
    
    // In a real implementation, this would save to the file system
    console.log(`Would save to ${storyFilename}:`, fullContent);
    
    // Invalidate cache
    this.storiesCache = null;
  }

  // Delete story file
  static async deleteStory(storyId: string): Promise<void> {
    try {
      // Since we can't actually delete files from the browser,
      // we'll simulate deletion by removing from cache and showing success
      console.log(`Deleting story file for ID: ${storyId}`);
      
      // In a real backend implementation, this would make an API call to delete the file:
      // await fetch(`/api/stories/${storyId}`, { method: 'DELETE' });
      
      // For now, we'll simulate success and remove from cache
      if (this.storiesCache) {
        this.storiesCache = this.storiesCache.filter(story => story.id !== storyId);
      }
      
      // Note: To actually delete MD files, you would need a backend API
      // that can perform file system operations
      
    } catch (error) {
      console.error('Error deleting story:', error);
      throw new Error('Failed to delete story');
    }
  }

  // Clear cache to force reload
  static clearCache(): void {
    this.storiesCache = null;
  }
}