import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Mail, Bolt, Award } from "lucide-react";
import { formatRating, formatReviewCount, renderStars } from "@/lib/utils";
import type { Contractor } from "@shared/schema";

interface ContractorCardProps {
  contractor: Contractor;
}

export default function ContractorCard({ contractor }: ContractorCardProps) {
  const stars = renderStars(contractor.rating);

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Link href={`/contractor/${contractor.id}`}>
              <img 
                src={contractor.imageUrl} 
                alt={contractor.name}
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
              />
            </Link>
          </div>
          
          <div className="md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Link href={`/contractor/${contractor.id}`}>
                  <h3 className="text-xl font-semibold text-foreground hover:text-primary cursor-pointer">
                    {contractor.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground mt-1">{contractor.category}</p>
              </div>
              <Button className="btn-primary">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {contractor.freeEstimate && (
                <Badge variant="secondary" className="text-primary">
                  <Bolt className="h-3 w-3 mr-1" />
                  Free estimate
                </Badge>
              )}
              {contractor.licensed && (
                <Badge variant="secondary" className="text-primary">
                  <Award className="h-3 w-3 mr-1" />
                  Licensed & Insured
                </Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-accent-green mr-2">
                {[...Array(stars.full)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                {stars.half > 0 && <Star className="h-4 w-4 fill-current opacity-50" />}
                {[...Array(stars.empty)].map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatRating(contractor.rating)} ({formatReviewCount(contractor.reviewCount)})
              </span>
            </div>

            {/* Description */}
            <p className="text-foreground text-sm mb-4 line-clamp-3">
              {contractor.description}
            </p>

            {/* Location */}
            <div className="text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 inline mr-1" />
              {contractor.location} • Serves {contractor.serviceRadius} mile radius
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
