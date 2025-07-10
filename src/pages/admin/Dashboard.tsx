import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties, usePropertyMutations } from '@/hooks/useProperties';
import { useAgents, useTasks, useTaskMutations } from '@/hooks/useData';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home, Users, DollarSign, PieChart, LogOut,
  Plus, Calendar, ListChecks, MessageSquare, Upload, Loader2,
  Edit, Trash2, Key, Eye, EyeOff, AlertTriangle, Copy
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PropertyForm } from '@/components/properties/PropertyForm';
import { Task, Property } from "@/types";
import { useToast } from '@/hooks/use-toast';
import MessagePanel from '@/components/messaging/MessagePanel';
import { LoadingState, ErrorState } from '@/components/ui/loading';
import AddAgentForm from '@/components/admin/AddAgentForm';
import TaskManagement from '@/components/admin/TaskManagement';
import UserAvatar from '@/components/ui/user-avatar';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { deleteAgent, updateAgent, resetAgentPassword } from '@/services/adminUserService';
import { useQueryClient } from '@tanstack/react-query';
import { AGENT_QUERY_KEYS } from '@/hooks/useAgents';
// import ThemeToggle from '@/components/ThemeToggle'; // Removed - dark mode disabled

const taskSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  due_date: z.string(),
  agent_id: z.number(),
});

// Schema for agent editing
const agentSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
});

