import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  MessageSquare,
  ArrowRightIcon,
  ClipboardCheck,
  Users,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => {
    if (user) {
      return navigate("/dashboard");
    }
    navigate("/auth");
  };

  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-zinc-600" />,
      title: "Property Management",
      description:
        "Easily manage all your properties in one place with detailed insights and analytics.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-zinc-600" />,
      title: "Smart Scheduling",
      description:
        "Automated viewing schedules and tenant applications management.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-zinc-600" />,
      title: "Instant Communication",
      description:
        "Direct messaging with potential tenants and automated notifications.",
    },
  ];

  const benefits = [
    {
      icon: <ClipboardCheck className="w-12 h-12 text-zinc-600 mb-4" />,
      title: "Streamlined Applications",
      description:
        "Simplified tenant application process with digital forms and automatic screening.",
    },
    {
      icon: <Users className="w-12 h-12 text-green-500 mb-4" />,
      title: "Lead Management",
      description:
        "Track and manage potential tenants with our intuitive lead management system.",
    },
    {
      icon: <Clock className="w-12 h-12 text-purple-500 mb-4" />,
      title: "Time-Saving Automation",
      description:
        "Automate repetitive tasks and focus on growing your property portfolio.",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-white to-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-zinc-800" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Rentr
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-zinc-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-600 hover:text-zinc-900 transition-colors"
              >
                Benefits
              </a>
              <Button
                variant="default"
                className="bg-zinc-900 hover:bg-zinc-800 text-white"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Modern Property Management</span>
              <span className="block text-zinc-800">Made Simple</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Streamline your property management workflow with automated
              scheduling, tenant applications, and communication tools.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button
              size="lg"
              className="bg-zinc-900 hover:bg-zinc-800 text-white"
              onClick={handleLogin}
              >
              Start Free Trial <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
              Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to manage properties
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed for modern property managers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 hover:border-zinc-800 transition-all duration-300"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Rentr
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Save time and grow your business with our comprehensive solution
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">{benefit.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to transform your property management?
          </h2>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="bg-white text-zinc-900 hover:bg-zinc-100"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <Building2 className="h-8 w-8" />
            <span className="ml-2 text-2xl font-bold">Rentr</span>
          </div>
          <p className="text-center text-gray-400">
            © 2024 Rentr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
