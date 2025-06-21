import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Globe, LogOut } from "lucide-react";
import { formatRating, formatReviewCount } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Contractor, InsertContractor } from "@shared/schema";

const contractorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),
  imageUrl: z.string().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  freeEstimate: z.boolean(),
  licensed: z.boolean(),
  serviceRadius: z.number().min(1, "Service radius must be at least 1 mile"),
  specialties: z.array(z.string()),
  yearsExperience: z.number().min(0),
  projectTypes: z.array(z.string())
});

const categories = [
  "General Contractors",
  "Kitchen & Bath Remodeling",
  "Interior Design & Renovation",
  "Home Remodeling Specialist",
  "Architects & Building Designers",
  "Design-Build Firms",
  "Home Builders"
];

export default function ManagerDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: contractors = [], isLoading: contractorsLoading } = useQuery<Contractor[]>({
    queryKey: ['/api/contractors'],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/manager/login');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const form = useForm<z.infer<typeof contractorSchema>>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      location: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      imageUrl: "",
      rating: 0,
      reviewCount: 0,
      freeEstimate: false,
      licensed: false,
      serviceRadius: 50,
      specialties: [],
      yearsExperience: 0,
      projectTypes: []
    }
  });

  const createContractorMutation = useMutation({
    mutationFn: async (data: InsertContractor) => {
      const response = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create contractor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Contractor added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add contractor",
        variant: "destructive",
      });
    }
  });

  const updateContractorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertContractor }) => {
      const response = await fetch(`/api/contractors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update contractor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Contractor updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contractor",
        variant: "destructive",
      });
    }
  });

  const deleteContractorMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contractors/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error('Failed to delete contractor');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      toast({
        title: "Success",
        description: "Contractor deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contractor",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof contractorSchema>) => {
    const contractorData: InsertContractor = {
      ...data,
      rating: data.rating.toString(),
      website: data.website || null,
      imageUrl: data.imageUrl || null
    };

    if (editingContractor) {
      updateContractorMutation.mutate({ id: editingContractor.id, data: contractorData });
    } else {
      createContractorMutation.mutate(contractorData);
    }
  };

  const resetForm = () => {
    setEditingContractor(null);
    form.reset();
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setIsAddDialogOpen(true);
    form.reset({
      name: contractor.name,
      category: contractor.category,
      description: contractor.description,
      location: contractor.location,
      address: contractor.address || "",
      phone: contractor.phone || "",
      email: contractor.email || "",
      website: contractor.website || "",
      imageUrl: contractor.imageUrl || "",
      rating: parseFloat(contractor.rating) || 0,
      reviewCount: contractor.reviewCount,
      freeEstimate: contractor.freeEstimate ?? false,
      licensed: contractor.licensed ?? false,
      serviceRadius: contractor.serviceRadius ?? 50,
      specialties: contractor.specialties || [],
      yearsExperience: contractor.yearsExperience || 0,
      projectTypes: contractor.projectTypes || []
    });
  };

  const handleDelete = (contractor: Contractor) => {
    if (confirm(`Are you sure you want to delete ${contractor.name}?`)) {
      deleteContractorMutation.mutate(contractor.id);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage contractors and directory listings</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                setLocation('/manager/login');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Dialog open={isAddDialogOpen || !!editingContractor} onOpenChange={(open) => {
              if (!open) {
                setIsAddDialogOpen(false);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contractor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingContractor ? 'Edit Contractor' : 'Add New Contractor'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingContractor ? 'Update contractor information and settings.' : 'Add a new contractor to your directory.'}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the business and services offered..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Lake Charles, LA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(337) 555-0123" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contact@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serviceRadius"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Radius (miles)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="50"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating (0-5)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1"
                                min="0"
                                max="5"
                                placeholder="4.5"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reviewCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Review Count</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="25"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="freeEstimate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Free Estimate</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licensed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Licensed</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="btn-primary"
                        disabled={createContractorMutation.isPending || updateContractorMutation.isPending}
                      >
                        {editingContractor ? 'Update' : 'Add'} Contractor
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contractors ({contractors.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contractorsLoading ? (
                <div className="text-center py-8">Loading contractors...</div>
              ) : contractors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No contractors found. Add your first contractor to get started.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {contractors.map((contractor) => (
                    <div key={contractor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{contractor.name}</h3>
                            <Badge variant="secondary">{contractor.category}</Badge>
                            {contractor.licensed && <Badge variant="outline">Licensed</Badge>}
                            {contractor.freeEstimate && <Badge variant="outline">Free Estimate</Badge>}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(parseFloat(contractor.rating))
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatRating(contractor.rating)} ({formatReviewCount(contractor.reviewCount)})
                            </span>
                          </div>

                          <p className="text-muted-foreground mb-3 line-clamp-2">{contractor.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {contractor.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {contractor.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {contractor.email}
                            </div>
                            {contractor.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="h-4 w-4" />
                                <span>Website</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(contractor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(contractor)}
                            disabled={deleteContractorMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}