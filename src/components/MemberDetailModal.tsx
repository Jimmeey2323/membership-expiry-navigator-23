import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MembershipData } from "@/types/membership";
import { 
  User, Mail, MapPin, Calendar, Clock, CreditCard, 
  MessageSquare, FileText, Tag, Plus, Save, X
} from "lucide-react";

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  type: "comment" | "note";
}

interface MemberDetailModalProps {
  member: MembershipData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, comments: string, notes: string, tags: string[]) => void;
}

export const MemberDetailModal = ({ member, isOpen, onClose, onSave }: MemberDetailModalProps) => {
  const [comments, setComments] = useState(member?.comments || "");
  const [notes, setNotes] = useState(member?.notes || "");
  const [tags, setTags] = useState<string[]>(member?.tags || []);
  const [newTag, setNewTag] = useState("");

  if (!member) return null;

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    onSave(member.memberId, comments, notes, tags);
    onClose();
  };

  const mockComments: Comment[] = [
    { id: "1", text: "Initial consultation completed", timestamp: new Date("2024-01-15"), type: "comment" as const },
    { id: "2", text: "Prefers morning classes", timestamp: new Date("2024-01-20"), type: "note" as const },
    { id: "3", text: "Interested in personal training", timestamp: new Date("2024-02-01"), type: "comment" as const }
  ];

  const mockNotes: Comment[] = [
    { id: "4", text: "Has lower back issues - recommend modifications", timestamp: new Date("2024-01-18"), type: "note" as const },
    { id: "5", text: "Very motivated and consistent", timestamp: new Date("2024-01-25"), type: "note" as const }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <User className="h-5 w-5" />
            </div>
            {member.firstName} {member.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="membership">Membership Details</TabsTrigger>
            <TabsTrigger value="annotations">Notes & Tags</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[70vh] mt-4">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Email:</strong> {member.email}</p>
                    <p><strong>Member ID:</strong> {member.memberId}</p>
                    <p><strong>Location:</strong> {member.location}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      <Badge variant={member.status === 'Active' ? "default" : "destructive"}>
                        {member.status}
                      </Badge>
                    </div>
                    <p><strong>Sessions Left:</strong> {member.sessionsLeft}</p>
                    <p><strong>Frozen:</strong> {member.frozen}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Display existing notes, comments and tags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments & Notes History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                    {[...mockComments, ...mockNotes].map(item => (
                      <div key={item.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={item.type === 'comment' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{item.text}</p>
                      </div>
                    ))}
                    {member.comments && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="default">Current Comment</Badge>
                          <span className="text-xs text-muted-foreground">Current</span>
                        </div>
                        <p className="text-sm">{member.comments}</p>
                      </div>
                    )}
                    {member.notes && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="secondary">Current Note</Badge>
                          <span className="text-xs text-muted-foreground">Current</span>
                        </div>
                        <p className="text-sm">{member.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.tags && member.tags.length > 0 ? (
                        member.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 dark:bg-green-950/30">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags assigned</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="membership" className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Membership Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Type:</strong> {member.membershipName}</p>
                    <p><strong>Start Date:</strong> {new Date(member.orderDate).toLocaleDateString()}</p>
                    <p><strong>End Date:</strong> {new Date(member.endDate).toLocaleDateString()}</p>
                    <p><strong>Sold By:</strong> {member.soldBy}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Paid:</strong> {member.paid}</p>
                    <p><strong>Membership ID:</strong> {member.membershipId}</p>
                    <p><strong>Item ID:</strong> {member.itemId}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="annotations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add/Edit Annotations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="comments">Comments</Label>
                    <Textarea
                      id="comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments about this member..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add private notes..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
