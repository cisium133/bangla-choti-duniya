import { Heart, BookOpen, Users, Star, Mail, Globe } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const About = () => {
  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  const stats = [
    { icon: BookOpen, label: 'মোট গল্প', value: '৫০+' },
    { icon: Users, label: 'লেখক', value: '২০+' },
    { icon: Star, label: 'বিভাগ', value: '৬টি' },
    { icon: Heart, label: 'পাঠক', value: '১০০০+' }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'বিশাল সংগ্রহ',
      description: 'বিভিন্ন ধরনের বাংলা গল্পের বিশাল সংগ্রহ যা নিয়মিত আপডেট হয়।'
    },
    {
      icon: Globe,
      title: 'সহজ নেভিগেশন',
      description: 'সহজ এবং দ্রুত গল্প খোঁজার সুবিধা। বিভাগ অনুযায়ী সাজানো।'
    },
    {
      icon: Heart,
      title: 'পাঠক বান্ধব',
      description: 'মোবাইল এবং ডেস্কটপ উভয়ে সুন্দর পড়ার অভিজ্ঞতা।'
    },
    {
      icon: Star,
      title: 'গুণগত মান',
      description: 'প্রতিটি গল্প যত্নসহকারে নির্বাচিত এবং সম্পাদিত।'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-bengali-title mb-6 hero-text">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-xl text-white/90 font-bengali max-w-3xl mx-auto hero-text leading-relaxed">
            গল্পের জগৎ হল বাংলা ভাষার সেরা গল্পের একটি অনলাইন প্ল্যাটফর্ম। 
            আমাদের উদ্দেশ্য হল বাংলা সাহিত্যকে ডিজিটাল যুগে নিয়ে যাওয়া এবং 
            পাঠকদের কাছে সহজলভ্য করে তোলা।
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-foreground font-bengali-title mb-2">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground font-bengali">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground font-bengali-title mb-8">
              আমাদের লক্ষ্য
            </h2>
            <div className="prose prose-lg max-w-none font-bengali text-center">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                বাংলা সাহিত্যের ধনভাণ্ডারকে ডিজিটাল প্ল্যাটফর্মে নিয়ে আসা এবং নতুন প্রজন্মের কাছে 
                পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য। আমরা বিশ্বাস করি যে, প্রযুক্তির সাহায্যে 
                আমরা বাংলা গল্পের জগতকে আরও সমৃদ্ধ এবং সহজপ্রাপ্য করতে পারি।
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                প্রতিটি গল্প আমাদের কাছে একটি মূল্যবান রত্ন। আমরা চেষ্টা করি সেই রত্নগুলোকে 
                যথাযথ মর্যাদায় পাঠকদের কাছে উপস্থাপন করতে। আমাদের স্বপ্ন হল এমন একটি প্ল্যাটফর্ম 
                তৈরি করা যেখানে বাংলা সাহিত্যপ্রেমীরা তাদের প্রিয় গল্প খুঁজে পাবেন।
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground font-bengali-title text-center mb-12">
            আমাদের বৈশিষ্ট্য
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg border border-border bg-card hover:shadow-[var(--shadow-card-hover)] transition-[var(--transition-smooth)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground font-bengali-title mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground font-bengali">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-muted/30 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground font-bengali-title mb-4">
            যোগাযোগ করুন
          </h2>
          <p className="text-lg text-muted-foreground font-bengali mb-8 max-w-2xl mx-auto">
            আপনার কোনো প্রশ্ন, পরামর্শ বা মতামত থাকলে আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না। 
            আমরা আপনার মতামতকে মূল্য দেই।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:info@golper-jogot.com"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              ইমেইল পাঠান
            </a>
            <a 
              href="/"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              গল্প পড়ুন
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;