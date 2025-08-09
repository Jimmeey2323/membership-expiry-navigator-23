
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Save, User, Calendar, MapPin, Mail, Hash, MessageSquare, FileText, Tag, Clock } from "lucide-react";
import { MembershipData } from "@/types/membership";
import { googleSheetsService } from "@/services/googleSheets";
import { toast } from "sonner";

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
  type: 'comment' | 'note';
}

interface MemberDetailModalProps {
  member: MembershipData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, comments: string, notes: string, tags: string[]) => void;
}

export const MemberDetailModal = ({ member, isOpen, onClose, onSave }: MemberDetailModalProps) => {
  const [comments, setComments] = useState<Comment[]>(() => {
    if (member?.comments) {
      return [{ id: '1', text: member.comments, timestamp: new Date(), type: 'comment' as const }];
    }
    return [];
  });
  
  const [notes, setNotes] = useState<Comment[]>(() => {
    if (member?.notes) {
      return [{ id: '1', text: member.notes, timestamp: new Date(), type: 'note' as const }];
    }
    return [];
  });
  
  const [tags, setTags] = useState<string[]>(member?.tags || []);
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      timestamp: new Date(),
      type: 'comment' as const
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
    commentInputRef.current?.focus();
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Comment = {
      id: Date.now().toString(),
      text: newNote,
      timestamp: new Date(),
      type: 'note' as const
    };
    setNotes(prev => [...prev, note]);
    setNewNote('');
    noteInputRef.current?.focus();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleRemoveComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleRemoveNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleSave = async () => {
    if (!member) return;
    
    setIsSaving(true);
    try {
      const allComments = comments.map(c => c.text).join('\n');
      const allNotes = notes.map(n => n.text).join('\n');
      
      await googleSheetsService.saveAnnotation(
        member.memberId,
        member.email,
        allComments,
        allNotes,
        tags
      );
      
      onSave(member.memberId, allComments, allNotes, tags);
      toast.success("Member information saved successfully!");
      onClose();
    } catch (error) {
      console.error('Error saving member information:', error);
      toast.error("Failed to save member information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'comment' | 'note' | 'tag') => {
    if (e.key === 'Enter') {
      if (type === 'comment' && !e.shiftKey) {
        e.preventDefault();
        handleAddComment();
      } else if (type === 'note' && !e.shiftKey) {
        e.preventDefault();
        handleAddNote();
      } else if (type === 'tag') {
        e.preventDefault();
        handleAddTag();
      }
    }
  };

  if (!member) return null;

  const allHistoryItems = [
    ...comments.map(c => ({ ...c, category: 'Comment' })),
    ...notes.map(n => ({ ...n, category: 'Note' }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto modal-premium">
        <DialogHeader className="space-y-4 pb-6 border-b border-border">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-foreground">
                {member.firstName} {member.lastName}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                Member ID: {member.memberId}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="comments" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Notes & Tags
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Member Details */}
            <Card className="premium-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Member Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p className="font-medium text-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Membership Type</span>
                      <p className="font-medium text-foreground">{member.membershipName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Location</span>
                      <p className="font-medium text-foreground">{member.location}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">Start Date</span>
                      <p className="font-medium text-foreground">{new Date(member.orderDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground">End Date</span>
                      <p className="font-medium text-foreground">{new Date(member.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'Active' ? "default" : "destructive"}>
                          {member.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {member.sessionsLeft} sessions left
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Activity History */}
            <Card className="premium-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity History
              </h3>
              {allHistoryItems.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto professional-scrollbar">
                  {allHistoryItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg ${item.type === 'comment' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                          {item.type === 'comment' ? (
                            <MessageSquare className={`h-4 w-4 ${item.type === 'comment' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
                          ) : (
                            <FileText className={`h-4 w-4 ${item.type === 'comment' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}`} />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground break-words">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity history yet</p>
                </div>
              )}
            </Card>

            {/* Tags Overview */}
            {tags.length > 0 && (
              <Card className="premium-card p-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Current Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            {/* Add Comment */}
            <Card className="premium-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Add Comment</h3>
              <div className="space-y-4">
                <Textarea
                  ref={commentInputRef}
                  placeholder="Add a comment about this member..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'comment')}
                  className="min-h-[100px] input-premium"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()} className="btn-premium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </Card>

            {/* Comments List */}
            <Card className="premium-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Comments ({comments.length})</h3>
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComment(comment.id)}
                          className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground break-words">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            {/* Add Note */}
            <Card className="premium-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Add Note</h3>
              <div className="space-y-4">
                <Textarea
                  ref={noteInputRef}
                  placeholder="Add a private note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'note')}
                  className="min-h-[100px] input-premium"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()} className="btn-premium">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </Card>

            {/* Notes List */}
            <Card className="premium-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Notes ({notes.length})</h3>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground">
                          {note.timestamp.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNote(note.id)}
                          className="h-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground break-words">{note.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notes yet</p>
                </div>
              )}
            </Card>

            {/* Tags Management */}
            <Card className="premium-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a new tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'tag')}
                    className="flex-1 input-premium"
                  />
                  <Button onClick={handleAddTag} disabled={!newTag.trim()} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="btn-premium">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
