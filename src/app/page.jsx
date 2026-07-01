import MainLayout from '@/components/MainLayout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import VideoSection from '@/components/home/VideoSection';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <WhyChooseUs />
      <VideoSection />
      <Testimonials />
      <CtaBanner />
    </MainLayout>
  );
}
