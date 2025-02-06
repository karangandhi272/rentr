import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { CheckIcon, PlusIcon, RocketIcon, ArrowRightIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => {
    if (user) {
      return navigate("/home");
    }
    navigate("/auth");
  };

  const features = [
    {
      icon: <RocketIcon className="w-6 h-6 text-blue-500" />,
      title: "Lightning Fast",
      description: "Incredible performance with cutting-edge technology.",
    },
    {
      icon: <CheckIcon className="w-6 h-6 text-green-500" />,
      title: "Easy to Use",
      description: "Intuitive interface designed for maximum productivity.",
    },
    {
      icon: <PlusIcon className="w-6 h-6 text-purple-500" />,
      title: "Scalable Solution",
      description: "Grows seamlessly with your business needs.",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="w-full px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">ProductName</div>
          <nav className="hidden md:flex space-x-4 items-center">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>

            <Button variant="outline" size="sm" onClick={handleLogin}>
              Login
            </Button>
          </nav>
          {/* Mobile Menu Placeholder */}
          <div className="md:hidden">☰</div>
        </div>
      </header>

      {/* Hero Section - Full Height and Width */}
      <main className="w-full flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 md:mb-6">
            Transform Your Business with Smart Solutions
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
            Powerful, intuitive software that drives innovation and efficiency.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRightIcon className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="w-full bg-gray-50 py-16 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Solution
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've designed a product that simplifies complex workflows and
              empowers your team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm md:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-8">
        <div className="w-full px-4 text-center">
          <p className="text-sm">© 2024 roductName. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
