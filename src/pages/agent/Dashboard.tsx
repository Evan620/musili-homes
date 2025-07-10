import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Agent, Task } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Home, DollarSign, Users, LogOut, CheckCircle, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import MessagePanel from '@/components/messaging/MessagePanel';
import ClientList from '@/components/messaging/ClientList';

const AgentDashboard: React.FC = () => {
  const { isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeContact, setActiveContact] = useState<{id: number; name: string; role: 'admin' | 'client'}>({
    id: 1,
    name: "John Musili",
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

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_auth_id', user.id);

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
        agentId: prop.agent_auth_id,
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

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('agent_auth_id', user.id)
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
        dueDate: task.due_date || '',
        agentId: task.agent_auth_id,
        createdAt: task.created_at
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
      name: "John Musili",
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
      <div className="min-h-screen bg-offWhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-navy">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offWhite">
      <div className="bg-navy py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
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
            Manage your property listings and client inquiries from your personal dashboard.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">My Properties</p>
                <h3 className="text-2xl font-bold">{totalProperties}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalValue)} KES</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Client Inquiries</p>
                <h3 className="text-2xl font-bold">{totalInquiries}</h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Tasks</p>
                <h3 className="text-2xl font-bold">{pendingTasks}</h3>
              </div>
            </div>
          </Card>
        </div>
        
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              <Home className="mr-1 h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckCircle className="mr-1 h-4 w-4" /> My Tasks
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-1 h-4 w-4" /> Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">My Properties</h3>
            
            {agentProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Location</th>
                      <th className="py-3 px-4 text-left">Price (KES)</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentProperties.map((property) => (
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
                        <td className="py-3 px-4">{property.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties assigned to you yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">My Tasks</h3>
            
            {agentTasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left">Title</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-left">Priority</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Due Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentTasks.map((task) => (
                      <tr key={task.id} className="border-b">
                        <td className="py-3 px-4 font-medium">{task.title}</td>
                        <td className="py-3 px-4">{task.description}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{task.dueDate}</td>
                        <td className="py-3 px-4">
                          {task.status !== 'Completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 font-medium"
                              onClick={() => handleCompleteTask(task.id)}
                              disabled={isCompletingTask}
                            >
                              {isCompletingTask ? 'Completing...' : 'Mark Complete'}
                            </Button>
                          ) : (
                            <span className="text-green-600 font-medium">✓ Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No tasks assigned to you yet.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="messages" className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-navy mb-4">Messages</h3>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {/* Admin contact */}
                <div
                  className={`flex items-center gap-3 p-2 ${
                    activeContact.role === 'admin'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                  } rounded-lg cursor-pointer transition-colors`}
                  onClick={handleSelectAdmin}
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Admin</p>
                    <p className="text-xs text-gray-500">John Musili</p>
                  </div>
                </div>
                
                {/* Client list */}
                <ClientList 
                  agentId={user.id} 
                  onSelectClient={handleSelectClient} 
                />
              </div>
              
              <div className="lg:col-span-3">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDashboard;
