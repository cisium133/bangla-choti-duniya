import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StoryCard } from '../components/StoryCard';
import { ScrollToTop } from '../components/ScrollToTop';
import { getStoriesByCategory, getCategoriesWithCounts } from '../data/stories';
import { Story, StoryCategory } from '../types/story';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [category, setCategory] = useState<StoryCategory | undefined>();
  const [allCategories, setAllCategories] = useState<StoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const storiesPerPage = 12;

  useEffect(() => {
    const loadCategoryData = async () => {
      if (categoryId) {
        try {
          const [categoriesData, categoryStories] = await Promise.all([
            getCategoriesWithCounts(),
            getStoriesByCategory(categoryId)
          ]);
          
          setAllCategories(categoriesData);
          
          // Find category by ID (convert back from URL-safe format)
          const categoryName = categoryId.replace(/-/g, ' ');
          const foundCategory = categoriesData.find(cat => 
            cat.id === categoryId || cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          
          if (foundCategory) {
            setCategory(foundCategory);
            setStories(categoryStories);
            document.title = `${foundCategory.name} - গল্পের জগৎ`;
          } else {
            console.error('Category not found:', categoryId);
          }
        } catch (error) {
          console.error('Error loading category data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCategoryData();
  }, [categoryId]);

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground font-bengali-title mb-4">
            বিভাগটি পাওয়া যায়নি
          </h1>
          <p className="text-muted-foreground font-bengali">
            দুঃখিত, আপনি যে বিভাগটি খুঁজছেন তা আমাদের কাছে নেই।
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      {/* Category Header */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-bengali-title mb-4">
              {category.name}
            </h1>
            <p className="text-xl text-muted-foreground font-bengali mb-6">
              {category.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-bengali">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{category.count} টি গল্প</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>বিভাগ: {category.name}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <section>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg font-bengali">গল্প লোড হচ্ছে...</p>
            </div>
          ) : stories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground font-bengali-title mb-2">
                  এই বিভাগে কোনো গল্প নেই
                </h3>
                <p className="text-muted-foreground font-bengali">
                  শীঘ্রই এই বিভাগে নতুন গল্প যোগ করা হবে। অন্য বিভাগের গল্প পড়তে পারেন।
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default CategoryPage;