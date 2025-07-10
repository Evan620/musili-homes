
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { User, MessageCircle } from 'lucide-react';
import { globalMessages } from '@/components/properties/ContactAgentForm';

interface ClientListProps {
  agentId: number;
  onSelectClient: (clientId: number, clientName: string) => void;
}

interface ClientInfo {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const ClientList: React.FC<ClientListProps> = ({ agentId, onSelectClient }) => {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  useEffect(() => {
    // Get all messages sent to this agent from clients (senderId: 0)
    const clientMessages = globalMessages.filter(
      msg => msg.receiverId === agentId && msg.senderId === 0
    );

    // Extract unique client information
    const uniqueClients: ClientInfo[] = [];
    const processedClients = new Set<string>();

    clientMessages.forEach(msg => {
      if (msg.clientInfo && !processedClients.has(msg.clientInfo.email)) {
        processedClients.add(msg.clientInfo.email);
        
        // Create a unique ID for this client based on their email
        const clientId = msg.clientInfo.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').charCodeAt(0) * 1000;
        
        uniqueClients.push({
          id: clientId,
          name: msg.clientInfo.name,
          lastMessage: msg.content.substring(0, 30) + '...',
          timestamp: msg.timestamp,
          unreadCount: msg.read ? 0 : 1
        });
      }
    });

    // Sort by most recent message
    uniqueClients.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setClients(uniqueClients);
  }, [agentId, globalMessages]);

  const handleSelectClient = (clientId: number, clientName: string) => {
    setSelectedClientId(clientId);
    onSelectClient(clientId, clientName);
  };

  if (clients.length === 0) {
    return (
      <Card className="p-4">
        <h4 className="font-bold text-lg mb-3">Client Inquiries</h4>
        <div className="text-center p-4 text-gray-500">
          No client inquiries yet
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="font-bold text-lg mb-3">Client Inquiries</h4>
      <div className="space-y-2">
        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => handleSelectClient(client.id, client.name)}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
              selectedClientId === client.id
                ? 'bg-blue-100'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="bg-green-100 p-2 rounded-full">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between">
                <p className="font-medium truncate">{client.name}</p>
                {client.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {client.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{client.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ClientList;
