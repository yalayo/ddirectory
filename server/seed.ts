import { db } from "./db";
import { contractors, projectTypes } from "@shared/schema";

const sampleProjectTypes = [
  {
    name: "Bathroom Remodeling",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    slug: "bathroom-remodeling"
  },
  {
    name: "Kitchen Remodeling", 
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    slug: "kitchen-remodeling"
  },
  {
    name: "Custom Homes",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200", 
    slug: "custom-homes"
  },
  {
    name: "New Home Construction",
    imageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    slug: "new-home-construction"
  },
  {
    name: "Garage Building",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    slug: "garage-building"
  }
];

const sampleContractors = [
  {
    name: "Isagani B.Baluyut Construction",
    category: "General Contractors",
    description: "Specializing in custom home construction, renovations, and commercial projects. Over 15 years of experience serving the Lake Charles area with quality craftsmanship.",
    location: "Lake Charles, LA",
    address: "Lake Charles, LA",
    phone: "(337) 555-0101",
    email: "info@baluyutconstruction.com",
    website: "www.baluyutconstruction.com",
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "5.0",
    reviewCount: 24,
    freeEstimate: true,
    licensed: true,
    serviceRadius: 50,
    specialties: ["Custom Homes", "Renovations", "Commercial"],
    yearsExperience: 15,
    projectTypes: ["custom-homes", "new-home-construction"]
  },
  {
    name: "Finishes That Last",
    category: "Interior Design & Renovation",
    description: "Expert interior finishing services including flooring, paint, and custom millwork. We focus on creating beautiful, lasting finishes for your home.",
    location: "Nederland, TX",
    address: "723 N 16th St, Nederland, TX 77627",
    phone: "(409) 555-0202",
    email: "contact@finishesthatlast.com",
    website: "www.finishesthatlast.com",
    imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.9",
    reviewCount: 1,
    freeEstimate: false,
    licensed: true,
    serviceRadius: 30,
    specialties: ["Interior Finishing", "Flooring", "Paint"],
    yearsExperience: 8,
    projectTypes: ["bathroom-remodeling", "kitchen-remodeling"]
  },
  {
    name: "Gulf Coast Builders",
    category: "General Contractors",
    description: "Full-service construction company specializing in residential and light commercial projects. Licensed, bonded, and insured with a commitment to excellence.",
    location: "Lake Charles, LA",
    address: "Lake Charles, LA",
    phone: "(337) 555-0303",
    email: "info@gulfcoastbuilders.com",
    website: "www.gulfcoastbuilders.com",
    imageUrl: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.7",
    reviewCount: 18,
    freeEstimate: true,
    licensed: true,
    serviceRadius: 75,
    specialties: ["Residential", "Commercial", "Storm Damage"],
    yearsExperience: 12,
    projectTypes: ["new-home-construction", "garage-building"]
  },
  {
    name: "Bayou State Renovations",
    category: "Kitchen & Bath Remodeling",
    description: "Transform your kitchen and bathroom with our expert remodeling services. We handle everything from design to completion with attention to every detail.",
    location: "Sulphur, LA",
    address: "Sulphur, LA",
    phone: "(337) 555-0404",
    email: "info@bayoustatereno.com",
    website: "www.bayoustatereno.com",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "5.0",
    reviewCount: 32,
    freeEstimate: false,
    licensed: true,
    serviceRadius: 40,
    specialties: ["Kitchen Remodeling", "Bathroom Remodeling", "Design"],
    yearsExperience: 10,
    projectTypes: ["kitchen-remodeling", "bathroom-remodeling"]
  },
  {
    name: "Mike's Quality Construction",
    category: "General Contractors",
    description: "Family-owned construction business serving Southwest Louisiana for over 20 years. Specializing in home additions, roofing, and storm damage repairs.",
    location: "Lake Charles, LA",
    address: "Lake Charles, LA",
    phone: "(337) 555-0505",
    email: "mike@mikesqualityconstruction.com",
    website: "www.mikesqualityconstruction.com",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.2",
    reviewCount: 9,
    freeEstimate: true,
    licensed: true,
    serviceRadius: 50,
    specialties: ["Home Additions", "Roofing", "Storm Damage"],
    yearsExperience: 20,
    projectTypes: ["new-home-construction", "garage-building"]
  },
  {
    name: "Precision Home Improvements",
    category: "Home Remodeling Specialist",
    description: "Precision craftsmanship for all your home improvement needs. From small repairs to complete home makeovers, we deliver quality results on time and on budget.",
    location: "Westlake, LA",
    address: "Westlake, LA",
    phone: "(337) 555-0606",
    email: "info@precisionhomeimprovements.com",
    website: "www.precisionhomeimprovements.com",
    imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    rating: "4.8",
    reviewCount: 15,
    freeEstimate: false,
    licensed: true,
    serviceRadius: 35,
    specialties: ["Home Improvements", "Repairs", "Remodeling"],
    yearsExperience: 7,
    projectTypes: ["bathroom-remodeling", "kitchen-remodeling"]
  }
];

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Insert project types
    console.log("Inserting project types...");
    await db.insert(projectTypes).values(sampleProjectTypes).onConflictDoNothing();
    
    // Insert contractors
    console.log("Inserting contractors...");
    await db.insert(contractors).values(sampleContractors).onConflictDoNothing();
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();