import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IntegrationGrid from "@/components/IntegrationGrid";
import DashboardPreview from "@/components/DashboardPreview";
import BenefitsSection from "@/components/BenefitsSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <IntegrationGrid />
      <DashboardPreview />
      <BenefitsSection />
    </div>
  );
};

export default Index;
