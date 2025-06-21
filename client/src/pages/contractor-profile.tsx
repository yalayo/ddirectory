import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, Globe, Award, Bolt, Calendar, ArrowLeft } from "lucide-react";
import { formatRating, formatReviewCount, renderStars } from "@/lib/utils";
import type { Contractor } from "@shared/schema";

export default function ContractorProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  const { data: contractor, isLoading } = useQuery<Contractor>({
    queryKey: ['/api/contractors', id],
    queryFn: async () => {
      const response = await fetch(`/api/contractors/${id}`);
      if (!response.ok) throw new Error('Failed to fetch contractor');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading contractor profile...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Contractor not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  const stars = renderStars(contractor.rating);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        
        <Card>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Contractor Image */}
              <div className="md:col-span-1">
                <img 
                  src={contractor.imageUrl} 
                  alt={contractor.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Main Info */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{contractor.name}</h1>
                    <p className="text-lg text-muted-foreground mb-4">{contractor.category}</p>
                  </div>
                  <Button 
                    className="btn-primary"
                    onClick={() => setLocation(`/book-service/${contractor.id}`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book a Service
                  </Button>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex text-accent-green mr-2">
                    {[...Array(stars.full)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                    {stars.half > 0 && <Star className="h-5 w-5 fill-current opacity-50" />}
                    {[...Array(stars.empty)].map((_, i) => (
                      <Star key={i} className="h-5 w-5" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatRating(contractor.rating)} ({formatReviewCount(contractor.reviewCount)})
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {contractor.freeEstimate && (
                    <Badge variant="secondary">
                      <Bolt className="h-3 w-3 mr-1" />
                      Free Estimate
                    </Badge>
                  )}
                  {contractor.licensed && (
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      Licensed & Insured
                    </Badge>
                  )}
                  {contractor.yearsExperience && (
                    <Badge variant="secondary">
                      <Calendar className="h-3 w-3 mr-1" />
                      {contractor.yearsExperience} Years Experience
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-foreground mb-6">{contractor.description}</p>

                {/* Contact Info */}
                <div className="space-y-2">
                  {contractor.address && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {contractor.address}
                    </div>
                  )}
                  {contractor.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {contractor.phone}
                    </div>
                  )}
                  {contractor.email && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {contractor.email}
                    </div>
                  )}
                  {contractor.website && (
                    <div className="flex items-center text-muted-foreground">
                      <Globe className="h-4 w-4 mr-2" />
                      {contractor.website}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-xl font-semibold mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
