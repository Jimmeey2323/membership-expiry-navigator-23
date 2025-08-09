import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MembershipData } from "@/types/membership";
import { 
  User, Mail, Calendar, MapPin, Target, Hash, Clock, 
  MessageSquare, StickyNote, Tag, Plus, X, Save, Edit3,
  UserCheck, TrendingUp, Activity, AlertCircle
} from "lucide-react";
import { useState } from "react";

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
}

export const MemberDetailModal = ({ member, isOpen, onClose }: MemberDetailModalProps) => {
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', text: 'Member showed interest in premium classes', timestamp: new Date('2024-01-15'), type: 'comment' as const },
    { id: '2', text: 'Prefers evening sessions', timestamp: new Date('2024-01-20'), type: 'note' as const }
  ]);
  const [notes, setNotes] = useState<Comment[]>([
    { id: '1', text: 'Very dedicated member, rarely misses classes', timestamp: new Date('2024-01-10'), type: 'note' as const },
    { id: '2', text: 'Has specific dietary requirements', timestamp: new Date('2024-01-25'), type: 'note' as const }
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState(['VIP', 'Regular', 'Evening Preferred']);

  if (!member) return null;

  const addComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now().toString(),
        text: newComment,
        timestamp: new Date(),
        type: 'comment' as const
      }]);
      setNewComment('');
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        id: Date.now().toString(),
        text: newNote,
        timestamp: new Date(),
        type: 'note' as const
      }]);
      setNewNote('');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getMembershipDetails = () => [
    { label: 'Member ID', value: member.memberId, icon: Hash },
    { label: 'Email', value: member.email, icon: Mail },
    { label: 'Start Date', value: new Date(member.orderDate).toLocaleDateString(), icon: Calendar },
    { label: 'End Date', value: new Date(member.endDate).toLocaleDateString(), icon: Calendar },
    { label: 'Location', value: member.location, icon: MapPin },
    { label: 'Sessions Left', value: member.sessionsLeft.toString(), icon: Target },
    { label: 'Sold By', value: member.soldBy, icon: UserCheck }
  ];

  // Combine all notes and comments for overview
  const allActivity = [
    ...comments.map(c => ({...c, activityType: 'comment'})),
    ...notes.map(n => ({...n, activityType: 'note'}))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 premium-card">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-8 pb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full ${
                    member.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                  } flex items-center justify-center shadow-lg`}>
                    {member.status === 'Active' ? 
                      <UserCheck className="h-3 w-3 text-white" /> : 
                      <AlertCircle className="h-3 w-3 text-white" />
                    }
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-slate-900 mb-2">
                    {member.firstName} {member.lastName}
                  </DialogTitle>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className={`px-4 py-2 text-sm font-semibold border-2 ${getStatusColor(member.status)}`}>
                      {member.status}
                    </Badge>
                    <span className="text-slate-600 font-medium">{member.membershipName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 p-8 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 p-2 rounded-2xl">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold py-3 rounded-xl transition-all">
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold py-3 rounded-xl transition-all">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold py-3 rounded-xl transition-all">
                  <StickyNote className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
                <TabsTrigger value="tags" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold py-3 rounded-xl transition-all">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full overflow-hidden mt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                    <Card className="premium-card">
                      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-2 bg-blue-500 text-white rounded-xl">
                            <User className="h-5 w-5" />
                          </div>
                          Member Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {getMembershipDetails().map((detail, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-3">
                                <detail.icon className="h-5 w-5 text-slate-600" />
                                <span className="font-semibold text-slate-700">{detail.label}</span>
                              </div>
                              <span className="font-bold text-slate-900">{detail.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="premium-card">
                      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-200">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <div className="p-2 bg-purple-500 text-white rounded-xl">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <ScrollArea className="h-80">
                          <div className="space-y-4">
                            {allActivity.map((item, index) => (
                              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {item.activityType === 'comment' ? 
                                      <MessageSquare className="h-4 w-4 text-green-600" /> : 
                                      <StickyNote className="h-4 w-4 text-purple-600" />
                                    }
                                    <Badge variant="outline" className="text-xs">
                                      {item.activityType === 'comment' ? 'Comment' : 'Note'}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {item.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700 font-medium">{item.text}</p>
                              </div>
                            ))}
                            
                            {/* Display tags in overview */}
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Tag className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-semibold text-orange-800">Member Tags</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="bg-white border-orange-200 text-orange-800">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="h-full overflow-hidden mt-0">
                  <Card className="h-full premium-card">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        Comments Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex gap-4 mb-6">
                        <Input
                          placeholder="Add a new comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addComment()}
                        />
                        <Button onClick={addComment} className="bg-emerald-600 hover:bg-emerald-700 px-6">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="space-y-4">
                          {comments.filter(c => c.type === 'comment').map((comment) => (
                            <div key={comment.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                              <div className="flex justify-between items-start mb-2">
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                  Comment
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {comment.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-700 font-medium">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="h-full overflow-hidden mt-0">
                  <Card className="h-full premium-card">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-slate-200">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-purple-500 text-white rounded-xl">
                          <StickyNote className="h-5 w-5" />
                        </div>
                        Notes Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex gap-4 mb-6">
                        <Textarea
                          placeholder="Add a detailed note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="flex-1 min-h-[80px]"
                        />
                        <Button onClick={addNote} className="bg-purple-600 hover:bg-purple-700 px-6 self-end">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="space-y-4">
                          {notes.filter(n => n.type === 'note').map((note) => (
                            <div key={note.id} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                              <div className="flex justify-between items-start mb-2">
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  Note
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {note.timestamp.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-slate-700 font-medium">{note.text}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tags" className="h-full overflow-hidden mt-0">
                  <Card className="h-full premium-card">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-slate-200">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-orange-500 text-white rounded-xl">
                          <Tag className="h-5 w-5" />
                        </div>
                        Tags Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex gap-4 mb-6">
                        <Input
                          placeholder="Add a new tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        />
                        <Button onClick={addTag} className="bg-orange-600 hover:bg-orange-700 px-6">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {tags.map((tag, index) => (
                          <div key={index} className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-xl border border-orange-200">
                            <span className="font-medium">{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-orange-600 hover:text-orange-800 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
