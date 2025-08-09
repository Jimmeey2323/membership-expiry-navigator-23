import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Activity, 
  Crown,
  MessageSquare,
  FileText,
  Tag,
  Save,
  X,
  Plus,
  Clock,
  Trash2
} from "lucide-react";
import { MembershipData } from "@/types/membership";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  date: string;
  type: 'note' | 'comment';
}

interface MemberDetailModalProps {
  member: MembershipData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, comments: string, notes: string, tags: string[]) => void;
}

export const MemberDetailModal = ({ member, isOpen, onClose, onSave }: MemberDetailModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Note[]>([]);

  useEffect(() => {
    if (member) {
      setTags(member.tags || []);
      // Initialize with existing data if any
      const existingNotes: Note[] = member.notes ? [{
        id: '1',
        content: member.notes,
        date: new Date().toISOString(),
        type: 'note'
      }] : [];
      const existingComments: Note[] = member.comments ? [{
        id: '1',
        content: member.comments,
        date: new Date().toISOString(),
        type: 'comment'
      }] : [];
      setNotes(existingNotes);
      setComments(existingComments);
    }
  }, [member]);

  if (!member) return null;

  const handleSave = () => {
    const allNotes = notes.map(n => n.content).join('\n---\n');
    const allComments = comments.map(c => c.content).join('\n---\n');
    onSave(member.memberId, allComments, allNotes, tags);
    onClose();
  };

  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        date: new Date().toISOString(),
        type: 'note'
      };
      setNotes([...notes, note]);
      setNewNote('');
      toast.success('Note added successfully!');
    }
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Note = {
        id: Date.now().toString(),
        content: newComment.trim(),
        date: new Date().toISOString(),
        type: 'comment'
      };
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added successfully!');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      toast.success('Tag added successfully!');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast.success('Note removed successfully!');
  };

  const removeComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    toast.success('Comment removed successfully!');
  };

  const getMembershipIcon = (membershipName: string) => {
    if (membershipName?.toLowerCase().includes('premium') || membershipName?.toLowerCase().includes('unlimited')) {
      return <Crown className="h-5 w-5 text-yellow-600" />;
    }
    return <Activity className="h-5 w-5 text-blue-600" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700' 
      : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700';
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
        <DialogHeader className="pb-6 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center font-bold text-blue-700 dark:text-blue-300">
              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
            </div>
            {member.firstName} {member.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-blue-400 font-semibold"
            >
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="annotations" 
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-blue-400 font-semibold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes & Comments
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[65vh]">
            <TabsContent value="overview" className="space-y-6">
              {/* Member Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Member ID:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{member.memberId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Email:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{member.email}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Membership Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Type:</span>
                      <div className="flex items-center gap-2">
                        {getMembershipIcon(member.membershipName)}
                        <span className="font-semibold text-slate-900 dark:text-white">{member.membershipName}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300">Status:</span>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Sessions Left:</span>
                      <Badge variant="outline" className="font-bold dark:border-slate-600 dark:text-white">
                        {member.sessionsLeft}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Important Dates
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Order Date:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatDate(member.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">End Date:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{formatDate(member.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Sold By:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{member.soldBy || 'N/A'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Payment
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Location:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{member.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Amount Paid:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{member.paid || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Status:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{member.frozen === 'Yes' ? 'Frozen' : 'Active'}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Existing Notes, Comments and Tags Display */}
              {(notes.length > 0 || comments.length > 0 || tags.length > 0) && (
                <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Saved Information
                  </h3>
                  
                  <div className="space-y-6">
                    {comments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-semibold">Comments ({comments.length})</span>
                        </div>
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(comment.date)}
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {notes.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                          <FileText className="h-4 w-4" />
                          <span className="font-semibold">Internal Notes ({notes.length})</span>
                        </div>
                        {notes.map((note) => (
                          <div key={note.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(note.date)}
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                          <Tag className="h-4 w-4" />
                          <span className="font-semibold">Tags ({tags.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 px-3 py-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="annotations" className="space-y-6">
              <div className="space-y-6">
                {/* Add New Comment */}
                <Card className="p-6 border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Add Comment
                  </h3>
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Add a new comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 min-h-[80px] dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    <Button 
                      onClick={addComment} 
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white self-end"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </Card>

                {/* Add New Note */}
                <Card className="p-6 border-2 border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Add Internal Note
                  </h3>
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Add an internal note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 min-h-[80px] dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    <Button 
                      onClick={addNote} 
                      disabled={!newNote.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white self-end"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </Card>

                {/* Manage Tags */}
                <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-purple-600" />
                    Manage Tags
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Add a tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                      />
                      <Button 
                        onClick={addTag} 
                        disabled={!newTag.trim()}
                        variant="outline" 
                        className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 px-3 py-1 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Display All Comments and Notes with Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Comments List */}
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      All Comments ({comments.length})
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 italic">No comments yet</p>
                      ) : (
                        comments.map(comment => (
                          <div key={comment.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(comment.date)}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeComment(comment.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Notes List */}
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      All Notes ({notes.length})
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notes.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400 italic">No notes yet</p>
                      ) : (
                        notes.map(note => (
                          <div key={note.id} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <Clock className="h-3 w-3" />
                                {formatDate(note.date)}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeNote(note.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{note.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} className="dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
