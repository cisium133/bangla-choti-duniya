import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Download, List, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { StoryScraper } from '@/components/admin/StoryScraper';
import { Story } from '@/types/story';
import { MarkdownStoryService } from '@/utils/MarkdownStoryService';

export const Admin = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const loadedStories = await MarkdownStoryService.loadStories();
      setStories(loadedStories);
    } catch (error) {
      console.error('Failed to load stories:', error);
      toast({
        title: "Failed to Load Stories",
        description: "Could not load stories from markdown files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryAdd = (newStory: Story) => {
    setStories(prev => [newStory, ...prev]);
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await MarkdownStoryService.deleteStory(storyId);
      setStories(prev => prev.filter(story => story.id !== storyId));
      toast({
        title: "Story Deleted",
        description: "The story has been removed from your collection",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not delete the story",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { ...story, featured: !story.featured }
        : story
    ));
  };

  const totalStories = stories.length;
  const featuredStories = stories.filter(story => story.featured).length;
  const categoryCounts = stories.reduce((acc, story) => {
    acc[story.category] = (acc[story.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold font-bengali-title">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your story collection</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-semibold">{totalStories} Stories</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStories}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Stories</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{featuredStories}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stories.reduce((total, story) => total + story.views, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scraper" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scraper" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Create Story
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Manage Stories
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scraper" className="space-y-6">
            <StoryScraper onStoryAdd={handleStoryAdd} />
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Story Collection</CardTitle>
                <CardDescription>
                  Manage your story collection, edit metadata, and control featured status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <img 
                          src={story.imageUrl} 
                          alt={story.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="space-y-1">
                          <h3 className="font-medium">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {story.author} • {story.views} views
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{story.category}</Badge>
                            {story.featured && (
                              <Badge variant="default">Featured</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeatured(story.id)}
                        >
                          {story.featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Manage your external service configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Story Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Stories are stored as markdown files in the repository. All changes are automatically saved.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      MarkdownStoryService.clearCache();
                      loadStories();
                      toast({
                        title: "Stories Reloaded",
                        description: "Story cache cleared and reloaded from files",
                      });
                    }}
                  >
                    Reload Stories
                  </Button>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Category Distribution</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(categoryCounts).map(([category, count]) => (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize">{category}:</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
