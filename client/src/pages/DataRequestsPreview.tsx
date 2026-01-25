import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  ArrowLeft, 
  Sparkles,
  Clock,
  Bell,
  CheckCircle2,
  Send,
  ClipboardList,
  Users,
  Calendar
} from 'lucide-react';

const sampleRequest = {
  title: 'Monthly Enrollment Data',
  titleUr: 'ماہانہ اندراج کا ڈیٹا',
  description: 'Please provide the current student enrollment count for your school.',
  descriptionUr: 'براہ کرم اپنے اسکول میں طلباء کی موجودہ تعداد فراہم کریں۔',
  dueDate: '2026-02-01',
  priority: 'High',
  priorityUr: 'اعلیٰ ترجیح'
};

export default function DataRequestsPreview() {
  const [, navigate] = useLocation();
  const [sampleInput, setSampleInput] = useState('');
  const [notifyMe, setNotifyMe] = useState(false);

  const handleNotifyMe = () => {
    setNotifyMe(true);
    setTimeout(() => {
      setNotifyMe(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-violet-950">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="rounded-full"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Data Requests
            </h1>
            <p className="text-sm text-muted-foreground">ڈیٹا کی درخواستیں</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Feature Preview</h2>
              <p className="text-white/90 text-sm mb-1">
                This feature is under development. Below is a preview of how data requests will work.
              </p>
              <p className="text-white/80 text-sm" dir="rtl">
                یہ فیچر تیاری میں ہے۔ نیچے دکھایا گیا ہے کہ ڈیٹا کی درخواستیں کیسے کام کریں گی۔
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">What are Data Requests?</h2>
              <p className="text-white/90 mb-1">
                Data requests allow supervisors to collect information from schools and field staff efficiently.
              </p>
              <p className="text-white/80 text-sm" dir="rtl">
                ڈیٹا کی درخواستیں نگرانوں کو اسکولوں اور فیلڈ عملے سے مؤثر طریقے سے معلومات جمع کرنے کی اجازت دیتی ہیں۔
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-violet-600" />
            Sample Data Request
            <span className="text-muted-foreground font-normal text-sm mr-2">نمونہ درخواست</span>
          </h3>
          
          <Card className="p-6 border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{sampleRequest.title}</h4>
                  <p className="text-sm text-muted-foreground" dir="rtl">{sampleRequest.titleUr}</p>
                </div>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                  {sampleRequest.priority}
                </span>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                <p className="text-foreground mb-1">{sampleRequest.description}</p>
                <p className="text-muted-foreground text-sm" dir="rtl">{sampleRequest.descriptionUr}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {sampleRequest.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>From: AEO Office</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Response <span className="text-muted-foreground font-normal">(آپ کا جواب)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your data here... یہاں ڈیٹا درج کریں"
                    value={sampleInput}
                    onChange={(e) => setSampleInput(e.target.value)}
                    className="flex-1"
                    data-testid="input-sample-response"
                  />
                  <Button 
                    className="bg-violet-600 hover:bg-violet-700"
                    disabled
                    data-testid="button-submit-response"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This is a preview only. Responses cannot be submitted yet.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            How It Will Work
            <span className="text-muted-foreground font-normal text-sm">یہ کیسے کام کرے گا</span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <span className="text-violet-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Receive requests</p>
                <p className="text-sm text-muted-foreground">درخواستیں موصول کریں</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <span className="text-violet-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Enter your data</p>
                <p className="text-sm text-muted-foreground">اپنا ڈیٹا درج کریں</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <span className="text-violet-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Submit response</p>
                <p className="text-sm text-muted-foreground">جواب جمع کرائیں</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                <span className="text-violet-600 font-bold text-sm">4</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Track status</p>
                <p className="text-sm text-muted-foreground">حیثیت ٹریک کریں</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bell className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Get Notified When Ready</h3>
            <p className="text-muted-foreground text-sm mb-1">
              We'll let you know as soon as this feature is available.
            </p>
            <p className="text-muted-foreground text-sm mb-4" dir="rtl">
              جب یہ فیچر دستیاب ہوگا تو ہم آپ کو بتائیں گے۔
            </p>
            <Button 
              onClick={handleNotifyMe}
              disabled={notifyMe}
              className={notifyMe ? 'bg-green-600 hover:bg-green-600' : 'bg-amber-600 hover:bg-amber-700'}
              data-testid="button-notify-me"
            >
              {notifyMe ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  You'll be notified!
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Notify Me
                </>
              )}
            </Button>
          </div>
        </Card>

        <div className="pb-8">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/dashboard')}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
