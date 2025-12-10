import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useParams } from 'wouter';
import { ArrowLeft, Send, Clock, CheckCircle, AlertCircle, User, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useQueries, Query } from '@/hooks/useQueries';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<Query['status'], string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<Query['priority'], string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-amber-100 text-amber-600',
  high: 'bg-red-100 text-red-600',
};

export default function ViewQuery() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams();
  const queryId = params.id;
  const { getQueryById, getResponsesByQuery, addResponse, updateQueryStatus } = useQueries();
  const { toast } = useToast();
  
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !queryId) return null;

  const query = getQueryById(queryId);
  const responses = getResponsesByQuery(queryId);

  if (!query) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Query not found.</p>
          <Button onClick={() => navigate('/queries')} className="mt-4" data-testid="button-go-back">
            Go to Queries
          </Button>
        </Card>
      </div>
    );
  }

  const canReply = user.id === query.recipientId || 
    (user.role === 'DEO' || user.role === 'CEO' || user.role === 'DDEO');

  const handleSubmitReply = () => {
    if (!replyMessage.trim()) return;
    
    setIsSubmitting(true);

    setTimeout(() => {
      addResponse({
        queryId: query.id,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: replyMessage,
      });

      toast({
        title: "Reply Sent",
        description: "Your response has been added.",
      });

      setReplyMessage('');
      setIsSubmitting(false);
    }, 500);
  };

  const handleResolve = () => {
    updateQueryStatus(query.id, 'resolved');
    toast({
      title: "Query Resolved",
      description: "This query has been marked as resolved.",
    });
  };

  const handleClose = () => {
    updateQueryStatus(query.id, 'closed');
    toast({
      title: "Query Closed",
      description: "This query has been closed.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/queries')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-muted-foreground">{query.ticketNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[query.status]}`}>
                  {query.status.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[query.priority]}`}>
                  {query.priority}
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{query.subject}</h1>
            </div>
          </div>
          
          {canReply && query.status !== 'closed' && (
            <div className="flex gap-2">
              {query.status !== 'resolved' && (
                <Button
                  variant="outline"
                  onClick={handleResolve}
                  data-testid="button-resolve"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleClose}
                data-testid="button-close"
              >
                Close Query
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-foreground">{query.senderName}</span>
                  <span className="text-sm text-muted-foreground ml-2">({query.senderRole})</span>
                  {query.senderSchoolName && (
                    <span className="text-sm text-muted-foreground ml-2">• {query.senderSchoolName}</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {query.createdAt.toLocaleDateString()} at {query.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-foreground whitespace-pre-wrap">{query.message}</p>
              {query.category && (
                <div className="mt-3">
                  <span className="text-xs bg-muted px-2 py-1 rounded">Category: {query.category}</span>
                </div>
              )}
              {query.attachmentFileName && (
                <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                  <Paperclip className="w-4 h-4" />
                  <span>{query.attachmentFileName}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {responses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">RESPONSES ({responses.length})</h3>
            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id} className="p-6 bg-muted/30">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold text-foreground">{response.senderName}</span>
                          <span className="text-sm text-muted-foreground ml-2">({response.senderRole})</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {response.createdAt.toLocaleDateString()} at {response.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{response.message}</p>
                      {response.attachmentFileName && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                          <Paperclip className="w-4 h-4" />
                          <span>{response.attachmentFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {canReply && query.status !== 'closed' && (
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Add Response</h3>
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your response..."
              rows={4}
              className="mb-4"
              data-testid="input-reply"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitReply}
                disabled={!replyMessage.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                data-testid="button-send-reply"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Response'}
              </Button>
            </div>
          </Card>
        )}

        {query.status === 'closed' && (
          <Card className="p-6 bg-muted/50 text-center">
            <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">This query has been closed and no further responses can be added.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
