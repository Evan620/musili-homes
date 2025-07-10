import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UserPlus, Eye, EyeOff, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createAgentAccount } from '@/services/adminUserService';
import { useQueryClient } from '@tanstack/react-query';
import { AGENT_QUERY_KEYS } from '@/hooks/useAgents';
import { supabase } from '@/integrations/supabase/client';

// Schema for creating new agents
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

interface AddAgentFormProps {
  onAgentCreated?: () => void;
  onCredentialsGenerated?: (creds: { email: string; password: string }) => void;
}

const AddAgentForm: React.FC<AddAgentFormProps> = ({ onAgentCreated, onCredentialsGenerated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      bio: "",
    },
  });

  const handleCreateAgent = async (values: AgentFormData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in as an admin to create agents.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Pass the Supabase Auth UUID directly
      const result = await createAgentAccount(values, user.id);

      if (result.success && result.credentials) {
        if (onCredentialsGenerated) {
          onCredentialsGenerated({
            email: result.credentials.email,
            password: result.credentials.password,
          });
        }

        toast({
          title: "Agent Created",
          description: `The agent's login credentials are shown below. Please copy and share them securely with the agent. The agent must log in for the first time to complete registration.`
        });

        queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
        onAgentCreated?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create agent. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateAgent)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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
                control={form.control}
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreating} className="bg-navy text-white hover:bg-navy/90">
                  {isCreating ? "Creating..." : "Create Agent"}
                </Button>
              </div>
            </form>
          </Form>
    </div>
  );
};

export default AddAgentForm;
