import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Calendar,
  Clock,
  Plus,
  User,
  BookOpen,
  Users,
  MapPin,
  FileText,
  Paperclip,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ClientSearch } from "@/components/client-search";
import { SessionSearch, type SelectedSession } from "@/components/session-search";
import {
  CATEGORIES,
  STUDIOS,
  TRAINERS,
  CLASSES,
  PRIORITIES,
} from "@/lib/constants";
import type { InsertTicket } from "@shared/schema";

const ticketFormSchema = z.object({
  studioId: z.string().min(1, "Please select a studio"),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  priority: z.string().default("medium"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerMembershipId: z.string().optional(),
  customerStatus: z.string().optional(),
  clientMood: z.string().optional(),
  incidentDateTime: z.string().optional(),
  trainer: z.string().optional(),
  className: z.string().optional(),
  location: z.string().optional(),
  customerId: z.string().optional(),
  classTime: z.string().optional(),
  instructorContact: z.string().optional(),
  source: z.string().optional(),
  urgency: z.string().optional(),
  notes: z.string().optional(),
}).passthrough();

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export default function NewTicket() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showCustomerBlock, setShowCustomerBlock] = useState(false);
  const [showClassBlock, setShowClassBlock] = useState(false);
  const [showInstructorBlock, setShowInstructorBlock] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [selectedClients, setSelectedClients] = useState<any[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<SelectedSession[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);

  // Auto-generate ticket number on component mount
  useEffect(() => {
    const generateTicketNumber = () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `TKT-${year}${month}${day}-${random}`;
    };
    setTicketNumber(generateTicketNumber());
  }, []);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      studioId: "",
      category: "",
      subcategory: "",
      priority: "medium",
      title: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerMembershipId: "",
      customerStatus: "",
      clientMood: "",
      incidentDateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format for datetime-local input
      trainer: "",
      className: "",
    },
  });

  const selectedCategory = form.watch("category");
  const selectedSubcategory = form.watch("subcategory");

  // Find the category ID from the selected category name
  const categoryId = useMemo(() => {
    const category = CATEGORIES.find(c => c.name === selectedCategory);
    return category?.id;
  }, [selectedCategory]);

  // Fetch subcategories for the selected category
  const { data: subcategoriesData = [] } = useQuery({
    queryKey: ['/api/categories', categoryId, 'subcategories'],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const response = await fetch(`/api/categories/${categoryId}/subcategories`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      return response.json();
    },
    enabled: !!categoryId
  });

  // Fetch dynamic fields for the selected category and subcategory
  const { data: dynamicFieldsData = [] } = useQuery({
    queryKey: ['/api/categories', categoryId, 'fields', selectedSubcategory],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const url = new URL(`/api/categories/${categoryId}/fields`, window.location.origin);
      if (selectedSubcategory && selectedSubcategory !== 'All') {
        url.searchParams.set('subcategoryId', selectedSubcategory);
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch fields');
      return response.json();
    },
    enabled: !!categoryId
  });

  const dynamicFields = useMemo(() => {
    if (!dynamicFieldsData) return [];

    // Filter out hidden fields
    const filtered = (dynamicFieldsData as any[])
      .filter((f: any) => !f.isHidden)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    console.log('[DynamicFields]', {
      selectedCategory,
      selectedSubcategory,
      categoryId,
      fieldsCount: filtered.length,
      fieldLabels: filtered.map((f: any) => f.label)
    });

    return filtered;
  }, [dynamicFieldsData, selectedCategory, selectedSubcategory, categoryId]);

  const categoryConfig = useMemo(() => {
    return CATEGORIES.find((c) => c.name === selectedCategory);
  }, [selectedCategory]);

  const subcategories = subcategoriesData as Array<{ id: string; name: string; code?: string; }>;

  // Fetch studios from API
  const { data: studiosData = [] } = useQuery({
    queryKey: ['/api/studios'],
    queryFn: async () => {
      const response = await fetch('/api/studios');
      if (!response.ok) throw new Error('Failed to fetch studios');
      return response.json();
    },
  });

  const studios = studiosData.length > 0 ? studiosData : STUDIOS;

  const showTrainerField = useMemo(() => {
    const cats = ["Class Experience", "Instructor Related"];
    return cats.includes(selectedCategory);
  }, [selectedCategory]);

  const showClassField = useMemo(() => {
    const cats = ["Class Experience", "Instructor Related", "Special Programs"];
    return cats.includes(selectedCategory);
  }, [selectedCategory]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormValues) => {
      const ticketData: Partial<InsertTicket> = {
        studioId: data.studioId,
        categoryId: categoryId, // Use the resolved category ID instead of name
        subcategoryId: data.subcategory || undefined, // This is already an ID from the dropdown
        priority: data.priority,
        title: data.title,
        description: data.description,
        customerName: data.customerName || undefined,
        customerEmail: data.customerEmail || undefined,
        customerPhone: data.customerPhone || undefined,
        customerMembershipId: data.customerMembershipId || undefined,
        customerStatus: data.customerStatus || undefined,
        clientMood: data.clientMood || undefined,
        incidentDateTime: data.incidentDateTime && data.incidentDateTime.trim() !== ""
          ? new Date(data.incidentDateTime)
          : undefined,
        dynamicFieldData: (() => {
          const dyn: Record<string, any> = {};
          (dynamicFields || []).forEach((f: any) => {
            const key = f.uniqueId || f.label;
            const val = (data as any)[key];
            if (val !== undefined && val !== "") dyn[key] = val;
          });
          // keep legacy trainer/className top-level mapping
          if ((data as any).trainer) dyn.trainer = (data as any).trainer;
          if ((data as any).className) dyn.className = (data as any).className;
          return dyn;
        })(),
      };
      return apiRequest("POST", "/api/tickets", ticketData).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "Your ticket has been successfully submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      navigate("/tickets");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TicketFormValues) => {
    try {
      // Analyze sentiment and generate tags
      setIsAnalyzingSentiment(true);
      
      let sentimentData = {
        sentiment: 'neutral',
        tags: ['support'],
        summary: 'Support ticket',
      };

      try {
        const sentimentResponse = await apiRequest('POST', '/api/analyze-sentiment', {
          title: data.title,
          description: data.description,
          clientMood: data.clientMood,
        });
        sentimentData = await sentimentResponse.json();
      } catch (error) {
        console.log('Sentiment analysis failed, using defaults:', error);
      }

      // Add sentiment data and client info to form data
      const enrichedData = {
        ...data,
        sentiment: sentimentData.sentiment,
        tags: sentimentData.tags,
        clientIds: selectedClients.map(c => (c.id !== undefined && c.id !== null) ? String(c.id) : c.id),
        sessionIds: selectedSessions.map(s => (s.id !== undefined && s.id !== null) ? String(s.id) : s.id),
        sessionNames: selectedSessions.map(s => s.name),
      };

      createTicketMutation.mutate(enrichedData);
    } catch (error) {
      console.error('Error in submission:', error);
      toast({
        title: "Error",
        description: "Failed to process ticket submission",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingSentiment(false);
    }
  };

  const onError = (errors: any) => {
    try {
      // Extract first error message to show to user
      const firstKey = Object.keys(errors)[0];
      const firstErr = firstKey ? errors[firstKey] : null;
      const message = firstErr?.message || 'Please review the form for errors';
      toast({
        title: 'Validation error',
        description: String(message),
        variant: 'destructive',
      });
    } catch (e) {
      // fallback
      toast({
        title: 'Validation error',
        description: 'Please review the form for errors',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const handleClientSelect = (client: any) => {
    // Check if client is already selected
    const isAlreadySelected = selectedClients.some(c => c.id === client.id);
    
    let updated: any[];
    if (isAlreadySelected) {
      // Remove client
      updated = selectedClients.filter(c => c.id !== client.id);
      toast({
        title: "Client removed",
        description: `Client has been removed from the ticket.`,
      });
    } else {
      // Add client
      updated = [...selectedClients, client];
      
      // Auto-populate first client details into main form fields
      if (selectedClients.length === 0) {
        form.setValue("customerName", `${client.firstName || ''} ${client.lastName || ''}`.trim() || "");
        form.setValue("customerEmail", client.email || "");
        form.setValue("customerPhone", client.phone || "");
        form.setValue("customerMembershipId", client.id !== undefined && client.id !== null ? String(client.id) : "");
        form.setValue("customerStatus", client.membershipStatus || "");
      }
      
      toast({
        title: "Client added",
        description: `${`${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'} added to ticket.`,
      });
    }
    
    setSelectedClients(updated);
  };

  const removeClient = (clientId: string) => {
    setSelectedClients(prev => prev.filter(c => c.id !== clientId));
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tickets")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">Create New Ticket</h1>
          <p className="text-sm text-muted-foreground">
            Log customer feedback, complaints, or issues
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          
          {/* Auto-populated Header Section */}
          <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Ticket Information (Auto-populated)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Ticket ID</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {ticketNumber}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    {new Date().toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-md text-sm font-medium">
                    Open
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Owner</Label>
                  <div className="px-3 py-2 bg-muted rounded-md text-sm">
                    Current User
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Core Issue Details Section */}
          <Card className="border-l-4 border-l-red-500 dark:border-l-red-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                Issue Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("subcategory", "");
                          const cat = CATEGORIES.find((c) => c.name === value);
                          if (cat) {
                            form.setValue("priority", cat.defaultPriority);
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {subcategories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-subcategory">
                              <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories.map((sub) => (
                              <SelectItem key={sub.id} value={sub.id}>
                                {sub.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Dynamic Fields Section */}
                {dynamicFields.length > 0 && (
                  <>
                    {dynamicFields.map((field: any) => {
                      // Skip standard fields that are already rendered elsewhere
                      const skipFields = ['Ticket ID', 'Date & Time Reported', 'Date & Time of Incident', 'Priority', 'Issue Title', 'Issue Description', 'Category', 'Sub Category'];
                      if (skipFields.includes(field.label)) return null;

                      // Handle both old (string) and new (object) fieldType formats
                      const fieldTypeName = typeof field.fieldType === 'string' 
                        ? field.fieldType 
                        : (field.fieldType?.name || '');

                      return (
                        <div key={field.uniqueId} className="md:col-span-1">
                          <FormField
                            control={form.control}
                            name={field.uniqueId}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel className={field.isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}>
                                  {field.label}
                                </FormLabel>
                                <FormControl>
                                  {fieldTypeName === 'Dropdown' && field.options ? (
                                    <Select
                                      onValueChange={formField.onChange}
                                      defaultValue={(formField.value as string) || ''}
                                    >
                                      <SelectTrigger data-testid={`select-${field.uniqueId}`}>
                                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(Array.isArray(field.options) 
                                          ? field.options 
                                          : field.options.split('|')
                                        )
                                          .map((opt: any) => typeof opt === 'string' ? opt : opt)
                                          .map((opt: string) => opt.trim())
                                          .filter((opt: string) => opt.length > 0)
                                          .map((opt: string, idx: number) => (
                                            <SelectItem key={idx} value={opt}>
                                              {opt}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : fieldTypeName === 'Textarea' || fieldTypeName === 'Long Text' || fieldTypeName === 'Text Area' ? (
                                    <Textarea
                                      placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`textarea-${field.uniqueId}`}
                                    />
                                  ) : fieldTypeName === 'DateTime' ? (
                                    <Input
                                      type="datetime-local"
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`datetime-${field.uniqueId}`}
                                    />
                                  ) : fieldTypeName === 'Date' ? (
                                    <Input
                                      type="date"
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`date-${field.uniqueId}`}
                                    />
                                  ) : fieldTypeName === 'Email' ? (
                                    <Input
                                      type="email"
                                      placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`email-${field.uniqueId}`}
                                    />
                                  ) : fieldTypeName === 'Phone' ? (
                                    <Input
                                      type="tel"
                                      placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`phone-${field.uniqueId}`}
                                    />
                                  ) : (
                                    <Input
                                      type="text"
                                      placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
                                      value={(formField.value as string) || ''}
                                      onChange={formField.onChange}
                                      data-testid={`input-${field.uniqueId}`}
                                    />
                                  )}
                                </FormControl>
                                {field.description && (
                                  <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            {Object.entries(PRIORITIES).map(([value, config]) => (
                              <div
                                key={value}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={value}
                                  id={`priority-${value}`}
                                  data-testid={`radio-priority-${value}`}
                                />
                                <Label
                                  htmlFor={`priority-${value}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {config.label}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief summary of the issue"
                            {...field}
                            data-testid="input-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed information about the issue, including what happened, when, and any relevant context..."
                            className="min-h-32"
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Studio Section */}
          <Card className="border-l-4 border-l-green-500 dark:border-l-green-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                Location & Studio Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="studioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Studio *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-studio">
                            <SelectValue placeholder="Select a studio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studios.map((studio) => (
                            <SelectItem key={studio.id} value={studio.id}>
                              {studio.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          {/* Optional Customer Section */}
          {showCustomerBlock && (
            <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Customer Information
                  {selectedClients.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomerBlock(false)}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Search Component */}
                <ClientSearch
                  onClientSelect={handleClientSelect}
                  selectedClientId={selectedClients[0]?.id ? String(selectedClients[0].id) : undefined}
                  className="mb-6"
                />

                {/* Selected Clients Display */}
                {selectedClients.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Clients</Label>
                    <div className="space-y-2">
                      {selectedClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {`${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {client.email} • {client.phone}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeClient(client.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name of the customer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer's phone number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Customer's email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Customer ID or membership number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optional Class Section */}
          {showClassBlock && (
            <Card className="border-l-4 border-l-orange-500 dark:border-l-orange-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Class Information
                  {selectedSessions.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedSessions.length} class{selectedSessions.length !== 1 ? 'es' : ''}
                    </Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClassBlock(false)}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Session Search Component */}
                <SessionSearch
                  onSessionsSelect={setSelectedSessions}
                  selectedSessions={selectedSessions}
                  location={selectedLocation}
                />
              </CardContent>
            </Card>
          )}

          {/* Class Details Section - kept for backward compatibility */}
          {false && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  Class Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="incidentDateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Clock className="h-4 w-4 inline mr-2" />
                          Incident Date & Time
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            data-testid="input-incident-datetime"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optional Instructor Section */}
          {showInstructorBlock && (
            <Card className="border-l-4 border-l-cyan-500 dark:border-l-cyan-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Instructor Information
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructorBlock(false)}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="trainer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-trainer">
                              <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRAINERS.map((trainer) => (
                              <SelectItem key={trainer} value={trainer}>
                                {trainer}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructorContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Instructor's contact information"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optional Blocks Toggle Buttons */}
          <div className="flex flex-wrap gap-3">
            {!showCustomerBlock && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomerBlock(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Search & Add Client Info
              </Button>
            )}
            {!showClassBlock && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowClassBlock(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Class Info
              </Button>
            )}
            {!showInstructorBlock && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowInstructorBlock(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Instructor Info
              </Button>
            )}
          </div>

          {/* Additional Information Section */}
          <Card className="border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How was this reported?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="app">Mobile App</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional information or context..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Attachments Section */}
          <Card className="border-l-4 border-l-yellow-500 dark:border-l-yellow-400">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="attachments"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                    <input
                      id="attachments"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {attachedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Selected Files ({attachedFiles.length})
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                        >
                          <span className="text-sm truncate text-foreground">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tickets")}
              data-testid="button-cancel"
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTicketMutation.isPending || isAnalyzingSentiment}
              data-testid="button-submit-ticket"
              className="min-w-[150px]"
            >
              {isAnalyzingSentiment ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analyzing...
                </div>
              ) : createTicketMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
