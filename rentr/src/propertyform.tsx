import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"

const formSchema = z.object({
  propertyName: z.string().min(2, {
    message: "Property name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a valid number.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

export default function PropertyForm() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [images, setImages] = useState<File[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyName: "",
      address: "",
      price: "",
      description: "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setImages(Array.from(files))
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload images to storage bucket
      const imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;


          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, image);

            

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

          return publicUrl;
        })
      );
      console.log(imageUrls);

      // 2. Insert property data
      const { data: propertyData, error: propertyError } = await supabase
        .from('property')
        .insert([
          {
            name: values.propertyName,
            address: values.address,
            price: parseFloat(values.price),
            description: values.description,
            userid: user.id
          }
        ])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // 3. Insert image references
      if (imageUrls.length > 0) {
        const { error: imageError } = await supabase
          .from('propertyimages')
          .insert(
            imageUrls.map(url => ({
              propertyid: propertyData.propertyid,
              url: url
            }))
          );

        if (imageError) throw imageError;
      }

      toast({
        title: "Success!",
        description: "Property listed successfully.",
      });
      
      navigate('/home');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold">List Your Property</h2>
        <p className="text-muted-foreground">
          Fill in the details about your property.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="propertyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input placeholder="Cozy Downtown Apartment" {...field} />
                </FormControl>
                <FormDescription>
                  This is how your property will be listed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the complete property address.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent (CAD)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2000" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the monthly rental price.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your property..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Include key features and amenities.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Property Images</FormLabel>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            <FormDescription>
              Upload up to 5 images of your property. Supported formats: JPG, PNG.
            </FormDescription>
            
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-video">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full border-2 border-black rounded-lg">
            List Property
          </Button>
        </form>
      </Form>
    </div>
  )
}
