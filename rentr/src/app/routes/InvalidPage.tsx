import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function InvalidPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="space-y-6 text-center">
        {/* 404 Icon/Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Oops!
            </span>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-[500px]">
            We couldn't find the page you were looking for. It might have been
            removed, renamed, or didn't exist in the first place.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-2 border-black"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/home')}
            className="border-2 border-black bg-primary text-black hover:bg-primary/90"
          >
            Return Home
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
    </div>
  );
}
