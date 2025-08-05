import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Agent, Task } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import {
  Home, DollarSign, Users, LogOut, CheckCircle, MessageSquare,
  TrendingUp, Activity, Clock, Star, Award, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Zap, Bell,
  Calendar, MapPin, Eye, User, Settings
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import MessagePanel from '@/components/messaging/MessagePanel';
import ClientList from '@/components/messaging/ClientList';
import { Badge } from '@/components/ui/badge';

const AgentDashboard: React.FC = () => {
  const { isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeContact, setActiveContact] = useState<{id: number; name: string; role: 'admin' | 'client'}>({
    id: 1,
    name: "John Musilli",
    role: "admin"
  });

  // Redirect if not agent
  if (!isAgent) {
    navigate('/login');
    return null;
  }

  // Use React Query to fetch agent properties with real-time updates
  const { data: agentProperties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First, get the agent's ID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id' as any, user.id)
        .single();

      if (userError || !userData) {
        console.error('Error finding user:', userError);
        return [];
      }

      // Then fetch properties using agent_id
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', userData.id);

      if (error) {
        console.error('Error loading agent properties:', error);
        throw error;
      }

      // Map the database properties to our Property type
      return data?.map(prop => ({
        id: prop.id,
        title: prop.title,
        description: prop.description || '',
        price: Number(prop.price),
        location: prop.location,
        address: prop.address,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        size: prop.size || 0,
        featured: prop.featured || false,
        status: prop.status as 'For Sale' | 'For Rent' | 'Sold' | 'Rented',
        agentId: prop.agent_id,
        images: [] // Will be loaded separately if needed
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds - shorter for more responsive updates
    refetchOnWindowFocus: true,
  });

  // Use React Query to fetch agent tasks with real-time updates
  const { data: agentTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['agent-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First, get the agent's ID from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id' as any, user.id)
        .single();

      if (userError || !userData) {
        console.error('Error finding user:', userError);
        return [];
      }

      // Then fetch tasks using agent_id
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('agent_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading agent tasks:', error);
        throw error;
      }

      // Map the database tasks to our Task type
      return data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as 'Low' | 'Medium' | 'High',
        status: task.status as 'Pending' | 'In Progress' | 'Completed',
        due_date: task.due_date || '', // Use due_date consistently
        agent_id: task.agent_id,
        created_at: task.created_at
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds - shorter for more responsive updates
    refetchOnWindowFocus: true,
  });

  const queryClient = useQueryClient();

  // Task completion mutation with React Query for real-time updates
  const { mutate: completeTask, isPending: isCompletingTask } = useMutation({
    mutationFn: async (taskId: number) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Completed' })
        .eq('id', taskId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      // Invalidate and refetch agent tasks to get real-time updates
      queryClient.invalidateQueries({ queryKey: ['agent-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Also invalidate admin tasks view

      toast({
        title: "Task Completed",
        description: "Task has been marked as completed successfully.",
      });
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!isAgent || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCompleteTask = (taskId: number) => {
    completeTask(taskId);
  };

  const handleSelectClient = (clientId: number, clientName: string) => {
    setActiveContact({
      id: clientId,
      name: clientName,
      role: "client"
    });
  };

  const handleSelectAdmin = () => {
    setActiveContact({
      id: 1,
      name: "John Musilli",
      role: "admin"
    });
  };

  // Calculate dashboard statistics
  const totalProperties = agentProperties.length;
  const totalValue = agentProperties.reduce((sum, property) => sum + property.price, 0);
  const totalInquiries = Math.floor(Math.random() * 15) + 5; // Simulated data
  const pendingTasks = agentTasks.filter(t => t.status !== 'Completed').length;

  // Show loading state while data is being fetched
  if (propertiesLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-offWhite flex items-center justify-center font-samsung">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-navy font-samsung">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] relative overflow-hidden font-samsung">
      {/* Samsung-style floating background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Samsung-style Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#60a5fa] rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
                  Agent Dashboard
                </h1>
                <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-samsung">Welcome back, {user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-3 sm:px-5 py-2 sm:py-3 border border-white/40 shadow-lg shadow-black/5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-samsung-bold text-slate-700">Online</span>
              </div>

              <Button variant="ghost" size="sm" className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-2 sm:p-3 hover:bg-white/80 transition-all duration-300 shadow-lg shadow-black/5 touch-friendly">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
                <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs flex items-center justify-center text-white font-samsung-bold shadow-lg">3</span>
              </Button>

              <Button
                variant="ghost"
                className="bg-white/60 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-2 sm:py-3 font-samsung-bold text-slate-700 hover:bg-white/80 transition-all duration-300 shadow-lg shadow-black/5 border border-white/40 touch-friendly"
                onClick={handleLogout}
              >
                <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Samsung-style Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/10 border border-white/30 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl">👋</div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                      </h2>
                      <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-samsung">
                        Ready to manage your portfolio today?
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-samsung-bold text-slate-600">Status</p>
                          <p className="text-sm sm:text-lg font-samsung-bold text-slate-900">Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-samsung-bold text-slate-600">Rating</p>
                          <p className="text-sm sm:text-lg font-samsung-bold text-slate-900">4.9/5</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/50 shadow-lg shadow-black/5 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-samsung-bold text-slate-600">Rank</p>
                          <p className="text-sm sm:text-lg font-samsung-bold text-slate-900">Top 5%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Samsung-style Dashboard Stats */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                Performance Analytics
              </h3>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-samsung">Real-time insights into your portfolio</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 border border-white/50 shadow-lg shadow-black/5 self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
                <span className="text-xs sm:text-sm font-samsung-bold text-slate-700">This Month</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Properties Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              {/* Floating background gradient */}
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Home className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="bg-green-500/10 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 border border-green-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-600" />
                      <span className="text-xs font-samsung-bold text-green-600">+5%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {totalProperties}
                  </div>
                  <div>
                    <p className="text-sm sm:text-base lg:text-lg font-samsung-bold text-slate-700">Properties</p>
                    <p className="text-xs sm:text-sm font-samsung text-slate-500">Active listings</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 sm:mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-1.5 sm:h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 sm:h-2 rounded-full w-3/4 shadow-lg shadow-blue-500/30"></div>
                  </div>
                  <p className="text-xs font-samsung text-slate-500 mt-1 sm:mt-2">75% of monthly target</p>
                </div>
              </div>
            </div>

            {/* Portfolio Value Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span className="text-xs font-samsung-bold text-emerald-600">+12%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {formatCurrency(totalValue)}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Portfolio Value</p>
                    <p className="text-sm font-samsung text-slate-500">Total KES value</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full w-4/5 shadow-lg shadow-emerald-500/30"></div>
                  </div>
                  <p className="text-xs font-samsung text-slate-500 mt-2">80% growth this quarter</p>
                </div>
              </div>
            </div>

            {/* Client Inquiries Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309] rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-amber-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-500/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-amber-600" />
                      <span className="text-xs font-samsung-bold text-amber-600">+8%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {totalInquiries}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Inquiries</p>
                    <p className="text-sm font-samsung text-slate-500">Client interest</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full w-2/3 shadow-lg shadow-amber-500/30"></div>
                  </div>
                  <p className="text-xs font-samsung text-slate-500 mt-2">67% conversion rate</p>
                </div>
              </div>
            </div>

            {/* Pending Tasks Card - Samsung Style */}
            <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] rounded-2xl shadow-lg shadow-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="bg-red-500/10 backdrop-blur-sm rounded-full px-3 py-1 border border-red-500/20">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-red-600" />
                      <span className="text-xs font-samsung-bold text-red-600">Urgent</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-4xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {pendingTasks}
                  </div>
                  <div>
                    <p className="text-lg font-samsung-bold text-slate-700">Tasks</p>
                    <p className="text-sm font-samsung text-slate-500">Pending completion</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="w-full bg-slate-200/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-1/3 shadow-lg shadow-purple-500/30"></div>
                  </div>
                  <p className="text-xs font-samsung text-slate-500 mt-2">33% completed today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Samsung-style Tabs Section */}
        <Tabs defaultValue="properties" className="w-full">
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl shadow-black/10 border border-white/40 mb-8 sm:mb-12">
            {/* Floating background for active tab */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 rounded-2xl sm:rounded-3xl"></div>

            <TabsList className="relative grid w-full grid-cols-3 bg-transparent gap-2 sm:gap-3 p-0">
              <TabsTrigger
                value="properties"
                className="group relative data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-500/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-2 sm:px-4 lg:px-8 font-samsung-bold transition-all duration-500 hover:scale-105 data-[state=active]:scale-105 overflow-hidden touch-friendly"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>
                <div className="relative flex items-center justify-center sm:justify-start gap-2 sm:gap-3 data-[state=active]:text-white text-slate-600">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/10 data-[state=active]:bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300">
                    <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="hidden sm:inline text-sm lg:text-base">Properties</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="tasks"
                className="group relative data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-emerald-500/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-2 sm:px-4 lg:px-8 font-samsung-bold transition-all duration-500 hover:scale-105 data-[state=active]:scale-105 overflow-hidden touch-friendly"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>
                <div className="relative flex items-center justify-center sm:justify-start gap-2 sm:gap-3 data-[state=active]:text-white text-slate-600">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500/10 data-[state=active]:bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="hidden sm:inline text-sm lg:text-base">Tasks</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="messages"
                className="group relative data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:shadow-purple-500/20 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-2 sm:px-4 lg:px-8 font-samsung-bold transition-all duration-500 hover:scale-105 data-[state=active]:scale-105 overflow-hidden touch-friendly"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl"></div>
                <div className="relative flex items-center justify-center sm:justify-start gap-2 sm:gap-3 data-[state=active]:text-white text-slate-600">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/10 data-[state=active]:bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="hidden sm:inline text-sm lg:text-base">Messages</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="properties" className="relative bg-white/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/10 border border-white/40 overflow-hidden">
            {/* Samsung-style header */}
            <div className="relative px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 border-b border-white/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5"></div>
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <Home className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-samsung-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Property Portfolio
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base lg:text-lg font-samsung">Manage your luxury listings</p>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-3 border border-white/50 shadow-lg shadow-black/5 self-start sm:self-auto">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-700 font-samsung-bold text-sm sm:text-base lg:text-lg">{agentProperties.length}</span>
                    <span className="text-slate-600 font-samsung text-sm sm:text-base">Properties</span>
                  </div>
                </div>
              </div>
            </div>

            {agentProperties.length > 0 ? (
              <div className="p-4 sm:p-6 lg:p-10">
                <div className="space-y-4 sm:space-y-6">
                  {agentProperties.map((property, index) => (
                    <div
                      key={property.id}
                      className="group relative bg-white/70 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-black/5 border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                    >
                      {/* Floating background gradient */}
                      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                        {/* Property Image & Info */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="relative">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Home className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg sm:text-xl font-samsung-bold text-slate-900 mb-1 truncate">{property.title}</h4>
                              <p className="text-slate-600 font-samsung text-sm sm:text-base">Property #{property.id}</p>
                              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-samsung text-slate-600 truncate">{property.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Price & Status */}
                        <div className="lg:col-span-3">
                          <div className="text-center lg:text-left">
                            <div className="text-3xl font-samsung-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                              {formatCurrency(property.price)}
                            </div>
                            <p className="text-slate-600 font-samsung">KES</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="lg:col-span-2">
                          <div className={`inline-flex items-center px-4 py-2 rounded-2xl font-samsung-bold text-sm shadow-lg ${
                            property.status === 'For Sale' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/30' :
                            property.status === 'For Rent' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/30' :
                            property.status === 'Sold' ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-gray-500/30' :
                            property.status === 'Rented' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30' :
                            'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-gray-500/30'
                          }`}>
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                            {property.status}
                          </div>
                        </div>

                        {/* Date & Actions */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-samsung text-slate-500 mb-1">Added</p>
                              <p className="font-samsung-bold text-slate-700">{property.createdAt}</p>
                            </div>
                            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 rounded-2xl px-6 py-3 font-samsung-bold transition-all duration-300 hover:scale-105">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-500/10 rounded-3xl flex items-center justify-center">
                      <Home className="h-16 w-16 text-slate-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-samsung-bold text-slate-900">No Properties Yet</h3>
                    <p className="text-slate-600 text-lg font-samsung max-w-md">
                      Your property portfolio will appear here once the admin assigns properties to you.
                    </p>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                      <p className="text-blue-700 font-samsung text-sm">
                        💡 Tip: Contact your admin to get started with property assignments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-samsung-bold text-slate-900">My Tasks</h3>
                    <p className="text-slate-600 font-samsung">Track and manage your assignments</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-emerald-50 px-4 py-2 rounded-full">
                    <span className="text-emerald-600 font-samsung-bold text-sm">{agentTasks.length} Total</span>
                  </div>
                  <div className="bg-amber-50 px-4 py-2 rounded-full">
                    <span className="text-amber-600 font-samsung-bold text-sm">{pendingTasks} Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {agentTasks.length > 0 ? (
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Task</th>
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Description</th>
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Priority</th>
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Status</th>
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Due Date</th>
                        <th className="text-left py-4 px-6 font-samsung-bold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {agentTasks.map((task, index) => (
                        <tr
                          key={task.id}
                          className={`
                            transition-all duration-200 hover:bg-slate-50/50 hover:shadow-sm
                            ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                            ${task.status === 'Completed' ? 'opacity-75' : ''}
                          `}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                task.status === 'Completed' ? 'bg-green-100' :
                                task.priority === 'High' ? 'bg-red-100' :
                                task.priority === 'Medium' ? 'bg-amber-100' : 'bg-blue-100'
                              }`}>
                                {task.status === 'Completed' ? (
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                ) : (
                                  <Clock className="h-6 w-6 text-slate-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-samsung-bold text-slate-900">{task.title}</div>
                                <div className="text-sm font-samsung text-slate-600">Task #{task.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-samsung text-slate-700 max-w-xs truncate">{task.description}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`font-samsung-bold ${
                              task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {task.priority}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`font-samsung-bold ${
                              task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {task.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm font-samsung text-slate-700">{task.due_date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {task.status !== 'Completed' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 font-samsung-bold transition-all duration-200"
                                onClick={() => handleCompleteTask(task.id)}
                                disabled={isCompletingTask}
                              >
                                {isCompletingTask ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin mr-2"></div>
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="flex items-center space-x-2 text-green-600 font-samsung-bold">
                                <CheckCircle className="h-4 w-4" />
                                <span>Completed</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-slate-100 p-6 rounded-full">
                    <CheckCircle className="h-12 w-12 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-600 font-samsung text-lg">No tasks assigned yet</p>
                    <p className="text-slate-500 font-samsung">Tasks will appear here once assigned by admin</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-samsung-bold text-slate-900">Messages</h3>
                    <p className="text-slate-600 font-samsung">Communicate with admin and clients</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-green-50 px-4 py-2 rounded-full">
                    <span className="text-green-600 font-samsung-bold text-sm">Online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                  {/* Enhanced Admin contact */}
                  <div
                    className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                      activeContact.role === 'admin'
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200 shadow-md'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                    onClick={handleSelectAdmin}
                  >
                    <div className={`p-3 rounded-xl shadow-sm ${
                      activeContact.role === 'admin' ? 'bg-blue-500' : 'bg-slate-400'
                    } group-hover:scale-110 transition-transform duration-300`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-samsung-bold text-slate-900">Admin</p>
                      <p className="text-sm font-samsung text-slate-600">John Musilli</p>
                      <p className="text-xs font-samsung text-slate-500">System Administrator</p>
                    </div>
                    {activeContact.role === 'admin' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Enhanced Client list */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-samsung-bold text-slate-900 mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Clients
                    </h4>
                    <ClientList
                      agentId={user.id}
                      onSelectClient={handleSelectClient}
                    />
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <MessagePanel
                      currentUser={{ id: user.id, name: user.name, role: 'agent' }}
                      recipient={
                        activeContact.role === 'admin'
                          ? { id: activeContact.id, name: activeContact.name, role: 'admin' }
                          : { id: activeContact.id, name: activeContact.name, role: 'agent' }
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDashboard;
