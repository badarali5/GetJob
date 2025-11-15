import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuickFilters from "@/components/QuickFilters";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <QuickFilters />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
