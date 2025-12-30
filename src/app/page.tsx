import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TrendingSection from '@/components/TrendingSection';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import NewsletterSection from '@/components/NewsletterSection';
import Footer from '@/components/Footer';
import FirstOrderPopup from '@/components/FirstOrderPopup';

export default function Home() {
  return (
    <div style={{ isolation: 'isolate' }}>
      <Header />
      <main style={{ position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <HeroSection />
        <TrendingSection />
        <AboutSection />
        <FeaturesSection />
        <FAQSection />
        {/* <NewsletterSection /> */}
        <FirstOrderPopup />
      </main>
      <Footer />
    </div>
  );
}
