import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileEdit, Plus, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { MarkdownStoryService } from '@/utils/MarkdownStoryService';
import { Story } from '@/types/story';

interface StoryScraperProps {
  onStoryAdd: (story: Story) => void;
}

export const StoryScraper = ({ onStoryAdd }: StoryScraperProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editedStory, setEditedStory] = useState<Partial<Story>>({
    title: '',
    author: '',
    excerpt: '',
    content: '',
    category: 'general',
    tags: [],
    imageUrl: '',
    views: 0,
    featured: false,
    publishedDate: new Date().toISOString().split('T')[0]
  });

  const handleCreateStory = async () => {
    if (!editedStory.title?.trim() || !editedStory.content?.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in at least title and content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newStory: Story = {
        id: `story-${Date.now()}`,
        title: editedStory.title || '',
        excerpt: editedStory.excerpt || editedStory.content?.substring(0, 150) + '...' || '',
        content: editedStory.content || '',
        author: editedStory.author || 'Unknown',
        publishedDate: editedStory.publishedDate || new Date().toISOString().split('T')[0],
        category: editedStory.category || 'general',
        tags: editedStory.tags || [],
        imageUrl: editedStory.imageUrl || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        views: editedStory.views || 0,
        featured: editedStory.featured || false
      };
      
      await MarkdownStoryService.saveStory(newStory);
      onStoryAdd(newStory);
      
      setEditedStory({
        title: '',
        author: '',
        excerpt: '',
        content: '',
        category: 'general',
        tags: [],
        imageUrl: '',
        views: 0,
        featured: false,
        publishedDate: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Story Created",
        description: "Story has been saved to your collection",
      });
      
    } catch (error) {
      console.error('Story creation error:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagInput = (tagInput: string) => {
    const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setEditedStory(prev => ({ ...prev, tags }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="w-5 h-5" />
          Create New Story
        </CardTitle>
        <CardDescription>
          Add a new story to your collection by filling out the form below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Story title"
              value={editedStory.title || ''}
              onChange={(e) => setEditedStory(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              placeholder="Author name"
              value={editedStory.author || ''}
              onChange={(e) => setEditedStory(prev => ({ ...prev, author: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            placeholder="Brief description of the story"
            value={editedStory.excerpt || ''}
            onChange={(e) => setEditedStory(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Full story content"
            value={editedStory.content || ''}
            onChange={(e) => setEditedStory(prev => ({ ...prev, content: e.target.value }))}
            rows={10}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="w-full p-2 border border-input rounded-md"
              value={editedStory.category || 'general'}
              onChange={(e) => setEditedStory(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="romantic">Romantic</option>
              <option value="family">Family</option>
              <option value="childhood">Childhood</option>
              <option value="social">Social</option>
              <option value="memories">Memories</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="views">Initial Views</Label>
            <Input
              id="views"
              type="number"
              min="0"
              value={editedStory.views || 0}
              onChange={(e) => setEditedStory(prev => ({ ...prev, views: parseInt(e.target.value) }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="featured">Featured</Label>
            <div className="flex items-center space-x-2 pt-2">
              <input
                id="featured"
                type="checkbox"
                checked={editedStory.featured || false}
                onChange={(e) => setEditedStory(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <Label htmlFor="featured" className="text-sm">Mark as featured story</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="tag1, tag2, tag3"
            value={editedStory.tags?.join(', ') || ''}
            onChange={(e) => handleTagInput(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            placeholder="https://example.com/image.jpg"
            value={editedStory.imageUrl || ''}
            onChange={(e) => setEditedStory(prev => ({ ...prev, imageUrl: e.target.value }))}
          />
        </div>
        
        <Button 
          onClick={handleCreateStory} 
          disabled={isLoading || !editedStory.title?.trim() || !editedStory.content?.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Story
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};