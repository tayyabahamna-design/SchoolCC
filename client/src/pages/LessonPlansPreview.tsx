import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ArrowLeft, 
  GraduationCap, 
  Sparkles,
  Clock,
  Bell,
  CheckCircle2,
  FileText,
  Video,
  Lightbulb,
  Star
} from 'lucide-react';

const grades = [
  { id: 'prep', label: 'Prep', labelUr: 'پریپ' },
  { id: '1', label: 'Class 1', labelUr: 'جماعت 1' },
  { id: '2', label: 'Class 2', labelUr: 'جماعت 2' },
  { id: '3', label: 'Class 3', labelUr: 'جماعت 3' },
  { id: '4', label: 'Class 4', labelUr: 'جماعت 4' },
  { id: '5', label: 'Class 5', labelUr: 'جماعت 5' },
];

const subjects = [
  { id: 'english', label: 'English', labelUr: 'انگریزی', color: 'from-blue-400 to-blue-600', icon: '📘' },
  { id: 'urdu', label: 'Urdu', labelUr: 'اردو', color: 'from-emerald-400 to-emerald-600', icon: '📗' },
  { id: 'math', label: 'Mathematics', labelUr: 'ریاضی', color: 'from-amber-400 to-amber-600', icon: '📐' },
];

const upcomingFeatures = [
  { icon: FileText, label: 'Ready-made lesson plans', labelUr: 'تیار شدہ سبق کے منصوبے' },
  { icon: Video, label: 'Video tutorials', labelUr: 'ویڈیو ٹیوٹوریلز' },
  { icon: Lightbulb, label: 'Teaching activities', labelUr: 'تدریسی سرگرمیاں' },
  { icon: CheckCircle2, label: 'Assessment tools', labelUr: 'جانچ کے اوزار' },
];

export default function LessonPlansPreview() {
  const [, navigate] = useLocation();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [notifyMe, setNotifyMe] = useState(false);

  const handleNotifyMe = () => {
    setNotifyMe(true);
    setTimeout(() => {
      setNotifyMe(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
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
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Lesson Plans
            </h1>
            <p className="text-sm text-muted-foreground">سبق کے منصوبے</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Coming Soon</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Lesson Plans Hub</h2>
              <p className="text-white/90 text-sm mb-1">
                Your complete teaching companion with ready-made lesson plans, activities, and assessments.
              </p>
              <p className="text-white/80 text-sm" dir="rtl">
                تیار شدہ سبق کے منصوبے، سرگرمیاں اور جانچ کے ساتھ آپ کا مکمل تدریسی ساتھی
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-foreground">Select Grade / جماعت منتخب کریں</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            {grades.map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGrade(grade.id)}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                  selectedGrade === grade.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-lg scale-105'
                    : 'border-border hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                }`}
                data-testid={`button-grade-${grade.id}`}
              >
                <p className="font-semibold text-sm text-foreground">{grade.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{grade.labelUr}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-foreground">Select Subject / مضمون منتخب کریں</h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedSubject === subject.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 shadow-lg scale-105'
                    : 'border-border hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20'
                }`}
                data-testid={`button-subject-${subject.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${subject.color} flex items-center justify-center text-xl`}>
                    {subject.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{subject.label}</p>
                    <p className="text-xs text-muted-foreground">{subject.labelUr}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedGrade && selectedSubject && (
          <Card className="p-6 border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Coming Soon!</h3>
                <p className="text-muted-foreground text-sm">
                  Lesson plans for <span className="font-semibold text-indigo-600">{grades.find(g => g.id === selectedGrade)?.label}</span> - <span className="font-semibold text-purple-600">{subjects.find(s => s.id === selectedSubject)?.label}</span> are being prepared by our expert team.
                </p>
                <p className="text-muted-foreground text-sm mt-2" dir="rtl">
                  ہماری ماہر ٹیم اس کی تیاری کر رہی ہے۔ جلد آ رہا ہے!
                </p>
              </div>
              
              <Button
                onClick={handleNotifyMe}
                disabled={notifyMe}
                className={`gap-2 ${notifyMe ? 'bg-green-500 hover:bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'}`}
                data-testid="button-notify-me"
              >
                {notifyMe ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    You'll be notified!
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Notify Me When Ready
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-foreground">What's Coming / کیا آنے والا ہے</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.labelUr}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">
            Check back soon for updates!
          </p>
          <p className="text-sm text-muted-foreground" dir="rtl">
            اپ ڈیٹس کے لیے جلد واپس آئیں!
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
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
