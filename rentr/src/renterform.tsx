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
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { DateTimePicker } from "@/components/ui/datetimepicker";
import { ImageSlider } from "@/components/ui/image-slider";
import { useQuery } from "@tanstack/react-query";
import { propertiesApi, propertyKeys } from "./api/properties";
import { supabase } from "./lib/supabaseClient";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  number: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  date: z.date({
    required_error: "Please select a date and time.",
  }),
});

export type Image = {
  url: string;
};

export default function RenterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      number: "",
      date: undefined,
    },
  });

  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryFn: () => propertiesApi.fetchPropertyById(id!),
    queryKey: propertyKeys.detail(id!),
    enabled: !!id,
  });

  // TODO -> Create Property Images View.
  const { data: images = [] } = useQuery({
    queryKey: ["propertyImages", id],
    queryFn: () => propertiesApi.fetchPropertyImages(id!),
    enabled: !!id,
  });

  console.log(images);

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
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting form with values:", values); // Debug log

      const { error } = await supabase.from("leads").insert([
        {
          property: id,
          name: values.name,
          number: values.number,
          date: values.date.toISOString(), // Convert Date to ISO string
        },
      ]);

      if (error) {
        console.error("Supabase error:", error); // Debug log
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
      console.error("Submission error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application.",
      });
    }
  }

  if (isLoadingProperty) {
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
            <p className="text-muted-foreground">{property.address}</p>
            <p className="text-muted-foreground">${property.price}/month</p>
          </div>
        </div>

        {/* Images */}
        <div className="mb-8">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">
            Property Images
          </h3>
          <div className="rounded-lg overflow-hidden">
            <ImageSlider
              images={(images as Image[]).map((image) => image.url)}
            />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
