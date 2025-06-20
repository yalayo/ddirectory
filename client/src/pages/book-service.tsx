import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Zap, Droplets, HardHat, CheckCircle, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Contractor } from "@shared/schema";

const serviceTypes = [
  {
    id: "electrical",
    name: "Electrical",
    description: "Wiring, circuits, outlets, lighting, and all electrical issues",
    icon: Zap,
    color: "bg-yellow-100 border-yellow-300"
  },
  {
    id: "plumbing",
    name: "Plumbing", 
    description: "Leaks, drains, fixtures, toilets, and all plumbing issues",
    icon: Droplets,
    color: "bg-blue-100 border-blue-300"
  },
  {
    id: "roofing",
    name: "Roofing",
    description: "Roof installation, repair, restoration, and replacement services",
    icon: HardHat,
    color: "bg-gray-100 border-gray-300"
  }
];

const electricalServices = [
  "Circuit breaker issues",
  "Outlet installation/repair",
  "Light fixture installation",
  "Wiring problems",
  "Electrical panel upgrade",
  "Other electrical services"
];

const urgencyOptions = [
  "Emergency - Within 24 hours",
  "Urgent - Within 2-3 days", 
  "Flexible - Anytime in the next 2 weeks",
  "Not urgent - Within the next month"
];

const propertyTypes = [
  "Residential - House",
  "Residential - Apartment/Condo",
  "Commercial - Office",
  "Commercial - Retail",
  "Other"
];

const timeSlots = [
  "Morning (8:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 4:00 PM)", 
  "Evening (4:00 PM - 8:00 PM)",
  "Flexible"
];

const stepOneSchema = z.object({
  serviceType: z.string().min(1, "Please select a service type")
});

const stepTwoSchema = z.object({
  specificService: z.string().min(1, "Please select a specific service"),
  urgency: z.string().min(1, "Please select urgency level"),
  propertyType: z.string().min(1, "Please select property type"),
  description: z.string().min(10, "Please provide at least 10 characters"),
  previousCustomer: z.string().min(1, "Please select an option")
});

const stepThreeSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  serviceAddress: z.string().min(5, "Please enter your service address"),
  preferredTime: z.string().optional()
});