interface AgentFormData {
  name: string;
  email: string;
  phone?: string;
  bio: string;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data hooks
  const { data: properties, isLoading: propertiesLoading, isError: propertiesError, error: propertiesErrorDetails } = useProperties();
  const { data: agents, isLoading: agentsLoading, isError: agentsError } = useAgents();
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { createProperty } = usePropertyMutations();
  const { createTask } = useTaskMutations();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);

  // Agent management state
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [isDeleteAgentDialogOpen, setIsDeleteAgentDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [selectedAgentForAction, setSelectedAgentForAction] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const taskForm = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      due_date: new Date().toISOString().split('T')[0],
      agent_id: agents && agents.length > 0 ? agents[0].id : undefined, // ensure valid default
    },
  });

  const editAgentForm = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
    },
  });
  
  const [newAgentCredentials, setNewAgentCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showNewAgentPassword, setShowNewAgentPassword] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  // Loading state
  if (propertiesLoading || agentsLoading || tasksLoading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  // Error state
  if (propertiesError || agentsError || tasksError) {
    return (
      <ErrorState
        message="Failed to load dashboard data"
        error={propertiesErrorDetails}
        onRetry={() => {
          // Invalidate all queries to refetch data
          queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
          queryClient.invalidateQueries({ queryKey: ['properties'] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }}
      />
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleCreateTask = async (values: z.infer<typeof taskSchema>) => {
    if (!values.agent_id || !agents?.find(a => a.id === values.agent_id)) {
      toast({
        title: "Error",
        description: "Please select a valid agent.",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await createTask.mutateAsync({
        title: values.title,
        description: values.description,
        priority: values.priority as Task["priority"],
        status: values.status as Task["status"],
        due_date: values.due_date,
        agent_id: Number(values.agent_id), // ensure number
      });

      if (result) {
        toast({
          title: "Task Created",
          description: `Task "${result.title}" has been assigned to ${agents?.find(a => a.id === result.agent_id)?.name}`,
        });

        setTaskDialogOpen(false);
        taskForm.reset({
          title: "",
          description: "",
          priority: "Medium",
          status: "Pending",
          due_date: new Date().toISOString().split('T')[0],
          agent_id: agents?.[0]?.id || 0, // ensure number
        });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCreateProperty = async (data: any) => {
    try {
      setIsCreatingProperty(true);
      // 1. Create the property first (without images)
      const propertyResult = await createProperty.mutateAsync({
        propertyData: {
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size: data.size,
          status: data.status,
          featured: data.featured || false,
          agent_id: data.agent_id, // changed from agentId
          images: [] // No images yet
        },
        imageUrls: []
      });

      if (!propertyResult || !propertyResult.success || !propertyResult.property || !propertyResult.property.id) {
        throw new Error('Failed to create property record.');
      }
      const propertyId = propertyResult.property.id;

      // 2. Upload images to storage using the new property ID
      let imageUrls: string[] = [];
      if (data.imageFiles && data.imageFiles.length > 0) {
        try {
          const { uploadPropertyImages } = await import('@/services/storage');
          const uploadResults = await uploadPropertyImages(data.imageFiles, propertyId);
          const successfulUploads = uploadResults.filter((r: any) => r.success);
          imageUrls = successfulUploads.map((r: any) => r.url!);
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
        }
      }

      // 3. Save the image URLs in the property_images table, linked to the property ID
      if (imageUrls.length > 0) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const imageRecords = imageUrls.map(url => ({ property_id: propertyId, image_url: url }));
          const { error: imageError } = await supabase.from('property_images').insert(imageRecords);
          if (imageError) {
            console.error('Error saving property images:', imageError);
          }
        } catch (dbError) {
          console.error('Error inserting image URLs into DB:', dbError);
        }
      }

      toast({
        title: "Property Created",
        description: `Property \"${data.title}\" has been created successfully.`
      });

      // Add a small delay to ensure images are available before closing dialog
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPropertyDialogOpen(false);
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create property",
        variant: "destructive"
      });
    } finally {
      setIsCreatingProperty(false);
    }
  };

  // Calculate dashboard statistics
  const totalProperties = properties?.length || 0;
  const totalAgents = agents?.length || 0;
  const totalSaleValue = properties?.reduce((sum, property) => sum + property.price, 0) || 0;
  const averagePropertyValue = totalProperties > 0 ? totalSaleValue / totalProperties : 0;

  // Agent management handlers
  const handleEditAgent = (agent: any) => {
    setSelectedAgentForAction(agent);
    editAgentForm.reset({
      name: agent.name,
      email: agent.email,
      phone: agent.phone || "",
      bio: agent.bio || "",
    });
    setIsEditAgentDialogOpen(true);
  };

  const handleUpdateAgent = async (values: AgentFormData) => {
    if (!user?.id || !selectedAgentForAction) return;

    setIsUpdating(true);
    try {
      const result = await updateAgent(selectedAgentForAction.id, values, user.id.toString());

      if (result.success) {
        toast({
          title: "Agent Updated",
          description: `Agent ${values.name} has been updated successfully.`,
        });
        setIsEditAgentDialogOpen(false);
        // Invalidate and refetch agents data
        queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update agent.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAgent = (agent: any) => {
    setSelectedAgentForAction(agent);
    setIsDeleteAgentDialogOpen(true);
  };

  const handleViewCredentials = async (agent: any) => {
    setSelectedAgentForAction(agent);
    setShowPassword(false);
    setIsCredentialsDialogOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedAgentForAction || !user?.id) return;

    try {
      const result = await resetAgentPassword(selectedAgentForAction.id.toString(), user.id);

      if (result.success && result.credentials) {
        // Update the selected agent with the new password
        setSelectedAgentForAction({
          ...selectedAgentForAction,
          tempPassword: result.credentials.password
        });
        
        toast({
          title: "Password Reset",
          description: `New password generated for ${selectedAgentForAction.name}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteAgent = async () => {
    if (!selectedAgentForAction || !user?.id) return;

    setIsDeleting(true);
    try {
      const result = await deleteAgent(selectedAgentForAction.id, user.id);

      if (result.success) {
        toast({
          title: "Agent Deleted",
          description: `Agent ${selectedAgentForAction.name} has been deleted.`,
        });
        setIsDeleteAgentDialogOpen(false);
        // Invalidate and refetch agents data
        queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete agent.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-gray-700">
            Here's an overview of your real estate portfolio and performance.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            className="bg-navy text-white hover:bg-navy/90"
            onClick={() => navigate('/admin/property-management')}
          >
            <Home className="mr-2 h-4 w-4" />
            Manage Properties
          </Button>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy hover:bg-gold/90">
                <Plus className="mr-2 h-4 w-4" />
                Assign New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign New Task to Agent</DialogTitle>
                <DialogDescription className="">
                  Create a new task and assign it to one of your agents.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...taskForm}>
                <form onSubmit={taskForm.handleSubmit(handleCreateTask)} className="space-y-4 pt-4">
                  <FormField
                    control={taskForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title..." {...field} className="" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={taskForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description..." {...field} className="" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="">
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="">
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={taskForm.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={taskForm.control}
                      name="agent_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="">Assign To</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value ? field.value.toString() : undefined}
                            disabled={!agents || agents.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="">
                                <SelectValue placeholder="Select agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="">
                              {agents?.map(agent => (
                                <SelectItem key={agent.id} value={agent.id.toString()}>
                                  {agent.name}
                                </SelectItem>
                              )) || []}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTaskDialogOpen(false)}
                      disabled={createTask.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createTask.isPending || !agents || agents.length === 0}
                    >
                      {createTask.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Task
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy text-white hover:bg-navy/90">
                <Home className="mr-2 h-4 w-4" />
                Add New Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Property</DialogTitle>
                <DialogDescription>
                  Create a new property listing and assign it to an agent.
                </DialogDescription>
              </DialogHeader>
              <PropertyForm
                onSubmit={handleCreateProperty}
                onCancel={() => setPropertyDialogOpen(false)}
                agents={agents?.map(a => ({ id: a.id, name: a.name })) || []}
                isLoading={createProperty.isPending || isCreatingProperty}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gold text-navy hover:bg-gold/90">
                <Users className="mr-2 h-4 w-4" />
                Add New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Create a new agent account and generate login credentials.
                </DialogDescription>
              </DialogHeader>
              <AddAgentForm
                onAgentCreated={() => setAgentDialogOpen(false)}
                onCredentialsGenerated={(creds) => setNewAgentCredentials(creds)}
              />
            </DialogContent>
          </Dialog>

          {newAgentCredentials && (
            <Dialog open={true}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Agent Created Successfully!</DialogTitle>
                  <DialogDescription>
                    Please save these login credentials and share them securely with the agent.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border flex items-center justify-between">
                      <span className="text-sm">{newAgentCredentials.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {navigator.clipboard.writeText(newAgentCredentials.email); toast({title: 'Copied', description: 'Copied to clipboard'});}}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Password</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border flex items-center justify-between">
                      <span className="text-sm font-mono">
                        {showNewAgentPassword ? newAgentCredentials.password : '••••••••'}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAgentPassword(!showNewAgentPassword)}
                        >
                          {showNewAgentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {navigator.clipboard.writeText(newAgentCredentials.password); toast({title: 'Copied', description: 'Copied to clipboard'});}}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Important:</strong> Save these credentials now. The agent can change their password after first login.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setNewAgentCredentials(null)}>
                    I've Saved the Credentials
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Agents</p>
                <h3 className="text-2xl font-bold">{totalAgents}</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Portfolio Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalSaleValue)} KES</h3>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Property Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(averagePropertyValue)} KES</h3>
              </div>
            </div>
          </Card>
        </div>
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              <Home className="mr-1 h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="agents">
              <Users className="mr-1 h-4 w-4" /> Agents
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ListChecks className="mr-1 h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-1 h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="properties" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Properties</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Price (KES)</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {properties?.slice(0, 5).map((property) => {
                    const propertyAgent = agents?.find(agent => agent.id === property.agent_id); // changed from agentId
                    return (
                      <tr key={property.id} className="border-b">
                        <td className="py-3 px-4">{property.title}</td>
                        <td className="py-3 px-4">{property.location}</td>
                        <td className="py-3 px-4">{formatCurrency(property.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            property.status === 'For Sale' ? 'bg-red-500 text-white' :
                            property.status === 'For Rent' ? 'bg-green-500 text-white' :
                            property.status === 'Sold' ? 'bg-gray-500 text-white' :
                            property.status === 'Rented' ? 'bg-purple-500 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{propertyAgent?.name || 'Unassigned'}</td>
                      </tr>
                    );
                  }) || []}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Agents</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Agent</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Phone</th>
                    <th className="py-3 px-4 text-left">Properties</th>
                    <th className="py-3 px-4 text-left">Tasks</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents?.map((agent) => {
                    const agentPropertyCount = properties?.filter(p => p.agent_id === agent.id).length || 0; // changed from agentId
                    const agentTaskCount = tasks?.filter(t => t.agent_id === agent.id).length || 0; // changed from agentId
                    const hasBlockingItems = agentPropertyCount > 0 || agentTaskCount > 0;

                    return (
                      <tr key={agent.id} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <UserAvatar
                              src={agent.photo}
                              name={agent.name}
                              size="md"
                              className="mr-3"
                            />
                            <span className="">{agent.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{agent.email}</td>
                        <td className="py-3 px-4">{agent.phone}</td>
                        <td className="py-3 px-4">
                          <span className={agentPropertyCount > 0 ? "text-orange-600 font-medium" : ""}>
                            {agentPropertyCount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={agentTaskCount > 0 ? "text-blue-600 font-medium" : ""}>
                            {agentTaskCount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => setSelectedAgent(agent.id)}
                              title="Send message to agent"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleViewCredentials(agent)}
                              title="View login credentials"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                              onClick={() => handleEditAgent(agent)}
                              title="Edit agent details"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                hasBlockingItems
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-red-600 border-red-600 hover:bg-red-50"
                              }
                              disabled={hasBlockingItems}
                              onClick={() => handleDeleteAgent(agent)}
                              title={
                                hasBlockingItems
                                  ? (() => {
                                      const issues = [];
                                      if (agentPropertyCount > 0) issues.push(`${agentPropertyCount} property(ies)`);
                                      if (agentTaskCount > 0) issues.push(`${agentTaskCount} task(s)`);
                                      return `Cannot delete: Agent has ${issues.join(' and ')} assigned`;
                                    })()
                                  : "Delete agent"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) || []}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>
          
          <TabsContent value="messages" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Messages</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h4 className="font-bold text-lg mb-3">Agents</h4>
                  {agents?.map(agent => (
                    <div
                      key={agent.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer mb-2 ${selectedAgent === agent.id ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <UserAvatar
                        src={agent.photo}
                        name={agent.name}
                        size="lg"
                      />
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-gray-500">{agent.email}</p>
                      </div>
                    </div>
                  )) || []}
                </Card>
              </div>
              
              <div className="lg:col-span-3">
                {selectedAgent ? (
                  <MessagePanel
                    currentUser={{
                      id: Number(user?.id) || 0,
                      name: user?.name || '',
                      role: 'admin',
                      auth_id: (user as any)?.auth_id || '',
                    }}
                    recipient={(() => {
                      const agent = agents?.find(a => a.id === selectedAgent);
                      if (agent) {
                        return {
                          id: agent.id,
                          name: agent.name,
                          role: agent.role || 'agent',
                          auth_id: agent.auth_id || '',
                        };
                      }
                      return { id: 0, name: '', role: 'agent', auth_id: '' };
                    })()}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Select an agent to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>


        </Tabs>

        {/* Agent Management Dialogs */}

        {/* View Credentials Dialog */}
        <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agent Login Credentials</DialogTitle>
              <DialogDescription>
                Login credentials for {selectedAgentForAction?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <span className="text-sm">{selectedAgentForAction?.email}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Password</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border flex items-center justify-between">
                  <span className="text-sm font-mono">
                    {showPassword ? (selectedAgentForAction?.tempPassword || 'Click "Reset Password" to generate new password') : '••••••••'}
                  </span>
                  <div className="flex space-x-1">
                    {selectedAgentForAction?.tempPassword && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedAgentForAction.tempPassword);
                            toast({
                              title: "Copied",
                              description: "Password copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {!selectedAgentForAction?.tempPassword && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs text-amber-700">
                      <strong>No password available:</strong> Click "Reset Password" below to generate a new password for this agent.
                    </p>
                  </div>
                )}
                {selectedAgentForAction?.tempPassword && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Admin Access:</strong> This password is generated for administrative purposes.
                      Agents can change their password after login.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Share these credentials securely with the agent.
                  They can change their password after first login.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleResetPassword}
                className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                Reset Password
              </Button>
              <Button onClick={() => setIsCredentialsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Agent Confirmation Dialog */}
        <Dialog open={isDeleteAgentDialogOpen} onOpenChange={setIsDeleteAgentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Agent</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedAgentForAction?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">Warning</h3>
              </div>
              <p className="text-red-700 text-sm">
                This will permanently delete the agent's account and all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteAgentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteAgent}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Agent"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Agent Dialog */}
        <Dialog open={isEditAgentDialogOpen} onOpenChange={setIsEditAgentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
              <DialogDescription>
                Update agent information and details.
              </DialogDescription>
            </DialogHeader>

            <Form {...editAgentForm}>
              <form onSubmit={editAgentForm.handleSubmit(handleUpdateAgent)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editAgentForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter agent's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editAgentForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter agent's email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editAgentForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter agent's phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editAgentForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a brief bio for the agent..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditAgentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Updating..." : "Update Agent"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
