import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

// Define props interface for AgencyRegistrationModal
interface AgencyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: {
    name?: string;
    email?: string;
    password?: string;
    username?: string;
  };
}

// Simple form validation function
const validateInput = (name: string, value: string): string | null => {
  if (!value.trim()) {
    return `${name} is required`;
  }
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Please enter a valid email address";
  }
  if (name === "password" && value.length < 6) {
    return "Password must be at least 6 characters";
  }
  if (name === "website" && value.trim() !== "" && !/^(http|https):\/\/[^ "]+$/.test(value)) {
    return "Please enter a valid website URL";
  }
  return null;
};

// Add enum for roles
enum Role {
  Admin = "Admin",
  User = "User"
}

const AgencyRegistrationModal = ({ isOpen, onClose, userData }: AgencyRegistrationModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAgencyId, setCreatedAgencyId] = useState<string | null>(null);
  const steps = ["Create Agency", "Create Account", "Complete"];
  
  // Agency form state
  const [agencyForm, setAgencyForm] = useState({
    name: "",
    description: "",
    email: userData?.email || "",
    phone: "",
    website: "",
  });

  // User form state
  const [userForm, setUserForm] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    password: userData?.password || "",
    phone_number: "",
  });

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form values when the modal opens with userData
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Only allow closing if not submitting
      if (!isSubmitting) {
        onClose();
      }
    } else {
      // When opening, update form with userData
      if (userData) {
        setAgencyForm({
          ...agencyForm,
          email: userData.email || "",
        });
        setUserForm({
          ...userForm,
          name: userData.name || "",
          email: userData.email || "",
          password: userData.password || "",
        });
      }
    }
  };

  // Handle agency form input changes
  const handleAgencyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAgencyForm({
      ...agencyForm,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle user form input changes
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Validate agency form and submit
  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    const newErrors: Record<string, string> = {};
    
    // Required fields for agency
    const requiredFields = [
      { name: "name", value: agencyForm.name },
      { name: "email", value: agencyForm.email },
    ];
    
    requiredFields.forEach(field => {
      const error = validateInput(field.name, field.value);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    // Website validation (if provided)
    if (agencyForm.website) {
      const websiteError = validateInput("website", agencyForm.website);
      if (websiteError) {
        newErrors["website"] = websiteError;
      }
    }
    
    // If there are errors, display them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit agency form
    setIsSubmitting(true);
    try {
      // Create agency in Supabase
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .insert([{
          name: agencyForm.name,
          description: agencyForm.description || null,
          email: agencyForm.email,
          phone: agencyForm.phone || null,
          website: agencyForm.website || null,
          is_active: true,
        }])
        .select('id')
        .single();

      if (agencyError) {
        throw new Error(agencyError.message);
      }

      toast({
        title: "Agency created successfully!",
        description: "Now let's set up your admin account.",
      });

      // Store agency ID for user creation
      setCreatedAgencyId(agencyData.id);
      
      // Auto-fill email in user form
      setUserForm({
        ...userForm,
        email: agencyForm.email,
      });
      
      // Move to next step
      setCurrentStep(1);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create agency",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate user form and submit
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createdAgencyId) return;
    
    // Form validation
    const newErrors: Record<string, string> = {};
    
    // Required fields for user
    const requiredFields = [
      { name: "name", value: userForm.name },
      { name: "email", value: userForm.email },
      { name: "password", value: userForm.password },
    ];
    
    requiredFields.forEach(field => {
      const error = validateInput(field.name, field.value);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    // If there are errors, display them and don't proceed
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            name: userForm.name,
            phone_number: userForm.phone_number || null,
            agency_id: createdAgencyId,
            role: Role.Admin, // Use enum value instead of 'owner'
          },
        }
      });

      if (authError) throw new Error(authError.message);

      if (authData.user) {
        // First, check if the user already exists in the users table
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        let userOperation;
        
        // If user exists, update; otherwise insert
        // BUT don't save email or password in the users table - they're stored in auth only
        if (existingUser) {
          userOperation = supabase
            .from('users')
            .update({ 
              name: userForm.name,
              phone_number: userForm.phone_number || null,
              agencyid: createdAgencyId,
              role: Role.Admin, // Use enum value instead of 'owner'
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);
        } else {
          userOperation = supabase
            .from('users')
            .insert([{ 
              id: authData.user.id, // Use the ID provided by auth
              name: userForm.name,
              // Remove email from being stored in users table
              phone_number: userForm.phone_number || null,
              agencyid: createdAgencyId,
              role: Role.Admin, // Use enum value instead of 'owner'
              is_active: true,
              created_at: new Date().toISOString()
            }]);
        }

        const { error: userError } = await userOperation;

        if (userError) throw new Error(userError.message);

        // Move to completion step
        setCurrentStep(2);

        // Automatically sign in the user
        await supabase.auth.signInWithPassword({
          email: userForm.email,
          password: userForm.password,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create account",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onClose();
    navigate("/dashboard");
  };

  // Render different content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={handleAgencySubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Agency Name*</Label>
              <Input 
                id="name"
                name="name"
                value={agencyForm.name}
                onChange={handleAgencyInputChange}
                placeholder="Your agency name" 
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Business Email*</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={agencyForm.email}
                onChange={handleAgencyInputChange}
                placeholder="contact@youragency.com" 
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                name="description"
                value={agencyForm.description}
                onChange={handleAgencyInputChange}
                placeholder="Tell us about your agency" 
                className="resize-none" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={agencyForm.phone}
                  onChange={handleAgencyInputChange}
                  placeholder="(123) 456-7890" 
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  name="website"
                  value={agencyForm.website}
                  onChange={handleAgencyInputChange}
                  placeholder="https://yourwebsite.com" 
                  className={errors.website ? "border-red-500" : ""}
                />
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        );
      
      case 1:
        return (
          <form onSubmit={handleUserSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Your Name*</Label>
              <Input 
                id="name"
                name="name"
                value={userForm.name}
                onChange={handleUserInputChange}
                placeholder="John Doe" 
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email*</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleUserInputChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="password">Password*</Label>
              <Input 
                id="password"
                name="password"
                type="password"
                value={userForm.password}
                onChange={handleUserInputChange}
                placeholder="••••••••" 
                autoComplete="new-password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <Label htmlFor="phone_number">Phone</Label>
              <Input 
                id="phone_number"
                name="phone_number"
                value={userForm.phone_number}
                onChange={handleUserInputChange}
                placeholder="(123) 456-7890" 
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(0)}
                className="flex-1"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        );
      
      case 2:
        return (
          <div className="text-center py-6">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Registration Complete!</h3>
            <p className="text-gray-600 mb-6">
              Your agency and admin account have been created successfully.
            </p>
            <Button onClick={handleComplete} className="w-full">
              Go to Dashboard
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {currentStep === 0 ? "Create Your Agency" : 
            currentStep === 1 ? "Create Your Account" :
            "Registration Complete"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {currentStep === 0 ? "Enter your agency details to get started" : 
            currentStep === 1 ? "Set up your admin account" : 
            "You're all set to start using Rentr!"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Step indicators */}
        <div className="flex justify-center mb-6">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center"
            >
              <div 
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  currentStep >= index ? 'bg-zinc-900 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > index ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`h-1 w-10 ${
                    currentStep > index ? 'bg-zinc-900' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Step content */}
        <div className="mt-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgencyRegistrationModal;
