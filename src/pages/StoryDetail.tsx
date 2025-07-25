import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, User, Tag, Share2, Facebook, Twitter, Heart, BookOpen } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { StoryCard } from '../components/StoryCard';
import { getStoryById, getRelatedStories } from '../data/stories';
import { incrementViewCount } from '../utils/viewTracker';
import { useEffect, useState } from 'react';

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<any>(null);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts or id changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const loadStory = async () => {
      if (id) {
        try {
          const foundStory = await getStoryById(id);
          setStory(foundStory);
          if (foundStory) {
            // Increment view count
            const newViewCount = incrementViewCount(foundStory.id);
            foundStory.views = newViewCount;
            
            const related = await getRelatedStories(foundStory);
            setRelatedStories(related);
            setRelatedStories(related);
            
            // SEO: Update document title and meta
            document.title = `${foundStory.title} - গল্পের জগৎ`;
            
            // Update meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
              metaDescription.setAttribute('content', foundStory.excerpt);
            }
          }
        } catch (error) {
          console.error('Error loading story:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadStory();
  }, [id]);

  const handleSearch = (query: string) => {
    // Handle search from navbar
    console.log('Search:', query);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = story?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('লিংক কপি হয়েছে!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground font-bengali-title mb-4">
            গল্প লোড হচ্ছে...
          </h1>
          <p className="text-muted-foreground font-bengali mb-8">
            অনুগ্রহ করে অপেক্ষা করুন।
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground font-bengali-title mb-4">
            গল্পটি পাওয়া যায়নি
          </h1>
          <p className="text-muted-foreground font-bengali mb-8">
            দুঃখিত, আপনি যে গল্পটি খুঁজছেন তা আমাদের কাছে নেই।
          </p>
          <Link to="/" className="btn-primary">
            প্রচ্ছদে ফিরে যান
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm font-bengali">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
              প্রচ্ছদ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/categories" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
              বিভাগসমূহ
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground">{story.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-[var(--transition-smooth)] mb-8 font-bengali"
        >
          <ArrowLeft className="w-4 h-4" />
          প্রচ্ছদে ফিরে যান
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Story Header */}
          <header className="mb-12">
            <div className="mb-6">
              <span className="category-badge">
                {story.category === 'romance' && 'প্রেমের গল্প'}
                {story.category === 'adventure' && 'রোমাঞ্চ'}
                {story.category === 'mystery' && 'রহস্য'}
                {story.category === 'social' && 'সামাজিক'}
                {story.category === 'historical' && 'ঐতিহাসিক'}
                {story.category === 'fantasy' && 'কল্পকাহিনী'}
              </span>
              {story.featured && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  বিশেষ গল্প
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-bengali-title leading-tight mb-6">
              {story.title}
            </h1>
            
            <p className="text-xl text-muted-foreground font-bengali leading-relaxed mb-8">
              {story.excerpt}
            </p>

            {/* Story Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-bengali mb-8">
              {story.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{story.author}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(story.publishedDate).toLocaleDateString('bn-BD')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{story.views} বার দেখা হয়েছে</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-lg overflow-hidden mb-8 aspect-video">
              <img 
                src={story.imageUrl} 
                alt={story.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Share Buttons */}
            <div className="flex items-center justify-between border-y border-border py-4 mb-12">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground font-bengali">শেয়ার করুন:</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="social-btn"
                    title="ফেসবুকে শেয়ার করুন"
                  >
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="social-btn"
                    title="টুইটারে শেয়ার করুন"
                  >
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleShare('copy')}
                    className="social-btn"
                    title="লিংক কপি করুন"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`social-btn ${isLiked ? 'text-red-500 border-red-500' : ''}`}
                title="পছন্দ করুন"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </header>

          {/* Story Content */}
          <div className="prose prose-lg max-w-none font-bengali">
            <div className="text-foreground leading-relaxed text-lg">
              {story.content.split('\n').map((line, index) => {
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="mb-4 text-justify">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground font-bengali-title mb-4">ট্যাগসমূহ:</h3>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <span key={tag} className="category-badge">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Stories */}
      {relatedStories.length > 0 && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground font-bengali-title mb-8 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              সম্পর্কিত গল্প
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedStories.map((relatedStory) => (
                <StoryCard key={relatedStory.id} story={relatedStory} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default StoryDetail;