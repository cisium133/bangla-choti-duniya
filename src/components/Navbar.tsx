import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, BookOpen, Home, Grid3X3, Info } from 'lucide-react';

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
    { path: '/categories', label: 'বিভাগসমূহ', icon: Grid3X3 },
    { path: '/about', label: 'আমাদের সম্পর্কে', icon: Info },
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 ${
                  isActive(link.path) ? 'text-primary' : ''
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="গল্প খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <button type="submit" className="btn-primary">
              খুঁজুন
            </button>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-[var(--transition-smooth)]"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-[var(--transition-smooth)] ${
                    isActive(link.path) ? 'text-primary bg-primary/5' : ''
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              
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