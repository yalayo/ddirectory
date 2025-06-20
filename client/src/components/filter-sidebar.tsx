import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedRadius: string;
  onRadiusChange: (radius: string) => void;
}

const categories = [
  "Architects & Building Designers",
  "Design-Build Firms", 
  "General Contractors",
  "Home Builders",
  "Interior Designers & Decorators",
  "Kitchen & Bath Remodeling",
  "Home Remodeling Specialist"
];

const locations = [
  "Lake Charles, LA",
  "Baton Rouge, LA", 
  "New Orleans, LA",
  "Lafayette, LA",
  "Sulphur, LA",
  "Westlake, LA"
];

const radiusOptions = [
  "25 mi",
  "50 mi", 
  "75 mi",
  "100 mi"
];

export default function FilterSidebar({ 
  selectedCategory,
  onCategoryChange,
  selectedLocation, 
  onLocationChange,
  selectedRadius,
  onRadiusChange 
}: FilterSidebarProps) {
  return (
    <div className="lg:w-1/4">
      <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
        {/* Active Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {selectedLocation} / {selectedRadius}
              <Button variant="ghost" size="sm" className="ml-2 h-auto p-0 text-primary-foreground hover:text-primary-foreground/80">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
            <Badge className="bg-primary text-primary-foreground">
              {selectedCategory}
              <Button variant="ghost" size="sm" className="ml-2 h-auto p-0 text-primary-foreground hover:text-primary-foreground/80">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Location (1)</h3>
          <div className="mb-4">
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm text-muted-foreground mb-1">Radius</Label>
            <Select value={selectedRadius} onValueChange={onRadiusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((radius) => (
                  <SelectItem key={radius} value={radius.split(' ')[0]}>
                    {radius}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Professional Category Filter */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">Professional Category (1)</h3>
          <div className="relative mb-4">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search Professional Category"
              className="pl-8"
            />
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategory === category}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onCategoryChange(category);
                    }
                  }}
                  className="filter-checkbox"
                />
                <Label htmlFor={category} className="text-sm text-foreground cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
