import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { DateTimePicker } from "@/components/ui/datetimepicker"
import { ImageSlider } from "@/components/ui/image-slider"

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
})

type Property = {
  propertyid: string;
  name: string;
  address: string;
  price: number;
  images?: string[];
};

export default function RenterForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateTime: undefined,
    },
  });

  useEffect(() => {
    async function fetchProperty() {
      if (!id) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No property ID provided",
        });
        navigate('/404');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('property')
          .select('*')
          .eq('propertyid', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Property not found");

        setProperty(data);

        // Fetch property images
        const { data: imageData, error: imageError } = await supabase
          .from('propertyimages')
          .select('url')
          .eq('propertyid', id);

        if (!imageError && imageData) {
          setImages(imageData.map(img => img.url));
        }
      } catch (error: any) {
        console.error("Error fetching property:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load property details",
        });
        navigate('/404');
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [id, navigate, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase
        .from('rental_applications')
        .insert([
          {
            propertyid: id,
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "We'll be in touch soon.",
        className: "bg-white border-2 border-black bottom-0 fixed mb-4 left-1/2 -translate-x-1/2 w-[90vw] md:w-auto",
      });

      navigate('/home');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit application.",
      });
    }
  }

  if (loading) {
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
    <div className="h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Apply for Rental</h2>
          <div className="mt-2 space-y-1">
            <p className="font-semibold">{property.name}</p>
            <p className="text-muted-foreground">{property.address}</p>
            <p className="text-muted-foreground">${property.price}/month</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input placeholder="john@example.com" type="email" {...field} />
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

            <div className="mt-8 mb-6">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">Property Images</h3>
              <ImageSlider images={images} />
            </div>

            <Button type="submit" className="w-full border-2 border-black">Submit Application</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
