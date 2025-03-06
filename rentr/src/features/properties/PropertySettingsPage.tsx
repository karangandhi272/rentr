import React, { useState, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties";
import { Property } from "@/types/property";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Archive, Plus, Trash2, ArrowLeft, Settings, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface PrecheckQuestion {
  id: string;
  text: string;
  required: boolean;
}

const defaultPrecheckQuestions: PrecheckQuestion[] = [
  { id: "q1", text: "Do you have any pets?", required: true },
  { id: "q2", text: "How many people will be living in the property?", required: true },
  { id: "q3", text: "Current employment status?", required: true },
];

const PropertySettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for custom questions
  const [precheckQuestions, setPrecheckQuestions] = useState<PrecheckQuestion[]>(defaultPrecheckQuestions);
  const [newQuestion, setNewQuestion] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => propertiesApi.fetchPropertyById(id!),
  });

  // Archive property mutation
  const { mutate: archiveProperty } = useMutation({
    mutationFn: async () => {
      const { data, error } = await propertiesApi.updateProperty(id!, { archived: true });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      toast({
        title: "Success",
        description: "Property has been archived",
        duration: 3000,
      });
      navigate("/properties");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive property",
        variant: "destructive",
        duration: 3000,
      });
    },
  });
  
  // Save questions mutation
  const { mutate: saveQuestions } = useMutation({
    mutationFn: async () => {
      // Normally you'd save this to your backend
      // For now, we'll just simulate success
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Precheck questions have been saved",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save precheck questions",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Make sure your event handlers are properly connected
  console.log('Property ID:', id);
  console.log('Questions loaded:', precheckQuestions);
  
  // 2. Make sure your click handlers have proper event prevention
  const handleAddQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default form submission
    
    console.log('Add question clicked'); // Debug log
    console.log('New question text:', newQuestion); // Debug log
    console.log('Is required:', isRequired); // Debug log
    
    if (!newQuestion.trim()) {
      console.log('Question text is empty, not adding');
      return;
    }
    
    try {
      // 3. Call the API directly to test
      propertiesApi.addPropertyQuestion({
        property_id: id!,
        question_text: newQuestion,
        is_required: isRequired,
        order_index: precheckQuestions?.length ? precheckQuestions.length + 1 : 1
      }).then(result => {
        console.log('Question added successfully:', result);
        // Update local state immediately for better UX
        setPrecheckQuestions(prev => [...(prev || []), {
          id: result.id,
          text: result.question_text,
          required: result.is_required === true
        }]);
        setNewQuestion('');
        setIsRequired(true);
        
        // Show success toast
        toast({
          title: "Success",
          description: "Question added successfully",
        });
      }).catch(err => {
        console.error('Error adding question:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add question: " + (err.message || 'Unknown error'),
        });
      });
    } catch (err) {
      console.error('Exception in add question:', err);
    }
  };
  
  // 4. Similarly update your remove question handler
  const handleRemoveQuestion = (questionId: string) => {
    console.log('Remove question clicked for id:', questionId); // Debug log
    
    try {
      propertiesApi.deletePropertyQuestion(questionId)
        .then(() => {
          console.log('Question deleted successfully');
          // Update local state immediately
          setPrecheckQuestions(prev => 
            (prev || []).filter(q => q.id !== questionId)
          );
          
          // Show success toast
          toast({
            title: "Success",
            description: "Question removed successfully",
          });
        })
        .catch(err => {
          console.error('Error removing question:', err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to remove question: " + (err.message || 'Unknown error'),
          });
        });
    } catch (err) {
      console.error('Exception in remove question:', err);
    }
  };

  const handlePostListing = () => {
    // Implement posting listing functionality
    toast({
      title: "Success",
      description: "Property listing has been posted",
      duration: 3000,
    });
  };

  const handleAddRenter = () => {
    // Copy link to clipboard
    const propertyLink = `${window.location.origin}/apply/${id}`;
    navigator.clipboard.writeText(propertyLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
          title: "Link Copied",
          description: "Application link copied to clipboard",
          duration: 3000,
        });
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/manage/${id}`)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{property.name} Settings</h1>
      </div>

      <Tabs defaultValue="precheck">
        <TabsList className="mb-8">
          <TabsTrigger value="precheck">Precheck Questions</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="precheck">
          <Card>
            <CardHeader>
              <CardTitle>Precheck Questions</CardTitle>
              <CardDescription>
                Customize questions that potential renters must answer during the application process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {precheckQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className="flex items-center justify-between p-3 border rounded-md bg-white"
                  >
                    <div>
                      <p className="font-medium">{question.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {question.required ? "Required" : "Optional"}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveQuestion(question.id)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3">Add New Question</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="question-text">Question</Label>
                    <Textarea 
                      id="question-text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Enter your question here..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="required"
                      checked={isRequired}
                      onChange={(e) => setIsRequired(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="required">Required</Label>
                  </div>
                  <Button 
                    onClick={handleAddQuestion}
                    className="w-full"
                    disabled={!newQuestion.trim()}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => saveQuestions()}
                className="ml-auto"
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage general property settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2">Property Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Update basic information about this property
                </p>
                <Button variant="outline">
                  Edit Property Info
                </Button>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions cannot be undone
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Property
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will archive the property and remove it from your active listings. You can restore it later from the archived properties section.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => archiveProperty()}>
                        Yes, Archive Property
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Toaster />
    </div>
  );
};

export default PropertySettingsPage;