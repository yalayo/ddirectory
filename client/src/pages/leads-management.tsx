import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Eye, Phone, Mail, MapPin, Calendar, DollarSign, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import type { Lead, Contractor } from "@shared/schema";

export default function LeadsManagement() {
  const { toast } = useToast();
  const [selectedContractor, setSelectedContractor] = useState<string>("all");

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/leads'],
  });

  const { data: contractors = [] } = useQuery({
    queryKey: ['/api/contractors'],
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/leads/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update lead status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    }
  });

  const filteredLeads = selectedContractor === "all" 
    ? leads 
    : leads.filter((lead: Lead) => lead.contractorId === parseInt(selectedContractor));

  const getContractorName = (contractorId: number) => {
    const contractor = contractors.find((c: Contractor) => c.id === contractorId);
    return contractor?.name || "Unknown Contractor";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "quoted": return "bg-orange-100 text-orange-800";
      case "won": return "bg-green-100 text-green-800";
      case "lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const leadsByStatus = {
    new: filteredLeads.filter((lead: Lead) => lead.status === "new"),
    contacted: filteredLeads.filter((lead: Lead) => lead.status === "contacted"),
    quoted: filteredLeads.filter((lead: Lead) => lead.status === "quoted"),
    won: filteredLeads.filter((lead: Lead) => lead.status === "won"),
    lost: filteredLeads.filter((lead: Lead) => lead.status === "lost"),
  };

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4" />
              {lead.customerName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              <Building className="w-3 h-3 inline mr-1" />
              {getContractorName(lead.contractorId)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(lead.status)}>
              {lead.status}
            </Badge>
            <Select
              value={lead.status}
              onValueChange={(newStatus) => 
                updateLeadStatusMutation.mutate({ id: lead.id, status: newStatus })
              }
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{lead.customerEmail}</span>
            </div>
            {lead.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{lead.customerPhone}</span>
              </div>
            )}
            {lead.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{lead.address}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Project:</span> {lead.projectType}
            </div>
            {lead.budget && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>{lead.budget}</span>
              </div>
            )}
            {lead.timeline && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{lead.timeline}</span>
              </div>
            )}
          </div>
        </div>
        {lead.projectDescription && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">{lead.projectDescription}</p>
          </div>
        )}
        <div className="mt-3 text-xs text-muted-foreground">
          Submitted: {new Date(lead.createdAt).toLocaleDateString()} at {new Date(lead.createdAt).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );

  if (leadsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading leads...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/manager/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
              <p className="text-muted-foreground mt-2">
                Track and manage all customer leads from booking requests
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Select value={selectedContractor} onValueChange={setSelectedContractor}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by contractor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contractors</SelectItem>
              {contractors.map((contractor: Contractor) => (
                <SelectItem key={contractor.id} value={contractor.id.toString()}>
                  {contractor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({filteredLeads.length})</TabsTrigger>
            <TabsTrigger value="new">New ({leadsByStatus.new.length})</TabsTrigger>
            <TabsTrigger value="contacted">Contacted ({leadsByStatus.contacted.length})</TabsTrigger>
            <TabsTrigger value="quoted">Quoted ({leadsByStatus.quoted.length})</TabsTrigger>
            <TabsTrigger value="won">Won ({leadsByStatus.won.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({leadsByStatus.lost.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredLeads.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No leads found</h3>
                  <p className="text-muted-foreground">
                    {selectedContractor === "all" 
                      ? "No customer leads have been submitted yet."
                      : "No leads found for the selected contractor."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead: Lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </TabsContent>

          {Object.entries(leadsByStatus).map(([status, statusLeads]) => (
            <TabsContent key={status} value={status} className="mt-6">
              {statusLeads.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No {status} leads</h3>
                    <p className="text-muted-foreground">
                      No leads with {status} status found.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {statusLeads.map((lead: Lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}