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
import { fetchPropertyById, fetchPropertyImages } from "./api/properties";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  dateTime: z.date({
    required_error: "Please select a date and time.",
  }),
});

export type Property = {
  propertyid: string;
  name: string;
  address: string;
  price: number;
  images?: string[];
};

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
      firstName: "",
      lastName: "",
      email: "",
      dateTime: undefined,
    },
  });

  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryFn: () => fetchPropertyById(id!),
    queryKey: ["property", id],
    enabled: !!id,
  });

  const { data: images = [] } = useQuery({
    queryKey: ["propertyImages", id],
    queryFn: () => fetchPropertyImages(id!),
    enabled: !!id,
  });

  console.log(images);

  if (!id) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No property ID provided</p>
          <Button onClick={() => navigate("/home")}>Go Home</Button>
        </div>
      </div>
    );
  }
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // try {
    //   const { error } = await supabase.from("rental_applications").insert([
    //     {
    //       propertyid: id,
    //       first_name: values.firstName,
    //       last_name: values.lastName,
    //       email: values.email,
    //       status: "pending",
    //     },
    //   ]);
    //   if (error) throw error;
    //   toast({
    //     title: "Application Submitted!",
    //     description: "We'll be in touch soon.",
    //     className:
    //       "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw] md:w-auto",
    //   });
    //   navigate("/home");
    // } catch (error: any) {
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: error.message || "Failed to submit application.",
    //   });
    // }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
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
              name="dateTime"
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
