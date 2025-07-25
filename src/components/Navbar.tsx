import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, BookOpen, Home } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar = ({ onSearch }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'প্রচ্ছদ', icon: Home },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary font-bengali-title">
            <BookOpen className="w-6 h-6" />
            চটি দুনিয়া
          </Link>

          {/* Centered Search */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="গল্প খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap">
                খুঁজুন
              </button>
            </form>
          </div>

          {/* Empty div for layout balance */}
          <div className="hidden md:block w-24"></div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-[var(--transition-smooth)]"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="গল্প খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input w-full pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <button type="submit" className="btn-primary w-full">
                  খুঁজুন
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};