import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Globe } from "lucide-react";
import { formatRating, formatReviewCount } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Contractor, InsertContractor } from "@shared/schema";

const contractorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  imageUrl: z.string().url("Invalid URL"),
  rating: z.string().min(1, "Rating is required"),
  reviewCount: z.coerce.number().min(0, "Review count must be 0 or greater"),
  freeEstimate: z.boolean().default(false),
  licensed: z.boolean().default(false),
  serviceRadius: z.coerce.number().min(1, "Service radius must be at least 1"),
  specialties: z.array(z.string()).optional(),
  yearsExperience: z.coerce.number().min(0, "Years experience must be 0 or greater").optional(),
  projectTypes: z.array(z.string()).optional()
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contractors = [], isLoading } = useQuery<Contractor[]>({
    queryKey: ['/api/contractors'],
  });

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
      rating: "5.0",
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
      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update contractor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contractors'] });
      setEditingContractor(null);
      form.reset();
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
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete contractor');
      return response.json();
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
      email: data.email || null,
      address: data.address || null,
      phone: data.phone || null,
      website: data.website || null,
      specialties: data.specialties || null,
      yearsExperience: data.yearsExperience || null,
      projectTypes: data.projectTypes || null
    };

    if (editingContractor) {
      updateContractorMutation.mutate({ id: editingContractor.id, data: contractorData });
    } else {
      createContractorMutation.mutate(contractorData);
    }
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
    form.reset({
      name: contractor.name,
      category: contractor.category,
      description: contractor.description,
      location: contractor.location,
      address: contractor.address || "",
      phone: contractor.phone || "",
      email: contractor.email || "",
      website: contractor.website || "",
      imageUrl: contractor.imageUrl,
      rating: contractor.rating,
      reviewCount: contractor.reviewCount,
      freeEstimate: contractor.freeEstimate,
      licensed: contractor.licensed,
      serviceRadius: contractor.serviceRadius,
      specialties: contractor.specialties || [],
      yearsExperience: contractor.yearsExperience || 0,
      projectTypes: contractor.projectTypes || []
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      deleteContractorMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingContractor(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage contractors and directory listings</p>
          </div>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            placeholder="Describe the contractor's services and expertise"
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
                            <Input placeholder="City, State" {...field} />
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
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Full address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
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
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="contact@business.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="www.business.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <Input placeholder="5.0" {...field} />
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
                            <Input type="number" placeholder="0" {...field} />
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
                            <Input type="number" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6">
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
                          <FormLabel>Offers free estimates</FormLabel>
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
                          <FormLabel>Licensed & Insured</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
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

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Contractors ({contractors.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading contractors...</div>
              ) : contractors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No contractors found. Add your first contractor to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contractors.map((contractor) => (
                    <div key={contractor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={contractor.imageUrl} 
                          alt={contractor.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{contractor.name}</h3>
                          <p className="text-muted-foreground">{contractor.category}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm">{formatRating(contractor.rating)}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-muted-foreground mr-1" />
                              <span className="text-sm">{contractor.location}</span>
                            </div>
                            {contractor.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-muted-foreground mr-1" />
                                <span className="text-sm">{contractor.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                            {contractor.freeEstimate && (
                              <Badge variant="secondary">Free Estimate</Badge>
                            )}
                            {contractor.licensed && (
                              <Badge variant="secondary">Licensed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(contractor)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(contractor.id)}
                          disabled={deleteContractorMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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