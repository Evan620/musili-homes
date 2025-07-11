import { supabase } from '@/integrations/supabase/client';
import { Property, Agent, User, Task, PropertyFormData } from '@/types';
import { deletePropertyImages, uploadPropertyImages } from '@/services/storage';

// Test database connection
export const testConnection = async () => {
  try {
    const { count, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { success: false, error: countError };
    }

    const { data, error: selectError } = await supabase
      .from('properties')
      .select('id, title, featured')
      .limit(5);

    if (selectError) {
      return { success: false, error: selectError };
    }

    return { success: true, count, data };
  } catch (error) {
    return { success: false, error };
  }
};

// Database functions are now working without timeout wrappers

// Properties (PUBLIC DATA accessible via RLS policies)
const getStringId = (uuidVal: any, intVal: any) => {
  if (uuidVal && typeof uuidVal === 'string') return uuidVal;
  if (uuidVal && typeof uuidVal === 'number') return uuidVal.toString();
  if (typeof intVal === 'string') return intVal;
  if (typeof intVal === 'number') return intVal.toString();
  return '';
};

export const getProperties = async (): Promise<Property[]> => {
  try {
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*');

    if (propertiesError) {
      throw propertiesError;
    }

    if (!propertiesData || propertiesData.length === 0) {
      return [];
    }

    const propertyIds = propertiesData.map(p => p.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from('property_images')
      .select('property_id, image_url')
      .in('property_id', propertyIds);

    if (imagesError) {
      console.warn('Error fetching images:', imagesError);
    }

    // Group images by property_id
    const imagesByProperty: { [key: string]: string[] } = {};
    if (imagesData) {
      imagesData.forEach(img => {
        const key = img.property_id.toString();
        if (!imagesByProperty[key]) {
          imagesByProperty[key] = [];
        }
        imagesByProperty[key].push(img.image_url);
      });
    }

    const mappedProperties = propertiesData.map(property => ({
      id: Number(property.id),
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      address: property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size,
      featured: property.featured,
      status: property.status as 'For Sale' | 'For Rent' | 'Sold' | 'Rented',
      createdAt: property.created_at,
      agent_id: property.agent_id ? Number(property.agent_id) : 0,
      images: imagesByProperty[property.id] || [],
    }));

    return mappedProperties;
  } catch (error) {
    console.error('Error in getProperties:', error);
    throw error;
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (image_url)
    `)
    .eq('id', Number(id))
    .single();
  
  if (error) {
    console.error('Error fetching property:', error);
    return null;
  }
  
  return data ? {
    id: Number(data.id),
    title: data.title,
    description: data.description || '',
    price: data.price,
    location: data.location,
    address: data.address,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    size: data.size || 0,
    featured: data.featured || false,
    status: data.status as 'For Sale' | 'For Rent' | 'Sold' | 'Rented',
    agent_id: data.agent_id ? Number(data.agent_id) : 0,
    images: data.property_images?.map((img: any) => img.image_url) || [],
    createdAt: data.created_at || new Date().toISOString()
  } : null;
};

export const getFeaturedProperties = async (): Promise<Property[]> => {
  try {
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('featured', true);

    if (propertiesError) {
      throw propertiesError;
    }

    if (!propertiesData || propertiesData.length === 0) {
      return [];
    }

    const propertyIds = propertiesData.map(p => p.id);
    const { data: imagesData, error: imagesError } = await supabase
      .from('property_images')
      .select('property_id, image_url')
      .in('property_id', propertyIds.map(id => Number(id)));

    if (imagesError) {
      console.warn('Error fetching images:', imagesError);
    }

    // Group images by property_id
    const imagesByProperty: { [key: string]: string[] } = {};
    if (imagesData) {
      imagesData.forEach(img => {
        const key = img.property_id.toString();
        if (!imagesByProperty[key]) {
          imagesByProperty[key] = [];
        }
        imagesByProperty[key].push(img.image_url);
      });
    }

    const mappedProperties = propertiesData.map(property => ({
      id: Number(property.id),
      title: property.title,
      description: property.description || '',
      price: property.price,
      location: property.location,
      address: property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size || 0,
      featured: property.featured || false,
      status: property.status as 'For Sale' | 'For Rent' | 'Sold' | 'Rented',
      agent_id: property.agent_id ? Number(property.agent_id) : 0,
      images: imagesByProperty[property.id.toString()] || [],
      createdAt: property.created_at || new Date().toISOString()
    }));

    return mappedProperties;
  } catch (error) {
    console.error('Error in getFeaturedProperties:', error);
    throw error;
  }
};

// Agents (AUTHENTICATED DATA)
export const getAgents = async (): Promise<Agent[]> => {
  try {
    // Simple query to get all users with role 'agent'
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agent');

    if (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }

    console.log('Raw agents data:', data);

    // Transform the data to match our Agent interface
    const agents: Agent[] = data?.map(user => ({
      id: user.id,
      bio: '',
      user_auth_id: '',
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      photo: user.photo || '',
      role: 'agent' as const,
      created_at: user.created_at,
      auth_id: ''
    })) || [];

    console.log('Transformed agents:', agents);
    return agents;
  } catch (error) {
    console.error('Error in getAgents:', error);
    throw error;
  }
};

export const getAgentById = async (id: string): Promise<Agent | null> => {
  // Try the join first
  const { data, error } = await supabase
    .from('agents')
    .select(`
      *,
      users:users!agents_id_fkey (id, name, email, phone, photo, role)
    `)
    .eq('id', Number(id))
    .single();

  if (!error && data && data.users) {
    // Join succeeded, return full agent info
    return {
      id: data.id.toString(),
      name: data.users.name,
      email: data.users.email,
      password: '',
      phone: data.users.phone || '',
      photo: data.users.photo || '',
      bio: data.bio || '',
      properties: [],
      role: 'agent' as const
    };
  }

  // Fallback: fetch from users table directly
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', Number(id))
    .eq('role', 'agent')
    .single();

  if (!userError && user) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      photo: user.photo || '',
      bio: '', // No bio available in this fallback
      properties: [],
      role: 'agent' as const
    };
  }

  // If both fail, return null
  console.error('Error fetching agent:', error || userError);
  return null;
};

// Users and Authentication
export const getAllUsers = async (): Promise<User[]> => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  const result: User[] = [];
  
  for (const user of users || []) {
    if (user.role === 'agent') {
      const { data: agentData } = await supabase
        .from('agents')
        .select('bio')
        .eq('id', user.id)
        .single();
      
      result.push({
        id: user.id.toString(), // UUID
        name: user.name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        photo: user.photo || '',
        bio: agentData?.bio || '',
        properties: [],
        role: 'agent' as const
      });
    } else if (user.role === 'admin') {
      result.push({
        id: user.id.toString(), // UUID
        name: user.name,
        email: user.email,
        password: '',
        role: 'admin' as const
      });
    }
  }
  
  return result;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  if (!data) return null;
  
  if (data.role === 'agent') {
    const { data: agentData } = await supabase
      .from('agents')
      .select('bio')
      .eq('id', data.id)
      .single();
    
    return {
      id: data.id.toString(), // UUID
      name: data.name,
      email: data.email,
      password: '',
      phone: data.phone || '',
      photo: data.photo || '',
      bio: agentData?.bio || '',
      properties: [],
      role: 'agent' as const
    };
  } else if (data.role === 'admin') {
    return {
      id: data.id.toString(), // UUID
      name: data.name,
      email: data.email,
      password: '',
      role: 'admin' as const
    };
  }
  
  return null;
};

// Create or update user in database
export const createOrUpdateUser = async (userData: {
  email: string;
  name: string;
  role?: 'admin' | 'agent' | 'user';
  phone?: string;
  photo?: string;
  password?: string;
}): Promise<User | null> => {
  try {
    // First check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          role: userData.role || existingUser.role,
          phone: userData.phone || existingUser.phone,
          photo: userData.photo || existingUser.photo
        })
        .eq('email', userData.email)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return {
        id: data.id.toString(), // UUID
        name: data.name,
        email: data.email,
        password: '', // Don't expose passwords
        role: data.role as 'admin' | 'agent',
        phone: data.phone || '',
        photo: data.photo || '',
        bio: '', // Default bio for agents
        properties: [] // Default empty properties array for agents
      } as User;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          name: userData.name,
          role: userData.role || 'user',
          phone: userData.phone || null,
          photo: userData.photo || null,
          password: userData.password || 'temp_password', // This should be handled by Supabase Auth
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return {
        id: data.id.toString(), // UUID
        name: data.name,
        email: data.email,
        password: '', // Don't expose passwords
        role: data.role as 'admin' | 'agent',
        phone: data.phone || '',
        photo: data.photo || '',
        bio: '', // Default bio for agents
        properties: [] // Default empty properties array for agents
      } as User;
    }
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    return null;
  }
};

// Authentication is now handled by Supabase Auth
// This function is deprecated and should not be used
export const authenticate = async (_email: string, _password: string): Promise<User | null> => {
  console.warn('authenticate() function is deprecated. Use Supabase Auth instead.');
  return null;
};

// Tasks
export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data?.map(task => ({
    id: Number(task.id),
    title: task.title,
    description: task.description || '',
    priority: task.priority as 'Low' | 'Medium' | 'High',
    status: task.status as 'Pending' | 'In Progress' | 'Completed',
    due_date: task.due_date || '', // Use due_date consistently
    agent_id: Number(task.agent_id),
    created_at: task.created_at || new Date().toISOString()
  })) || [];
};

export const getTasksByAgentId = async (agentId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('agent_id', Number(agentId));
  
  if (error) {
    console.error('Error fetching tasks for agent:', error);
    return [];
  }
  
  return data?.map(task => ({
    id: Number(task.id),
    title: task.title,
    description: task.description || '',
    priority: task.priority as 'Low' | 'Medium' | 'High',
    status: task.status as 'Pending' | 'In Progress' | 'Completed',
    due_date: task.due_date || '', // Use due_date consistently
    agent_id: Number(task.agent_id),
    created_at: task.created_at || new Date().toISOString()
  })) || [];
};

export const addTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date, // Use due_date consistently
      agent_id: Number(task.agent_id)
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  
  return data ? {
    id: Number(data.id),
    title: data.title,
    description: data.description || '',
    priority: data.priority as 'Low' | 'Medium' | 'High',
    status: data.status as 'Pending' | 'In Progress' | 'Completed',
    due_date: data.due_date || '', // Use due_date consistently
    agent_id: Number(data.agent_id),
    created_at: data.created_at || new Date().toISOString()
  } : null;
};

export const updateTaskStatus = async (taskId: string, status: Task['status']): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', Number(taskId))
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task status:', error);
    return null;
  }
  
  return data ? {
    id: Number(data.id),
    title: data.title,
    description: data.description || '',
    priority: data.priority as 'Low' | 'Medium' | 'High',
    status: data.status as 'Pending' | 'In Progress' | 'Completed',
    due_date: data.due_date || '', // Use due_date consistently
    agent_id: Number(data.agent_id),
    created_at: data.created_at || new Date().toISOString()
  } : null;
};

export const updateTask = async (taskId: string, taskData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> => {
  const updateData: any = {};

  if (taskData.title) updateData.title = taskData.title;
  if (taskData.description) updateData.description = taskData.description;
  if (taskData.priority) updateData.priority = taskData.priority;
  if (taskData.status) updateData.status = taskData.status;
  if (taskData.due_date) updateData.due_date = taskData.due_date; // Use due_date consistently
  if (taskData.agent_id) updateData.agent_id = Number(taskData.agent_id);

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', Number(taskId))
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data ? {
    id: Number(data.id),
    title: data.title,
    description: data.description || '',
    priority: data.priority as 'Low' | 'Medium' | 'High',
    status: data.status as 'Pending' | 'In Progress' | 'Completed',
    due_date: data.due_date || '', // Use due_date consistently
    agent_id: Number(data.agent_id),
    created_at: data.created_at || new Date().toISOString()
  } : null;
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', Number(taskId));

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
};

export const bulkDeleteTasks = async (taskIds: string[]): Promise<boolean> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('id', taskIds.map(id => Number(id)));

  if (error) {
    console.error('Error bulk deleting tasks:', error);
    return false;
  }

  return true;
};

// Property CRUD operations with image management

// Create a new property with images
export const createProperty = async (propertyData: PropertyFormData, imageUrls: string[] = []): Promise<{ success: boolean; property?: Property; error?: string }> => {
  try {
    // Handle both agentId and agent_id field names
    const agentId = typeof propertyData.agentId === 'string'
      ? parseInt(propertyData.agentId, 10)
      : propertyData.agentId;

    if (isNaN(agentId) || agentId === undefined || agentId === null) {
      throw new Error('Invalid agentId provided');
    }

    // Verify the agent exists in the users table
    const { data: agentData, error: agentError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', agentId)
      .eq('role', 'agent')
      .single();

    if (agentError || !agentData) {
      throw new Error('Agent not found or is not an agent');
    }

    // Create the property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        location: propertyData.location,
        address: propertyData.address,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        size: propertyData.size,
        featured: propertyData.featured,
        status: propertyData.status,
        agent_id: agentId
      })
      .select()
      .single();

    if (propertyError) {
      console.error('Error creating property:', propertyError);
      throw propertyError;
    }

    // Handle image uploads if provided
    if (propertyData.images && propertyData.images.length > 0) {
      const imageUrls = await uploadPropertyImages(propertyData.images, property.id);
      
      // Insert image records
      const imageRecords = imageUrls.map(url => ({
        property_id: property.id,
        image_url: url
      }));

      const { error: imageError } = await supabase
        .from('property_images')
        .insert(imageRecords);

      if (imageError) {
        console.error('Error saving property images:', imageError);
      }
    }

    return { success: true, property };
  } catch (error) {
    console.error('Error in createProperty:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update an existing property with images
export const updateProperty = async (
  propertyId: string,
  propertyData: Partial<Omit<Property, 'id' | 'createdAt'>>,
  imageUrls?: string[]
): Promise<{ success: boolean; property?: Property; error?: string }> => {
  try {
    // Update property data
    const updateData: any = {};
    if (propertyData.title) updateData.title = propertyData.title;
    if (propertyData.description) updateData.description = propertyData.description;
    if (propertyData.price) updateData.price = propertyData.price;
    if (propertyData.location) updateData.location = propertyData.location;
    if (propertyData.address) updateData.address = propertyData.address;
    if (propertyData.bedrooms !== undefined) updateData.bedrooms = propertyData.bedrooms;
    if (propertyData.bathrooms !== undefined) updateData.bathrooms = propertyData.bathrooms;
    if (propertyData.size) updateData.size = propertyData.size;
    if (propertyData.featured !== undefined) updateData.featured = propertyData.featured;
    if (propertyData.status) updateData.status = propertyData.status;

    // Handle both agentId and agent_id field names, and allow 0 as valid value
    if (propertyData.agentId !== undefined) updateData.agent_id = Number(propertyData.agentId);
    if (propertyData.agent_id !== undefined) updateData.agent_id = Number(propertyData.agent_id);

    const { data: propertyResult, error: propertyError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', Number(propertyId))
      .select()
      .single();

    if (propertyError) {
      throw propertyError;
    }

    // Update images if provided
    if (imageUrls !== undefined) {
      // Delete existing images from database
      const { error: deleteError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', Number(propertyId));

      if (deleteError) {
        console.warn('Error deleting existing property images:', deleteError);
      }

      // Insert new images
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map(url => ({
          property_id: Number(propertyId),
          image_url: url
        }));

        const { error: imageError } = await supabase
          .from('property_images')
          .insert(imageInserts);

        if (imageError) {
          console.warn('Error inserting new property images:', imageError);
        }
      }
    }

    // Fetch the complete updated property with images
    const completeProperty = await getPropertyById(propertyId);

    return {
      success: true,
      property: completeProperty || undefined
    };
  } catch (error) {
    console.error('Error updating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Delete a property and its associated images
export const deleteProperty = async (propertyId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete images from storage first
    const storageResult = await deletePropertyImages(Number(propertyId));
    if (!storageResult.success) {
      console.warn('Error deleting images from storage:', storageResult.error);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete property images from database
    const { error: imageError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', Number(propertyId));

    if (imageError) {
      console.warn('Error deleting property images from database:', imageError);
    }

    // Delete the property
    const { error: propertyError } = await supabase
      .from('properties')
      .delete()
      .eq('id', Number(propertyId));

    if (propertyError) {
      throw propertyError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create a new message with UUID relationships
export const addMessage = async ({
  sender_id,
  receiver_id,
  content
}: {
  sender_id: string;
  receiver_id: string;
  content: string;
}): Promise<{ success: boolean; message?: any; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: Number(sender_id),
        receiver_id: Number(receiver_id),
        content,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, message: data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
