import { Link } from 'react-router-dom';
import { Grid3X3, ArrowRight, BookOpen } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { categories } from '../data/stories';

const Categories = () => {
  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-bengali-title mb-4">
            গল্পের বিভাগসমূহ
          </h1>
          <p className="text-xl text-muted-foreground font-bengali max-w-2xl mx-auto">
            আপনার পছন্দের ধরনের গল্প খুঁজে নিন। আমাদের রয়েছে বিভিন্ন বিষয়ের গল্পের বিশাল সংগ্রহ।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative p-8 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-[var(--shadow-card-hover)] transition-[var(--transition-smooth)] overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full transform translate-x-16 -translate-y-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent rounded-full transform -translate-x-12 translate-y-12" />
              </div>
              
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-[var(--transition-smooth)] font-bengali-title">
                    {category.name}
                  </h2>
                  <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-[var(--transition-smooth)]" />
                </div>
                
                <p className="text-muted-foreground font-bengali leading-relaxed">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-bengali">
                    <BookOpen className="w-4 h-4" />
                    <span>{category.count} টি গল্প</span>
                  </div>
                  <span className="text-sm font-medium text-primary group-hover:text-primary/80 transition-[var(--transition-smooth)] font-bengali">
                    পড়ুন →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;