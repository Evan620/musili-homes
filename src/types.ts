export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  photo?: string;
  role: 'admin' | 'agent';
  created_at?: string;
  auth_id?: string;
}

export interface Agent {
  id: number; // This is the same as user.id
  bio?: string;
  user_auth_id?: string;
  // Include user fields for convenience
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: 'agent';
  created_at?: string;
  auth_id?: string;
}

export interface Admin {
  id: number; // This is the same as user.id
  // Include user fields for convenience
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  role: 'admin';
  created_at?: string;
  auth_id?: string;
}

export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  featured?: boolean;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented';
  agent_id: number;
  created_at?: string;
  agent_auth_id?: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date?: string;
  agent_id: number;
  created_at?: string;
  agent_auth_id?: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at?: string;
  sender_auth_id?: string;
  receiver_auth_id?: string;
}

export interface AgentProperty {
  agent_id: number;
  property_id: number;
}

// Form types
export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  featured: boolean;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented';
  agentId: number;
  images?: File[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  due_date?: string;
  agent_id: number;
}

export interface AgentFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'agent';
}
