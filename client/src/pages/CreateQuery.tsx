import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { ArrowLeft, Send, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useQueries } from '@/hooks/useQueries';
import { realAEOs, realHeadmasters } from '@/data/realData';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'general', label: 'General Query' },
  { value: 'leave', label: 'Leave Related' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'salary', label: 'Salary & Benefits' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'transfer', label: 'Transfer Request' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function CreateQuery() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { createQuery } = useQueries();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    recipientType: '',
    recipientId: '',
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const getRecipientOptions = () => {
    const options: { id: string; name: string; role: string }[] = [];
    
    if (user.role === 'TEACHER') {
      if (user.schoolId) {
        const headmaster = realHeadmasters.find(h => h.schoolId === user.schoolId);
        if (headmaster) {
          options.push({ id: headmaster.id, name: headmaster.name, role: 'HEAD_TEACHER' });
        }
      }
      
      if (user.clusterId) {
        const aeo = realAEOs.find(a => a.clusterId === user.clusterId);
        if (aeo) {
          options.push({ id: aeo.id, name: `${aeo.name} (AEO - ${aeo.area})`, role: 'AEO' });
        }
      }
      
      options.push({ id: 'ddeo-1', name: 'Deputy DEO', role: 'DDEO' });
      options.push({ id: 'deo-1', name: 'District Education Officer', role: 'DEO' });
    } else if (user.role === 'HEAD_TEACHER') {
      if (user.clusterId) {
        const aeo = realAEOs.find(a => a.clusterId === user.clusterId);
        if (aeo) {
          options.push({ id: aeo.id, name: `${aeo.name} (AEO - ${aeo.area})`, role: 'AEO' });
        }
      }
      options.push({ id: 'ddeo-1', name: 'Deputy DEO', role: 'DDEO' });
      options.push({ id: 'deo-1', name: 'District Education Officer', role: 'DEO' });
    }
    
    return options;
  };

  const recipientOptions = getRecipientOptions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientId || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const selectedRecipient = recipientOptions.find(r => r.id === formData.recipientId);
    
    if (!selectedRecipient) {
      toast({
        title: "Error",
        description: "Please select a recipient.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      createQuery({
        subject: formData.subject,
        message: formData.message,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        senderSchoolId: user.schoolId,
        senderSchoolName: user.schoolName,
        recipientId: selectedRecipient.id,
        recipientName: selectedRecipient.name,
        recipientRole: selectedRecipient.role,
        priority: formData.priority,
        category: formData.category,
        attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
        attachmentFileName: attachment?.name,
      });

      toast({
        title: "Query Submitted",
        description: "Your query has been sent successfully.",
      });

      setIsSubmitting(false);
      navigate('/queries');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/queries')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit Query</h1>
            <p className="text-sm text-muted-foreground">Send a written query to management</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Query Details</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Send To *</Label>
                <Select
                  value={formData.recipientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, recipientId: value }))}
                >
                  <SelectTrigger data-testid="select-recipient">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief subject of your query"
                  data-testid="input-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your query in detail..."
                  rows={6}
                  data-testid="input-message"
                />
              </div>

              <div className="space-y-2">
                <Label>Attachment (Optional)</Label>
                {attachment ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <span className="flex-1 text-sm truncate">{attachment.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAttachment(null)}
                      data-testid="button-remove-attachment"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload a document or image</p>
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        data-testid="input-attachment"
                      />
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/queries')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              data-testid="button-submit"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Query'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
