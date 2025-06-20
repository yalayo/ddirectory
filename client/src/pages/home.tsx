import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProjectTypeSelector from "@/components/project-type-selector";
import FilterSidebar from "@/components/filter-sidebar";
import ContractorCard from "@/components/contractor-card";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contractor, ProjectType } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("General Contractors");
  const [selectedLocation, setSelectedLocation] = useState<string>("Lake Charles, LA");
  const [selectedRadius, setSelectedRadius] = useState<string>("50");

  // Fetch contractors with filters
  const { data: contractors = [], isLoading: contractorsLoading } = useQuery<Contractor[]>({
    queryKey: ['/api/contractors', selectedCategory, selectedLocation, searchQuery, selectedRadius],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedRadius) params.append('radius', selectedRadius);
      
      const response = await fetch(`/api/contractors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contractors');
      return response.json();
    }
  });

  // Fetch project types
  const { data: projectTypes = [] } = useQuery<ProjectType[]>({
    queryKey: ['/api/project-types'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <ProjectTypeSelector projectTypes={projectTypes} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <FilterSidebar 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            selectedRadius={selectedRadius}
            onRadiusChange={setSelectedRadius}
          />

          <div className="lg:w-3/4">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by Name or Key"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 search-input"
                />
              </div>
            </div>

            {/* Contractor Cards */}
            <div className="space-y-6">
              {contractorsLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading contractors...</div>
                </div>
              ) : contractors.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No contractors found matching your criteria.</div>
                </div>
              ) : (
                contractors.map((contractor) => (
                  <ContractorCard key={contractor.id} contractor={contractor} />
                ))
              )}
            </div>

            {/* Pagination */}
            {contractors.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="ghost" size="sm">2</Button>
                  <Button variant="ghost" size="sm">3</Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
