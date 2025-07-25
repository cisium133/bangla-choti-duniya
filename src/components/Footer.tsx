import { Link } from 'react-router-dom';
import { BookOpen, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary font-bengali-title">
              <BookOpen className="w-6 h-6" />
              চটি দুনিয়া
            </Link>
            <p className="text-muted-foreground leading-relaxed font-bengali">
              বাংলা ভাষার সেরা গল্পের সংগ্রহ। আমাদের সাথে আবিষ্কার করুন সাহিত্যের নতুন দিগন্ত।
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 font-bengali-title">Categories</h3>
            <ul className="space-y-2 font-bengali">
              <li>
                <Link to="/category/romance" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
                  প্রেমের গল্প
                </Link>
              </li>
              <li>
                <Link to="/category/adventure" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
                  রোমাঞ্চ
                </Link>
              </li>
              <li>
                <Link to="/category/mystery" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
                  রহস্য
                </Link>
              </li>
              <li>
                <Link to="/category/social" className="text-muted-foreground hover:text-primary transition-[var(--transition-smooth)]">
                  সামাজিক
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground font-bengali">
            © ২০২৫ চটি দুনিয়া। সকল অধিকার সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
};