export default function BookService() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: contractor, isLoading } = useQuery<Contractor>({
    queryKey: ['/api/contractors', id],
    queryFn: async () => {
      const response = await fetch(`/api/contractors/${id}`);
      if (!response.ok) throw new Error('Failed to fetch contractor');
      return response.json();
    }
  });

  const stepOneForm = useForm({
    resolver: zodResolver(stepOneSchema),
    defaultValues: { serviceType: "" }
  });

  const stepTwoForm = useForm({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      specificService: "",
      urgency: "",
      propertyType: "",
      description: "",
      previousCustomer: ""
    }
  });

  const stepThreeForm = useForm({
    resolver: zodResolver(stepThreeSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      serviceAddress: "",
      preferredTime: ""
    }
  });

  const handleStepOne = (data: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStepTwo = (data: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const handleStepThree = (data: any) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    // In a real app, this would submit to the backend
    alert("Service request submitted successfully!");
    setLocation('/');
  };

  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
            step <= currentStep 
              ? "bg-primary text-white border-primary" 
              : "bg-background text-muted-foreground border-border"
          )}>
            {step}
          </div>
          <div className="ml-2 mr-8">
            <div className={cn(
              "text-sm font-medium",
              step <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step === 1 && "Service Type"}
              {step === 2 && "Details"}
              {step === 3 && "Contact"}
              {step === 4 && "Confirm"}
            </div>
          </div>
          {step < 4 && (
            <div className={cn(
              "w-16 h-0.5 mr-8",
              step < currentStep ? "bg-primary" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Fill out the form below to schedule a service or get a quote. Our team will get back to you promptly.
          </h1>
        </div>

        {renderProgressSteps()}

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <Form {...stepOneForm}>
                <form onSubmit={stepOneForm.handleSubmit(handleStepOne)} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select Service Type</h2>
                    <p className="text-muted-foreground mb-6">Please select the type of service you need assistance with.</p>
                  </div>

                  <FormField
                    control={stepOneForm.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {serviceTypes.map((service) => {
                            const Icon = service.icon;
                            return (
                              <Card
                                key={service.id}
                                className={cn(
                                  "cursor-pointer transition-all border-2",
                                  field.value === service.id 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50",
                                  service.color
                                )}
                                onClick={() => field.onChange(service.id)}
                              >
                                <CardContent className="p-6 text-center">
                                  {field.value === service.id && (
                                    <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />
                                  )}
                                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                                    <Icon className="w-8 h-8 text-gray-600" />
                                  </div>
                                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                                  <p className="text-sm text-muted-foreground">{service.description}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" className="btn-primary">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 2 && (
              <Form {...stepTwoForm}>
                <form onSubmit={stepTwoForm.handleSubmit(handleStepTwo)} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Tell us about your {formData.serviceType} service needs
                    </h2>
                  </div>

                  <FormField
                    control={stepTwoForm.control}
                    name="specificService"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What specific service do you need?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {electricalServices.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepTwoForm.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How urgent is this service need?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select urgency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {urgencyOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepTwoForm.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {propertyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepTwoForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please describe your service needs in more detail</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide any additional details that might help us understand your service requirements better..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepTwoForm.control}
                    name="previousCustomer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Have you used our services for this type of work before?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="yes" />
                              <Label htmlFor="yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="no" />
                              <Label htmlFor="no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="btn-primary">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 3 && (
              <Form {...stepThreeForm}>
                <form onSubmit={stepThreeForm.handleSubmit(handleStepThree)} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
                    <p className="text-muted-foreground mb-6">Please provide your contact details and preferred appointment time.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={stepThreeForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={stepThreeForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(337) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={stepThreeForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stepThreeForm.control}
                    name="serviceAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Address</FormLabel>
                        <FormControl>
                          <Input placeholder="1234 Street, Lake Charles, LA 70601" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Preferred Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal mt-2",
                              !formData.preferredDate && "text-muted-foreground"
                            )}
                            onClick={() => {
                              const today = new Date();
                              setFormData((prev: Record<string, any>) => ({ 
                                ...prev, 
                                preferredDate: today 
                              }));
                            }}
                          >
                            {formData.preferredDate ? (
                              format(formData.preferredDate, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.preferredDate}
                            onSelect={(date) => {
                              setFormData((prev: Record<string, any>) => ({ 
                                ...prev, 
                                preferredDate: date 
                              }));
                            }}
                            disabled={(date: Date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <FormField
                      control={stepThreeForm.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button type="submit" className="btn-primary">
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Confirm Service Request</h2>
                  <p className="text-muted-foreground mb-6">Please review your service request details before submitting.</p>
                </div>

                <div className="space-y-6">
                  <Card className="bg-muted/50">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="w-5 h-5 text-primary mr-2" />
                        <h3 className="font-semibold">Service Details</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          <span className="font-medium">Service Type:</span>
                          <span className="ml-2 capitalize">{formData.serviceType}</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Issue Type:</span>
                          <span className="ml-2">{formData.specificService}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="font-medium">Urgency:</span>
                          <span className="ml-2">{formData.urgency}</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Property Type:</span>
                          <span className="ml-2">{formData.propertyType}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <User className="w-5 h-5 text-primary mr-2" />
                        <h3 className="font-semibold">Contact Information</h3>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span className="font-medium">Name:</span>
                          <span className="ml-2">{formData.fullName}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="font-medium">Phone:</span>
                          <span className="ml-2">{formData.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="font-medium">Email:</span>
                          <span className="ml-2">{formData.email}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="font-medium">Address:</span>
                          <span className="ml-2">{formData.serviceAddress}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {(formData.preferredDate || formData.preferredTime) && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <CalendarIcon className="w-5 h-5 text-primary mr-2" />
                          <h3 className="font-semibold">Preferred Schedule</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          {formData.preferredDate && (
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              <span className="font-medium">Date:</span>
                              <span className="ml-2">{format(formData.preferredDate, "PPPP")}</span>
                            </div>
                          )}
                          {formData.preferredTime && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="font-medium">Time:</span>
                              <span className="ml-2">{formData.preferredTime}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleSubmit} className="btn-primary">
                    Submit Request
                  </Button>
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