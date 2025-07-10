
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Agent, Property } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ContactAgentFormProps {
  agent: Agent | null;
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

// This would be replaced with a real database in a production app
// Shared message storage to be accessible from both MessagePanel and ContactAgentForm
export const globalMessages = [];

const ContactAgentForm: React.FC<ContactAgentFormProps> = ({ agent, property, isOpen, onClose }) => {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: `Hello, I'm interested in "${property.title}" (${property.address}).`
    },
  });

  const onSubmit = (data: FormValues) => {
    if (!agent) {
      toast({
        title: "Error",
        description: "No agent assigned to this property",
        variant: "destructive",
      });
      return;
    }

    // Create new message to be sent to agent
    const message = {
      id: Date.now(), // Simple ID generation
      senderId: 0, // 0 represents client/guest users
      receiverId: agent.id,
      content: `
        Inquiry about: ${property.title}
        From: ${data.name}
        Email: ${data.email}
        Phone: ${data.phone}
        Message: ${data.message}
      `,
      timestamp: new Date().toISOString(),
      read: false,
      clientInfo: {
        name: data.name,
        email: data.email,
        phone: data.phone
      },
      propertyInfo: {
        id: property.id,
        title: property.title
      }
    };

    // Add message to global messages array
    globalMessages.push(message);
    
    console.log('Form submitted:', data);
    console.log('Property:', property.id);
    console.log('Agent:', agent?.id);
    
    toast({
      title: "Message Sent Successfully",
      description: `Your inquiry about "${property.title}" has been sent to ${agent?.name}. They will contact you shortly.`,
    });
    
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Contact Agent</DialogTitle>
          <DialogDescription>
            Send a message to {agent?.name} about this property.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+254 700 000 000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="I'm interested in viewing this property..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Send Message</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAgentForm;
