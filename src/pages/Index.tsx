import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Search } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StoryCard } from '../components/StoryCard';
import { SEO } from '../components/SEO';
import { DateFilter } from '../components/DateFilter';
import { getLatestStories, categories, searchStories } from '../data/stories';
import { Story } from '../types/story';

const Index = () => {
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [latestStories, setLatestStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const storiesPerPage = 12;

  useEffect(() => {
    const loadStories = async () => {
      console.log('Starting to load stories...');
      try {
        const latest = await getLatestStories(storiesPerPage); // Load first batch
        
        console.log('Latest stories:', latest.length);
        
        setLatestStories(latest);
        setFilteredStories(latest);
        setHasMoreStories(latest.length === storiesPerPage);
      } catch (error) {
        console.error('Error loading stories:', error);
        setLatestStories([]);
        setFilteredStories([]);
        setHasMoreStories(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadStories();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchStories(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching stories:', error);
        setSearchResults([]);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleDateFilter = (start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);
    
    if (!start && !end) {
      setFilteredStories(latestStories);
      return;
    }
    
    const filtered = latestStories.filter(story => {
      const storyDate = new Date(story.publishedDate);
      if (start && storyDate < start) return false;
      if (end && storyDate > end) return false;
      return true;
    });
    
    setFilteredStories(filtered);
  };

  const loadMoreStories = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const allStories = await getLatestStories(nextPage * storiesPerPage);
      const newStories = allStories.slice(latestStories.length);
      
      setLatestStories(prev => [...prev, ...newStories]);
      
      // Apply date filter to new stories if active
      if (startDate || endDate) {
        handleDateFilter(startDate, endDate);
      } else {
        setFilteredStories(prev => [...prev, ...newStories]);
      }
      
      setCurrentPage(nextPage);
      setHasMoreStories(newStories.length === storiesPerPage);
    } catch (error) {
      console.error('Error loading more stories:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Navbar onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Results */}
        {isSearching && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground font-bengali-title flex items-center gap-3">
                <Search className="w-8 h-8 text-primary" />
                অনুসন্ধানের ফলাফল
                <span className="text-lg text-muted-foreground">("{searchQuery}")</span>
              </h2>
              <button 
                onClick={clearSearch}
                className="btn-secondary"
              >
                পরিষ্কার করুন
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg font-bengali">
                  কোনো গল্প পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।
                </p>
              </div>
            )}
          </section>
        )}

        {/* All Stories */}
        {!isSearching && (
          <>
            <section className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-foreground font-bengali-title flex items-center gap-3">
                  <Clock className="w-8 h-8 text-primary" />
                  সব গল্প
                </h2>
                <DateFilter onDateChange={handleDateFilter} />
              </div>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg font-bengali">গল্প লোড হচ্ছে...</p>
                </div>
              ) : filteredStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg font-bengali">কোনো গল্প পাওয়া যায়নি।</p>
                </div>
              )}
              
              {/* Load More Button */}
              {!isLoading && filteredStories.length > 0 && hasMoreStories && !(startDate || endDate) && (
                <div className="text-center mt-8">
                  <button 
                    onClick={loadMoreStories}
                    disabled={isLoadingMore}
                    className="btn-primary px-8 py-3 text-lg"
                  >
                    {isLoadingMore ? 'আরো গল্প লোড হচ্ছে...' : 'আরো গল্প দেখুন'}
                  </button>
                </div>
              )}
            </section>

            {/* Categories - Moved to bottom before footer */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground font-bengali-title mb-8 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                গল্পের বিভাগ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group p-6 rounded-lg border border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/50 hover:shadow-[var(--shadow-card-hover)] transition-[var(--transition-smooth)]"
                  >
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-[var(--transition-smooth)] font-bengali-title">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground font-bengali">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-bengali">
                          {category.count} টি গল্প
                        </span>
                        <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-[var(--transition-smooth)]" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;