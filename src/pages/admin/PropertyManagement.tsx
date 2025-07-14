import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, Eye, Search, Filter, MoreHorizontal, Copy, Download, Upload, Star, StarOutline,
  TrendingUp, Activity, Clock, Award, Target, BarChart3, ArrowUpRight, Home, MapPin, DollarSign,
  Calendar, Users, Building, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { PropertyDeletionDialog, BulkDeletionDialog } from '@/components/ui/confirmation-dialog';
import { BulkOperationsDialog } from '@/components/admin/BulkOperationsDialog';
import { ImportExportDialog } from '@/components/admin/ImportExportDialog';
import { useProperties, usePropertyMutations } from '@/hooks/useProperties';
import { useAgents } from '@/hooks/useData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { LoadingState, ErrorState } from '@/components/ui/loading';

const PropertyManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { data: properties, isLoading, isError, error } = useProperties();
  const { data: agents } = useAgents();
  const { createProperty, updateProperty, deleteProperty } = usePropertyMutations();

  // State management
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkOperationsDialogOpen, setIsBulkOperationsDialogOpen] = useState(false);
  const [isImportExportDialogOpen, setIsImportExportDialogOpen] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading properties..." />;
  }

  if (isError) {
    return <ErrorState message="Failed to load properties" error={error} />;
  }

  // Filter properties based on search and filters
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesAgent = agentFilter === 'all' || property.agent_id.toString() === agentFilter;
    
    return matchesSearch && matchesStatus && matchesAgent;
  }) || [];

  // Handle property creation
  const handleCreateProperty = async (data: any) => {
    try {
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

      // Defensive: propertyResult may be undefined/null if mutation fails
      // The mutateAsync returns the raw database service result: { success, property?, error? }
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

          console.log(`Successfully uploaded ${successfulUploads.length} out of ${data.imageFiles.length} images`);
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          toast({
            title: "Image Upload Warning",
            description: "Property created but some images failed to upload. You can add them later.",
            variant: "destructive"
          });
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
            toast({
              title: "Database Warning",
              description: "Property created but failed to save image references. Please try uploading images again.",
              variant: "destructive"
            });
          } else {
            console.log(`Successfully saved ${imageUrls.length} image URLs to database`);
          }
        } catch (dbError) {
          console.error('Error inserting image URLs into DB:', dbError);
          toast({
            title: "Database Error",
            description: "Property created but failed to save image references. Please try uploading images again.",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Property Created",
        description: `Property \"${data.title}\" has been created successfully${imageUrls.length > 0 ? ` with ${imageUrls.length} images` : ''}.`
      });

      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create property",
        variant: "destructive"
      });
    }
  };

  // Handle property editing
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProperty = async (data: any) => {
    if (!editingProperty) return;

    try {
      await updateProperty.mutateAsync({
        propertyId: editingProperty.id,
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
          featured: data.featured,
          agentId: data.agentId // Fixed: use agentId to match PropertyForm
        },
        imageUrls: data.images
      });

      toast({
        title: "Property Updated",
        description: `Property "${data.title}" has been updated successfully.`
      });

      setIsEditDialogOpen(false);
      setEditingProperty(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update property",
        variant: "destructive"
      });
    }
  };

  // Handle property deletion
  const handleDeleteProperty = (property: Property) => {
    setDeletingProperty(property);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = async (propertyId: number) => {
    try {
      await deleteProperty.mutateAsync(propertyId);
      toast({
        title: "Property Deleted",
        description: "Property has been deleted successfully."
      });
      setIsDeleteDialogOpen(false);
      setDeletingProperty(null);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive"
      });
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedProperties.length === 0) return;
    setIsBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      // Delete properties one by one
      for (const propertyId of selectedProperties) {
        await deleteProperty.mutateAsync(propertyId);
      }

      toast({
        title: "Properties Deleted",
        description: `${selectedProperties.length} properties have been deleted successfully.`
      });

      setSelectedProperties([]);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Bulk Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete properties",
        variant: "destructive"
      });
    }
  };

  // Bulk operations handlers
  const handleBulkStatusChange = async (propertyIds: number[], newStatus: string) => {
    try {
      for (const propertyId of propertyIds) {
        await updateProperty.mutateAsync({
          propertyId,
          propertyData: { status: newStatus as any }
        });
      }

      toast({
        title: "Status Updated",
        description: `${propertyIds.length} properties updated to "${newStatus}".`
      });

      setSelectedProperties([]);
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: error instanceof Error ? error.message : "Failed to update property status",
        variant: "destructive"
      });
    }
  };

  const handleBulkAgentChange = async (propertyIds: number[], newAgentId: number) => {
    try {
      for (const propertyId of propertyIds) {
        await updateProperty.mutateAsync({
          propertyId,
          propertyData: { agent_id: newAgentId }
        });
      }

      const agent = agents?.find(a => a.id === newAgentId);
      toast({
        title: "Agent Assigned",
        description: `${propertyIds.length} properties assigned to ${agent?.name}.`
      });

      setSelectedProperties([]);
    } catch (error) {
      toast({
        title: "Agent Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign agent",
        variant: "destructive"
      });
    }
  };

  const handleBulkFeaturedChange = async (propertyIds: number[], featured: boolean) => {
    try {
      for (const propertyId of propertyIds) {
        await updateProperty.mutateAsync({
          propertyId,
          propertyData: { featured }
        });
      }

      toast({
        title: "Featured Status Updated",
        description: `${propertyIds.length} properties ${featured ? 'marked as' : 'removed from'} featured.`
      });

      setSelectedProperties([]);
    } catch (error) {
      toast({
        title: "Featured Update Failed",
        description: error instanceof Error ? error.message : "Failed to update featured status",
        variant: "destructive"
      });
    }
  };

  const handleBulkOperationsDelete = async (propertyIds: number[]) => {
    // This will trigger the bulk delete dialog
    setIsBulkDeleteDialogOpen(true);
  };

  // Handle property duplication
  const handleDuplicateProperty = async (property: Property) => {
    try {
      const duplicatedProperty = {
        title: `${property.title} (Copy)`,
        description: property.description,
        price: property.price,
        location: property.location,
        address: property.address,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        status: property.status,
        featured: false, // Don't duplicate featured status
        agent_id: property.agent_id,
        images: [] // Don't duplicate images initially
      };

      await createProperty.mutateAsync({
        propertyData: duplicatedProperty,
        imageUrls: [] // Could optionally copy images here
      });

      toast({
        title: "Property Duplicated",
        description: `Property "${duplicatedProperty.title}" has been created as a copy.`
      });
    } catch (error) {
      toast({
        title: "Duplication Failed",
        description: error instanceof Error ? error.message : "Failed to duplicate property",
        variant: "destructive"
      });
    }
  };

  // Handle bulk import
  const handleImportProperties = async (importedProperties: any[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const propertyData of importedProperties) {
        try {
          await createProperty.mutateAsync({
            propertyData,
            imageUrls: []
          });
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Failed to import property:', propertyData.title, error);
        }
      }

      toast({
        title: "Import Complete",
        description: `${successCount} properties imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import properties",
        variant: "destructive"
      });
    }
  };

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProperties(filteredProperties.map(p => p.id));
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProperty = (propertyId: number, checked: boolean) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  // Get agent name by ID
  const getAgentName = (agentId: number) => {
    const agent = agents?.find(a => a.id === agentId);
    return agent?.name || 'Unassigned';
  };

  // Get status badge color - Updated to match PropertyCard
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'For Sale':
        return 'bg-red-500 text-white border-red-500';
      case 'For Rent':
        return 'bg-green-500 text-white border-green-500';
      case 'Sold':
        return 'bg-gray-500 text-white border-gray-500';
      case 'Rented':
        return 'bg-purple-500 text-white border-purple-500';
      default:
        return 'bg-gray-400 text-white border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] relative overflow-hidden">
      {/* Samsung-style floating background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-8 py-12 relative z-10">
        {/* Samsung-style Header */}
        <div className="mb-12">
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl shadow-black/10 border border-white/30 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
                      <Building className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-2">
                        Property Management
                      </h1>
                      <p className="text-xl text-slate-600 font-medium">
                        Manage your luxury property portfolio ({filteredProperties.length} properties)
                      </p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Total</p>
                          <p className="text-lg font-bold text-slate-900">{properties?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Active</p>
                          <p className="text-lg font-bold text-slate-900">{filteredProperties.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Featured</p>
                          <p className="text-lg font-bold text-slate-900">{properties?.filter(p => p.featured).length || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg shadow-black/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-600">Selected</p>
                          <p className="text-lg font-bold text-slate-900">{selectedProperties.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold text-slate-700 hover:bg-white/80 transition-all duration-300 shadow-lg shadow-black/5 border border-white/40"
                    onClick={() => setIsImportExportDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import/Export
                  </Button>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Property
                      </Button>
                    </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Property</DialogTitle>
              </DialogHeader>
              <PropertyForm
                onSubmit={handleCreateProperty}
                onCancel={() => setIsCreateDialogOpen(false)}
                agents={agents?.map(a => ({ id: a.id, name: a.name })) || []}
                isLoading={createProperty.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Samsung-style Filters and Search */}
      <div className="mb-8">
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/10 border border-white/30 overflow-hidden">
          {/* Floating decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center">
                <Filter className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Search & Filter
                </h3>
                <p className="text-slate-600">Find properties quickly and efficiently</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Search Input */}
              <div className="lg:col-span-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    placeholder="Search properties by title, location, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-black/5 text-lg font-medium focus:bg-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-black/5 font-medium focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="For Sale">For Sale</SelectItem>
                    <SelectItem value="For Rent">For Rent</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Agent Filter */}
              <div className="lg:col-span-3">
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-full py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg shadow-black/5 font-medium focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300">
                    <SelectValue placeholder="Filter by agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl">
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProperties.length > 0 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedProperties.length} properties selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkOperationsDialogOpen(true)}
                >
                  Bulk Operations
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedProperties.length === filteredProperties.length && filteredProperties.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4">Property</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Details</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => handleSelectProperty(property.id, checked as boolean)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-gray-500">
                            {property.bedrooms} bed • {property.bathrooms} bath • {property.size} sq ft
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{property.location}</div>
                        <div className="text-sm text-gray-500">{property.address}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatCurrency(property.price)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(property.status)}>
                        {property.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{getAgentName(property.agent_id)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-500">
                        {property.featured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProperty(property)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateProperty(property)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteProperty(property)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No properties found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <PropertyForm
              onSubmit={handleUpdateProperty}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingProperty(null);
              }}
              initialData={{
                title: editingProperty.title,
                description: editingProperty.description,
                price: editingProperty.price,
                location: editingProperty.location,
                address: editingProperty.address,
                bedrooms: editingProperty.bedrooms,
                bathrooms: editingProperty.bathrooms,
                size: editingProperty.size,
                status: editingProperty.status,
                featured: editingProperty.featured,
                agentId: editingProperty.agent_id, // Fixed: use agentId to match PropertyForm
                images: editingProperty.images
              }}
              agents={agents?.map(a => ({ id: a.id, name: a.name })) || []}
              isLoading={updateProperty.isPending}
              propertyId={editingProperty.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Property Deletion Dialog */}
      <PropertyDeletionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        property={deletingProperty}
        onConfirm={confirmDeleteProperty}
        isLoading={deleteProperty.isPending}
        agentName={deletingProperty ? getAgentName(deletingProperty.agent_id) : undefined}
      />

      {/* Bulk Deletion Dialog */}
      <BulkDeletionDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        selectedCount={selectedProperties.length}
        onConfirm={confirmBulkDelete}
        isLoading={deleteProperty.isPending}
      />

      {/* Bulk Operations Dialog */}
      <BulkOperationsDialog
        open={isBulkOperationsDialogOpen}
        onOpenChange={setIsBulkOperationsDialogOpen}
        selectedProperties={selectedProperties.map(id => properties?.find(p => p.id === id)!).filter(Boolean)}
        agents={agents || []}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAgentChange={handleBulkAgentChange}
        onBulkFeaturedChange={handleBulkFeaturedChange}
        onBulkDelete={handleBulkOperationsDelete}
        isLoading={updateProperty.isPending || deleteProperty.isPending}
      />

      {/* Import/Export Dialog */}
      <ImportExportDialog
        open={isImportExportDialogOpen}
        onOpenChange={setIsImportExportDialogOpen}
        properties={properties || []}
        agents={agents || []}
        onImportProperties={handleImportProperties}
        isLoading={createProperty.isPending}
      />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
