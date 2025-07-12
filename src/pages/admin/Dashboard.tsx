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
  Edit, Trash2, Key, Eye, EyeOff, AlertTriangle, Copy,
  TrendingUp, Activity, Clock, Star, Award, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Zap, Bell, UserPlus
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
import { deleteAgent, updateAgent, resetAgentPassword, getAgentPassword } from '@/services/adminUserService';
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
          agentId: data.agentId, // Fixed: use agentId instead of agent_id
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

    console.log('🔍 Selected agent for update:', selectedAgentForAction);
    console.log('🔍 Agent ID being used:', selectedAgentForAction.id);
    console.log('🔍 Update values:', values);

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

    // Try to get stored password
    if (user?.id) {
      try {
        const result = await getAgentPassword(agent.id.toString(), user.id);
        if (result.success && result.password) {
          setSelectedAgentForAction({
            ...agent,
            tempPassword: result.password
          });
        }
      } catch (error) {
        console.log('Could not retrieve stored password:', error);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAgentForAction || !user?.id) return;

    try {
      const result = await resetAgentPassword(selectedAgentForAction.id.toString(), user.id);

      if (result.success && result.credentials) {
        // Check if this is a password reset email or actual password
        const isPasswordResetEmail = result.credentials.password.includes('password reset email');

        // Update the selected agent with the new password info
        setSelectedAgentForAction({
          ...selectedAgentForAction,
          tempPassword: result.credentials.password
        });

        if (isPasswordResetEmail) {
          toast({
            title: "Password Reset Email Sent",
            description: `A password reset email has been sent to ${selectedAgentForAction.name} (${result.credentials.email}). They will need to check their email and follow the reset link to set a new password.`,
          });
        } else {
          toast({
            title: "New Password Generated",
            description: `New password generated for ${selectedAgentForAction.name}. Share this password securely with the agent.`,
          });
        }
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] relative overflow-hidden font-samsung">
      {/* Samsung-style floating background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-gold-whisper/10 to-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Samsung-style Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#fbbf24] rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 text-lg font-samsung">Welcome back, {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/40 shadow-lg shadow-black/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-samsung-bold text-slate-700">System Online</span>
              </div>

              <Button variant="ghost" size="sm" className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-3 hover:bg-white/80 transition-all duration-300 shadow-lg shadow-black/5">
                <Bell className="h-5 w-5 text-slate-700" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-lg">5</span>
              </Button>

              <Button
                variant="ghost"
                className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold text-slate-700 hover:bg-white/80 transition-all duration-300 shadow-lg shadow-black/5 border border-white/40"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10">
        {/* Welcome Section with Modern Typography */}
        {/* Samsung-style Welcome Section */}
        <div className="mb-12">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl shadow-black/10 border border-white/30 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">👋</div>
                    <div>
                      <h2 className="text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Admin
                      </h2>
                      <p className="text-xl text-slate-600 font-samsung">
                        Your real estate empire awaits your command
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Properties</p>
                          <p className="text-lg font-bold text-slate-900">{totalProperties}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Agents</p>
                          <p className="text-lg font-bold text-slate-900">{totalAgents}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Value</p>
                          <p className="text-lg font-bold text-slate-900">{formatCurrency(totalSaleValue)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <ListChecks className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Tasks</p>
                          <p className="text-lg font-bold text-slate-900">{tasks?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Samsung-style Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Property Management Card - Samsung Style */}
          <div
            className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer"
            onClick={() => navigate('/admin/property-management')}
          >
            {/* Floating background gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <ArrowUpRight className="h-6 w-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Properties
                </h3>
                <p className="text-slate-600 leading-relaxed font-samsung">
                  Manage listings, pricing, and property details
                </p>
              </div>

              {/* Progress indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-slate-500 mb-2 font-samsung">
                  <span>Active listings</span>
                  <span>{totalProperties} properties</span>
                </div>
                <div className="w-full bg-slate-200/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4 shadow-lg shadow-blue-500/30"></div>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
            <DialogTrigger asChild>
              {/* Assign New Task Card - Samsung Style */}
              <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <ListChecks className="h-8 w-8 text-white" />
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Assign New Task
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-samsung">
                      Create and assign tasks to agents
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                      <span>Active agents</span>
                      <span>{totalAgents} members</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full w-4/5 shadow-lg shadow-emerald-500/30"></div>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* Quick Actions Card - Samsung Style */}
              <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Quick Add
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Add properties, agents, and tasks
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                      <span>Recent additions</span>
                      <span>24 this week</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full w-3/5 shadow-lg shadow-amber-500/30"></div>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* Create New Agent Card - Samsung Style */}
              <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#4338ca] rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <ArrowUpRight className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Create New Agent
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-samsung">
                      Add new team members to your agency
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                      <span>Growth rate</span>
                      <span>+15% this month</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-5/6 shadow-lg shadow-indigo-500/30"></div>
                    </div>
                  </div>
                </div>
              </div>
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

        {/* Samsung-style Analytics Dashboard */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2">
                Portfolio Analytics
              </h3>
              <p className="text-slate-600 text-lg font-samsung">Real-time business intelligence</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/50 shadow-lg shadow-black/5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Live Data</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Properties Analytics Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-green-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-green-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-bold text-green-600">+8%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {totalProperties}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Properties</p>
                    <p className="text-sm font-samsung text-slate-500">Active listings</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-4/5 shadow-lg shadow-blue-500/30"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">80% occupancy rate</p>
                </div>
              </div>
            </div>

            {/* Agents Analytics Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-600">+12%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {totalAgents}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Agents</p>
                    <p className="text-sm font-samsung text-slate-500">Team members</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full w-5/6 shadow-lg shadow-emerald-500/30"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">83% active this week</p>
                </div>
              </div>
            </div>

            {/* Portfolio Value Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-amber-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-bold text-amber-600">+25%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {formatCurrency(totalSaleValue)}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Portfolio Value</p>
                    <p className="text-sm font-samsung text-slate-500">Total KES worth</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full w-3/4 shadow-lg shadow-amber-500/30"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">75% of yearly target</p>
                </div>
              </div>
            </div>

            {/* Average Value Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <PieChart className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-purple-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-purple-600" />
                      <span className="text-xs font-bold text-purple-600">+18%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {formatCurrency(averagePropertyValue)}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Avg. Value</p>
                    <p className="text-sm font-samsung text-slate-500">Per property</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-4/5 shadow-lg shadow-purple-500/30"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Above market average</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabbed Interface */}
        <Tabs defaultValue="properties" className="w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-2 shadow-lg border border-slate-200/50 mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2 p-0">
              <TabsTrigger
                value="properties"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 px-6 font-medium transition-all duration-300 hover:scale-105"
              >
                <Home className="mr-2 h-5 w-5" /> Properties
              </TabsTrigger>
              <TabsTrigger
                value="agents"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 px-6 font-medium transition-all duration-300 hover:scale-105"
              >
                <Users className="mr-2 h-5 w-5" /> Agents
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 px-6 font-medium transition-all duration-300 hover:scale-105"
              >
                <ListChecks className="mr-2 h-5 w-5" /> Tasks
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl py-3 px-6 font-medium transition-all duration-300 hover:scale-105"
              >
                <MessageSquare className="mr-2 h-5 w-5" /> Messages
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="properties" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Properties Overview</h3>
                    <p className="text-slate-500 text-sm">Manage your property portfolio</p>
                  </div>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-600 font-semibold text-sm">{properties?.length || 0} Total</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/50">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Property</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Location</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Price</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Status</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Agent</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {properties?.slice(0, 5).map((property, index) => {
                      const propertyAgent = agents?.find(agent => agent.id === property.agent_id);
                      return (
                        <tr key={property.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 group">
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                              <span className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{property.title}</span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-slate-600 font-medium">{property.location}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="font-bold text-amber-600 text-lg">{formatCurrency(property.price)} KES</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                              property.status === 'For Sale' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' :
                              property.status === 'For Rent' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                              property.status === 'Sold' ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white' :
                              property.status === 'Rented' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                              'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
                            }`}>
                              {property.status}
                            </span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                                <span className="text-slate-600 font-medium text-sm">
                                  {propertyAgent?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <span className="text-slate-700 font-medium">{propertyAgent?.name || 'Unassigned'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    }) || []}
                </tbody>
              </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Team Management</h3>
                    <p className="text-slate-500 text-sm">Manage your real estate agents</p>
                  </div>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-full">
                  <span className="text-emerald-600 font-semibold text-sm">{agents?.length || 0} Agents</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/50">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Agent</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Contact</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Properties</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Tasks</th>
                      <th className="py-4 px-6 text-left font-semibold text-slate-700 uppercase tracking-wide text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {agents?.map((agent) => {
                      const agentPropertyCount = properties?.filter(p => p.agent_id === agent.id).length || 0;
                      const agentTaskCount = tasks?.filter(t => t.agent_id === agent.id).length || 0;
                      const hasBlockingItems = agentPropertyCount > 0 || agentTaskCount > 0;

                      return (
                        <tr key={agent.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200 group">
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-4">
                              <UserAvatar
                                src={agent.photo}
                                name={agent.name}
                                size="md"
                                className="ring-2 ring-emerald-100 group-hover:ring-emerald-200 transition-all"
                              />
                              <div>
                                <span className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{agent.name}</span>
                                <p className="text-slate-500 text-sm">{agent.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="space-y-1">
                              <p className="text-slate-700 font-medium">{agent.email}</p>
                              <p className="text-slate-500 text-sm">{agent.phone}</p>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${agentPropertyCount > 0 ? 'bg-orange-400' : 'bg-slate-300'}`}></div>
                              <span className={`font-bold text-lg ${agentPropertyCount > 0 ? "text-orange-600" : "text-slate-500"}`}>
                                {agentPropertyCount}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${agentTaskCount > 0 ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                              <span className={`font-bold text-lg ${agentTaskCount > 0 ? "text-blue-600" : "text-slate-500"}`}>
                                {agentTaskCount}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200 hover:scale-105"
                                onClick={() => setSelectedAgent(agent.id)}
                                title="Send message to agent"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all duration-200 hover:scale-105"
                                onClick={() => handleViewCredentials(agent)}
                                title="View login credentials"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200 hover:scale-105"
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
                                    ? "text-slate-400 border-slate-200 cursor-not-allowed rounded-xl"
                                    : "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-200 hover:scale-105"
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
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <TaskManagement />
          </TabsContent>
          
          <TabsContent value="messages" className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Communication Hub</h3>
                    <p className="text-slate-500 text-sm">Manage agent communications</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
                    <h4 className="font-bold text-lg mb-6 text-slate-800 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-purple-500" />
                      Team Members
                    </h4>
                    <div className="space-y-3">
                      {agents?.map(agent => (
                        <div
                          key={agent.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                            selectedAgent === agent.id
                              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                          }`}
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <UserAvatar
                            src={agent.photo}
                            name={agent.name}
                            size="lg"
                            className="ring-2 ring-purple-100"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{agent.name}</p>
                            <p className="text-sm text-slate-500">{agent.email}</p>
                          </div>
                          {selectedAgent === agent.id && (
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      )) || []}
                    </div>
                  </div>
                </div>
              
                <div className="lg:col-span-3">
                  {selectedAgent ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 h-[600px]">
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
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 h-[600px] flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg font-medium">Select an agent to start messaging</p>
                        <p className="text-slate-400 text-sm mt-2">Choose a team member from the list to begin a conversation</p>
                      </div>
                    </div>
                  )}
                </div>
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
                <Label className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>Email</Label>
                <div className="mt-1 p-3 bg-soft-ivory rounded-md border border-satin-silver">
                  <span className="text-sm" style={{ color: 'hsl(var(--deep-charcoal))' }}>{selectedAgentForAction?.email}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium" style={{ color: 'hsl(var(--deep-charcoal))' }}>Password</Label>
                <div className="mt-1 p-3 bg-soft-ivory rounded-md border border-satin-silver flex items-center justify-between">
                  <span className="text-sm font-mono" style={{ color: 'hsl(var(--deep-charcoal))' }}>
                    {showPassword ? (selectedAgentForAction?.tempPassword || 'No password available') : '••••••••'}
                  </span>
                  <div className="flex space-x-1">
                    {selectedAgentForAction?.tempPassword && !selectedAgentForAction.tempPassword.includes('Password reset email') && (
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
                      <strong>No password available:</strong> Click "Generate New Password" below to create a new password for this agent.
                    </p>
                  </div>
                )}
                {selectedAgentForAction?.tempPassword && selectedAgentForAction.tempPassword.includes('Password reset email') && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-700">
                      <strong>Password Reset Email Sent:</strong> The agent will receive an email to set a new password.
                    </p>
                  </div>
                )}
                {selectedAgentForAction?.tempPassword && !selectedAgentForAction.tempPassword.includes('Password reset email') && !selectedAgentForAction.tempPassword.includes('Password stored securely') && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Initial Password:</strong> This is the password generated when the agent was created.
                      Share this securely with the agent.
                    </p>
                  </div>
                )}
                {selectedAgentForAction?.tempPassword && selectedAgentForAction.tempPassword.includes('Password stored securely') && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Secure Storage:</strong> The password is stored securely. Use "Reset Password" to send new credentials to the agent.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Share the generated password securely with the agent.
                  They can change their password after logging in. Click "Generate New Password" to create a fresh password.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleResetPassword}
                className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                Generate New Password
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
