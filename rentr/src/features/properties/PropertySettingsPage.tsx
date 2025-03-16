import React, { useState, MouseEvent, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties";
import { Property, PropertyQuestion } from "@/types/property";
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
  const [precheckQuestions, setPrecheckQuestions] = useState<PrecheckQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  
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
      queryClient.invalidateQueries({ queryKey: ["properties"] });
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
  
  // Load questions from database on component mount
  useEffect(() => {
    if (!id) return;
    
    setIsQuestionsLoading(true);
    console.log('Loading questions for property:', id);
    
    // Make sure to use the correct function name (getPropertyQuestions, not fetchPropertyQuestions)
    propertiesApi.fetchPropertyQuestions(id)
      .then((questions: any[]) => {
        console.log('Questions loaded from database:', questions);
        
        if (questions && questions.length > 0) {
          // Map the database questions to your local format
          const mappedQuestions = questions.map(q => ({
            id: q.id,
            text: q.question_text,
            required: q.is_required === null ? false : Boolean(q.is_required)  // Handle null values
          }));
          
          console.log('Mapped questions:', mappedQuestions);
          setPrecheckQuestions(mappedQuestions);
        } else {
          console.log('No saved questions found, using defaults');
          setPrecheckQuestions(defaultPrecheckQuestions);
        }
      })
      .catch(err => {
        console.error('Failed to load questions:', err);
        setPrecheckQuestions(defaultPrecheckQuestions);
        toast({
          title: "Warning",
          description: "Could not load saved questions, showing defaults",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsQuestionsLoading(false);
      });
  }, [id]);

  // Save questions mutation
  const { mutate: saveQuestions } = useMutation({
    mutationFn: async () => {
      console.log('Saving questions to database:', precheckQuestions);
      
      // Process each question
      for (const question of precheckQuestions) {
        // Check if it's a default question (has an ID like "q1", "q2", etc.)
        const isDefaultQuestion = question.id.startsWith('q') && question.id.length <= 3;
        
        if (isDefaultQuestion) {
          // For default questions, create them in the database
          await propertiesApi.addPropertyQuestion({
            property_id: id!,
            question_text: question.text,
            is_required: question.required,
            order_index: precheckQuestions.indexOf(question) + 1
          });
        } else {
          // For existing questions, update them if they exist
          try {
            // Try to update - if it fails with 'not found', we can handle that case
            await propertiesApi.updatePropertyQuestion(question.id, {
              question_text: question.text,
              is_required: question.required,
              order_index: precheckQuestions.indexOf(question) + 1
            });
          } catch (err) {
            console.log('Question may not exist in DB, will add as new:', question);
            await propertiesApi.addPropertyQuestion({
              property_id: id!,
              question_text: question.text,
              is_required: question.required,
              order_index: precheckQuestions.indexOf(question) + 1
            });
          }
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
    // After saving, reload the questions to get the latest from DB
    propertiesApi.fetchPropertyQuestions(id!)
      .then(questions => {
        const mappedQuestions = questions.map(q => ({
          id: q.id,
          text: q.question_text,
          required: q.is_required === null ? false : Boolean(q.is_required) // Ensure boolean type
        }));
        setPrecheckQuestions(mappedQuestions);
      });
      
    toast({
        title: "Success",
        description: "Precheck questions have been saved",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Failed to save questions:', error);
      toast({
        title: "Error",
        description: "Failed to save precheck questions",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  // Add question handler
  const handleAddQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    
    console.log('Add question clicked');
    console.log('New question text:', newQuestion);
    console.log('Is required:', isRequired);
    
    if (!newQuestion.trim()) {
      console.log('Question text is empty, not adding');
      return;
    }
    
    // First add to local state with a temporary ID for immediate feedback
    const tempId = `temp_${Date.now()}`;
    const newQuestionObj = {
      id: tempId,
      text: newQuestion,
      required: isRequired
    };
    
    // Update UI immediately with temp item
    setPrecheckQuestions(prev => [...prev, newQuestionObj]);
    
    // Clear form
    setNewQuestion('');
    setIsRequired(true);
    
    // Then actually save to database
    try {
      propertiesApi.addPropertyQuestion({
        property_id: id!,
        question_text: newQuestion,
        is_required: isRequired,
        order_index: precheckQuestions.length + 1
      })
      .then(result => {
        console.log('Question added successfully:', result);
        
        // Replace temp ID with real one from database
        setPrecheckQuestions(prev => 
          prev.map(q => q.id === tempId ? {
            id: result.id,
            text: result.question_text,
            required: result.is_required === null ? false : Boolean(result.is_required)
          } : q)
        );
        
        toast({
          title: "Success",
          description: "Question added successfully",
        });
      })
      .catch(err => {
        console.error('Error adding question:', err);
        
        // Remove the temp question on error
        setPrecheckQuestions(prev => prev.filter(q => q.id !== tempId));
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add question",
        });
      });
    } catch (err) {
      console.error('Exception in add question:', err);
      
      // Remove the temp question on error
      setPrecheckQuestions(prev => prev.filter(q => q.id !== tempId));
    }
  };
  
  // Remove question handler
  const handleRemoveQuestion = (questionId: string) => {
    console.log('Remove question clicked for id:', questionId);
    
    // If it's a default question (q1, q2, etc.), just remove it from local state
    const isDefaultQuestion = questionId.startsWith('q') && questionId.length <= 3;
    
    // Remove from UI immediately for better UX
    setPrecheckQuestions(prev => prev.filter(q => q.id !== questionId));
    
    // If it's a real DB question, delete it from database
    if (!isDefaultQuestion) {
      try {
        propertiesApi.deletePropertyQuestion(questionId)
          .then(() => {
            console.log('Question deleted successfully');
            toast({
              title: "Success",
              description: "Question removed successfully",
            });
          })
          .catch(err => {
            console.error('Error removing question:', err);
            
            // Restore the question if deletion failed
            const removedQuestion = precheckQuestions.find(q => q.id === questionId);
            if (removedQuestion) {
              setPrecheckQuestions(prev => [...prev, removedQuestion]);
            }
            
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to remove question",
            });
          });
      } catch (err) {
        console.error('Exception in remove question:', err);
      }
    } else {
      toast({
        title: "Success",
        description: "Question removed",
      });
    }
  };

  const handlePostListing = () => {
    toast({
      title: "Success",
      description: "Property listing has been posted",
      duration: 3000,
    });
  };

  const handleAddRenter = () => {
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

  if (isLoading || isQuestionsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Rest of your JSX remains the same */}
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
                {precheckQuestions.length === 0 ? (
                  <div className="text-center p-8 border rounded-md">
                    <p className="text-muted-foreground">No questions added yet. Add your first question below.</p>
                  </div>
                ) : (
                  precheckQuestions.map((question) => (
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
                  ))
                )}
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