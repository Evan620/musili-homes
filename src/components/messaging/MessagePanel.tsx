import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addMessage } from '@/services/database';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: number;
  sender_auth_id: string;
  receiver_auth_id: string;
  content: string;
  sent_at: string;
}

interface User {
  id: number; // integer PK (legacy)
  auth_id: string; // UUID
  name: string;
  role: 'agent' | 'admin';
}

interface MessagePanelProps {
  currentUser: User;
  recipient: User;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ currentUser, recipient }) => {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages for the current conversation using React Query
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery<Message[]>({
    queryKey: [
      'messages',
      'conversation',
      currentUser.auth_id,
      recipient.auth_id,
    ],
    queryFn: async () => {
      if (!currentUser.auth_id || !recipient.auth_id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_auth_id.eq.${currentUser.auth_id},receiver_auth_id.eq.${recipient.auth_id}),and(sender_auth_id.eq.${recipient.auth_id},receiver_auth_id.eq.${currentUser.auth_id})`
        )
        .order('sent_at', { ascending: true });
      if (error) {
        throw new Error('Failed to load messages');
      }
      return (data || []).map((msg: any) => ({
        ...msg,
        sender_auth_id: msg.sender_auth_id ?? msg.sender_id,
        receiver_auth_id: msg.receiver_auth_id ?? msg.receiver_id,
      }));
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!currentUser.auth_id || !recipient.auth_id) return;

    const result = await addMessage({
      sender_id: currentUser.auth_id,
      receiver_id: recipient.auth_id,
      content: newMessage,
    });

    if (result.success && result.message) {
      setNewMessage('');
      toast({ title: 'Message Sent', description: `Message sent to ${recipient.name}` });
      // Invalidate the conversation query so both users see the new message instantly
      queryClient.invalidateQueries({
        queryKey: [
          'messages',
          'conversation',
          currentUser.auth_id,
          recipient.auth_id,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          'messages',
          'conversation',
          recipient.auth_id,
          currentUser.auth_id,
        ],
      });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to send message', variant: 'destructive' });
    }
  };

  return (
    <Card className="flex flex-col h-[500px] bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          {recipient.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{recipient.name}</h3>
          <p className="text-sm text-gray-500">{recipient.role === 'admin' ? 'Administrator' : 'Agent'}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : isError ? (
          <div className="text-center text-red-500">Failed to load messages</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">No messages yet</div>
        ) : (
          messages.map(message => (
          <div 
            key={message.id} 
              className={`max-w-[80%] ${message.sender_auth_id === currentUser.auth_id ?
              'ml-auto bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' : 
              'mr-auto bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'} p-3`}
          >
              <p>{message.content}</p>
            <span className="text-xs opacity-70 block text-right">
                {new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
        <Input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Type your message..."
          className="flex-1 bg-white text-gray-900 border-gray-200"
        />
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700:bg-blue-600">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default MessagePanel;
