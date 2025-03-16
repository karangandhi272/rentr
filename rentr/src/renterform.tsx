import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Add Textarea import
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DateTimePicker } from "@/components/ui/datetimepicker";
import { ImageSlider } from "@/components/ui/image-slider";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi, propertyKeys } from "./api/properties";
import { supabase } from "./lib/supabaseClient";
import { useState, useEffect } from "react"; // Add useState and useEffect
import { Checkbox } from "@/components/ui/checkbox"; // Add Checkbox import

// Add interface for precheck questions
interface PrecheckQuestion {
  id: string;
  text: string;
  required: boolean;
}

// Create dynamic form schema with precheck questions
const createFormSchema = (precheckQuestions: PrecheckQuestion[]) => {
  let schema: any = {
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    number: z.string().min(10, {
      message: "Please enter a valid phone number.",
    }),
    date: z.date({
      required_error: "Please select a date and time.",
    }),
  };

  // Add validation for each precheck question
  precheckQuestions.forEach((question) => {
    if (question.required) {
      schema[`question_${question.id}`] = z.string().min(1, {
        message: "This question requires an answer.",
      });
    } else {
      schema[`question_${question.id}`] = z.string().optional();
    }
  });

  return z.object(schema);
};

export type Image = {
  url: string;
};

export default function RenterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [precheckQuestions, setPrecheckQuestions] = useState<PrecheckQuestion[]>([]);
  const [formSchema, setFormSchema] = useState(createFormSchema([]));

  // Fetch property precheck questions
  const { data: questions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["propertyQuestions", id],
    queryFn: async () => {
      if (!id) return [];
      try {
        const questions = await propertiesApi.fetchPropertyQuestions(id);
        return questions.map((q: any) => ({
          id: q.id,
          text: q.question_text,
          required: q.is_required === null ? false : Boolean(q.is_required)
        }));
      } catch (error) {
        console.error("Error fetching precheck questions:", error);
        return [];
      }
    },
    enabled: !!id,
  });

  // Update form schema when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      setPrecheckQuestions(questions);
      setFormSchema(createFormSchema(questions));
    }
  }, [questions]);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      number: "",
      date: undefined,
      // Questions will be added dynamically
    },
  });

  // Reset form when schema changes
  useEffect(() => {
    form.reset(form.getValues());
  }, [formSchema]);

  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryFn: () => propertiesApi.fetchPropertyById(id!),
    queryKey: propertyKeys.detail(id!),
    enabled: !!id,
  });

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["propertyImages", id],
    queryFn: async () => {
      const images = await propertiesApi.fetchPropertyImages(id!);
      console.log("Fetched images:", images);
      return images;
    },
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No property ID provided</p>
          <Button onClick={() => navigate("/dashboard")}>
            Go back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  async function onSubmit(values: any) {
    try {
      console.log("Submitting form with values:", values);

      // Extract question answers
      const questionAnswers = {};
      precheckQuestions.forEach(q => {
        questionAnswers[q.id] = values[`question_${q.id}`];
      });

      const { error } = await supabase.from("leads").insert([
        {
          property: id,
          name: values.name,
          email: values.email,
          number: values.number,
          date: values.date.toISOString(),
          property_answers: questionAnswers // Changed from precheck_answers to property_answers to match DB schema
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Application Submitted!",
        description: "We'll be in touch soon.",
        className:
          "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw] md:w-auto",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application.",
      });
    }
  }

  if (isLoadingProperty || isQuestionsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Apply for Rental</h2>
          <div className="mt-2 space-y-1">
            <p className="font-semibold">{property.name}</p>
            <p className="text-muted-foreground">{property.address_string}</p>
            <p className="text-muted-foreground">${property.price}/month</p>
          </div>
        </div>

        {/* Images */}
        <div className="mb-8">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">
            Property Images
          </h3>
          <div className="rounded-lg overflow-hidden">
            {imagesLoading ? (
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : images && images.length > 0 ? (
              <ImageSlider images={images.map((img) => img.url)} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-100">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234567890" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move-in Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value}
                      setDate={(date) => field.onChange(date)}
                      propertyId={id!}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precheck Questions Section */}
            {precheckQuestions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Property Questionnaire</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Please answer the following questions about your application:
                </p>
                <div className="space-y-6">
                  {precheckQuestions.map((question) => (
                    <FormField
                      key={question.id}
                      control={form.control}
                      name={`question_${question.id}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-start gap-2">
                            {question.text}
                            {question.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your answer"
                              {...field} 
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-8 mb-4 sm:mb-0"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
