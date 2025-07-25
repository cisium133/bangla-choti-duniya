import { Link } from 'react-router-dom';
import { Eye, User, Tag } from 'lucide-react';
import { Story } from '../types/story';
import { useState } from 'react';

interface StoryCardProps {
  story: Story;
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <article className="story-card group">
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="story-card-image bg-muted animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={story.imageUrl} 
          alt={story.title}
          className={`story-card-image transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageError ? 'hidden' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="story-card-image bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">ছবি লোড হয়নি</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-[var(--transition-smooth)]" />
      </div>
      
      <div className="story-card-content">
        <div className="flex items-center gap-2 mb-3">
          <span className="category-badge">
            {story.category === 'romance' && 'প্রেমের গল্প'}
            {story.category === 'adventure' && 'রোমাঞ্চ'}
            {story.category === 'mystery' && 'রহস্য'}
            {story.category === 'social' && 'সামাজিক'}
            {story.category === 'historical' && 'ঐতিহাসিক'}
            {story.category === 'fantasy' && 'কল্পকাহিনী'}
          </span>
          {story.featured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              বিশেষ
            </span>
          )}
        </div>
        
        <Link to={`/story/${story.id}`} className="block">
          <h2 className="story-title">
            {story.title}
          </h2>
        </Link>
        
        <p className="story-excerpt">
          {story.excerpt}
        </p>
        
        <div className="story-meta">
          <div className="flex items-center gap-4 text-xs mb-3">
            <span className="text-muted-foreground font-bengali">
              {new Date(story.publishedDate).toLocaleDateString('bn-BD', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          
          <Link 
            to={`/story/${story.id}`}
            className="btn-primary text-sm px-4 py-2 inline-flex items-center gap-2 hover:gap-3 transition-all duration-300"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            সম্পূর্ণ পড়ুন
            <span className="text-lg">→</span>
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {(() => {
            console.log('Story tags debug:', { 
              tags: story.tags, 
              isArray: Array.isArray(story.tags), 
              type: typeof story.tags,
              title: story.title 
            });
            
            // Ensure tags is always an array
            const tagsArray = Array.isArray(story.tags) ? story.tags : 
                             typeof story.tags === 'string' ? [story.tags] : 
                             [];
            
            return tagsArray.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ));
          })()}
        </div>
      </div>
    </article>
  );
};