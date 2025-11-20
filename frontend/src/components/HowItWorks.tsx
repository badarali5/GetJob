import { UserPlus, Search, Rocket } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up in seconds and showcase your skills, education, and career goals.",
  },
  {
    icon: Search,
    title: "Browse Opportunities",
    description: "Explore thousands of internships and entry-level positions tailored to your interests.",
  },
  {
    icon: Rocket,
    title: "Apply & Launch",
    description: "Submit applications with one click and start your journey to career success.",
  },
];

const HowItWorks = () => {
  return (
  <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started with your career is easier than ever. Follow these simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 gradient-hero blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-20 h-20 mx-auto rounded-2xl gradient-hero flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -z-10"></div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
