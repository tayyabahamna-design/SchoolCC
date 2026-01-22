import { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronLeft, ChevronRight, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

type Language = 'en' | 'ur';

interface GuideStep {
  title: { en: string; ur: string };
  description: { en: string; ur: string };
}

interface ScreenGuide {
  screenName: { en: string; ur: string };
  steps: GuideStep[];
}

const guides: Record<string, ScreenGuide> = {
  '/': {
    screenName: { en: 'Login', ur: 'لاگ ان' },
    steps: [
      {
        title: { en: 'Phone Number', ur: 'فون نمبر' },
        description: { en: 'Enter your 11-digit phone number to login', ur: 'لاگ ان کرنے کے لیے اپنا 11 ہندسوں کا فون نمبر درج کریں' },
      },
      {
        title: { en: 'Password', ur: 'پاس ورڈ' },
        description: { en: 'Enter your password', ur: 'اپنا پاس ورڈ درج کریں' },
      },
      {
        title: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں' },
        description: { en: 'New user? Tap "Create Account" to register', ur: 'نئے صارف؟ رجسٹر کرنے کے لیے "اکاؤنٹ بنائیں" پر ٹیپ کریں' },
      },
    ],
  },
  '/signup': {
    screenName: { en: 'Create Account', ur: 'اکاؤنٹ بنائیں' },
    steps: [
      {
        title: { en: 'Full Name', ur: 'پورا نام' },
        description: { en: 'Enter your complete name as per official records', ur: 'سرکاری ریکارڈ کے مطابق اپنا مکمل نام درج کریں' },
      },
      {
        title: { en: 'Phone Number', ur: 'فون نمبر' },
        description: { en: 'Enter your 11-digit mobile number (e.g., 03001234567)', ur: '11 ہندسوں کا موبائل نمبر درج کریں (مثال: 03001234567)' },
      },
      {
        title: { en: 'CNIC Number', ur: 'شناختی کارڈ نمبر' },
        description: { en: 'Enter your 13-digit CNIC (auto-formatted with dashes)', ur: 'اپنا 13 ہندسوں کا شناختی کارڈ نمبر درج کریں (خودکار فارمیٹ)' },
      },
      {
        title: { en: 'Select Role', ur: 'کردار منتخب کریں' },
        description: { en: 'Choose your job role: Teacher, Head Teacher, AEO, etc.', ur: 'اپنا عہدہ منتخب کریں: استاد، ہیڈ ٹیچر، AEO وغیرہ' },
      },
      {
        title: { en: 'District & School', ur: 'ضلع اور اسکول' },
        description: { en: 'Select your district, then your school from the list', ur: 'پہلے اپنا ضلع منتخب کریں، پھر اسکول' },
      },
      {
        title: { en: 'Password', ur: 'پاس ورڈ' },
        description: { en: 'Create a secure password (minimum 6 characters)', ur: 'محفوظ پاس ورڈ بنائیں (کم از کم 6 حروف)' },
      },
    ],
  },
  '/dashboard': {
    screenName: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
    steps: [
      {
        title: { en: 'Quick Actions', ur: 'فوری کارروائیاں' },
        description: { en: 'Access main features from the dashboard cards', ur: 'ڈیش بورڈ کارڈز سے اہم خصوصیات تک رسائی حاصل کریں' },
      },
      {
        title: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
        description: { en: 'View and manage leave records for your school', ur: 'اپنے اسکول کے چھٹی کے ریکارڈ دیکھیں اور ان کا انتظام کریں' },
      },
      {
        title: { en: 'Data Requests', ur: 'ڈیٹا کی درخواستیں' },
        description: { en: 'View and respond to data collection requests', ur: 'ڈیٹا جمع کرنے کی درخواستیں دیکھیں اور جواب دیں' },
      },
      {
        title: { en: 'Profile', ur: 'پروفائل' },
        description: { en: 'View your profile and settings from the top-right', ur: 'اوپر دائیں سے اپنا پروفائل اور ترتیبات دیکھیں' },
      },
    ],
  },
  '/calendar': {
    screenName: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
    steps: [
      {
        title: { en: 'View Calendar', ur: 'کیلنڈر دیکھیں' },
        description: { en: 'See all leaves marked on the calendar', ur: 'کیلنڈر پر تمام چھٹیاں دیکھیں' },
      },
      {
        title: { en: 'Add Leave', ur: 'چھٹی شامل کریں' },
        description: { en: 'Tap on any date to add a new leave record', ur: 'نئی چھٹی کا ریکارڈ شامل کرنے کے لیے کسی بھی تاریخ پر ٹیپ کریں' },
      },
      {
        title: { en: 'Leave Types', ur: 'چھٹی کی اقسام' },
        description: { en: 'Casual (عارضی), Sick (بیماری), Earned (کمائی ہوئی), Special (خصوصی)', ur: 'عارضی، بیماری، کمائی ہوئی اور خصوصی چھٹی کی اقسام' },
      },
      {
        title: { en: 'Guide Legend', ur: 'گائیڈ' },
        description: { en: 'Colors show leave types - check the Guide at bottom', ur: 'رنگ چھٹی کی اقسام دکھاتے ہیں - نیچے گائیڈ دیکھیں' },
      },
    ],
  },
  '/data-requests': {
    screenName: { en: 'Data Requests', ur: 'ڈیٹا کی درخواستیں' },
    steps: [
      {
        title: { en: 'View Requests', ur: 'درخواستیں دیکھیں' },
        description: { en: 'See all data requests assigned to you', ur: 'آپ کو تفویض کردہ تمام ڈیٹا کی درخواستیں دیکھیں' },
      },
      {
        title: { en: 'Status Filter', ur: 'حیثیت فلٹر' },
        description: { en: 'Filter by pending, submitted, or all requests', ur: 'زیر التوا، جمع کرائی گئی یا تمام درخواستوں کے مطابق فلٹر کریں' },
      },
      {
        title: { en: 'Submit Response', ur: 'جواب جمع کریں' },
        description: { en: 'Tap a request to view details and submit your response', ur: 'تفصیلات دیکھنے اور جواب جمع کرنے کے لیے درخواست پر ٹیپ کریں' },
      },
      {
        title: { en: 'Deadline', ur: 'آخری تاریخ' },
        description: { en: 'Check the deadline and submit before time expires', ur: 'آخری تاریخ چیک کریں اور وقت ختم ہونے سے پہلے جمع کریں' },
      },
    ],
  },
  '/create-request': {
    screenName: { en: 'Create Request', ur: 'درخواست بنائیں' },
    steps: [
      {
        title: { en: 'Request Title', ur: 'درخواست کا عنوان' },
        description: { en: 'Give your request a clear, descriptive title', ur: 'اپنی درخواست کو واضح عنوان دیں' },
      },
      {
        title: { en: 'Add Fields', ur: 'فیلڈز شامل کریں' },
        description: { en: 'Add the data fields you need to collect', ur: 'جو ڈیٹا آپ جمع کرنا چاہتے ہیں اس کی فیلڈز شامل کریں' },
      },
      {
        title: { en: 'Assign Users', ur: 'صارفین تفویض کریں' },
        description: { en: 'Select which users should receive this request', ur: 'منتخب کریں کہ کن صارفین کو یہ درخواست ملنی چاہیے' },
      },
      {
        title: { en: 'Set Deadline', ur: 'آخری تاریخ مقرر کریں' },
        description: { en: 'Set a deadline for responses', ur: 'جوابات کے لیے آخری تاریخ مقرر کریں' },
      },
    ],
  },
  '/school-visits': {
    screenName: { en: 'School Visits', ur: 'اسکول دورے' },
    steps: [
      {
        title: { en: 'Visit Types', ur: 'دورے کی اقسام' },
        description: { en: 'Monitoring, Mentoring, and Office visits', ur: 'نگرانی، رہنمائی اور دفتری دورے' },
      },
      {
        title: { en: 'Start Visit', ur: 'دورہ شروع کریں' },
        description: { en: 'Tap "New Visit" to begin recording a school visit', ur: 'اسکول دورے کا ریکارڈ شروع کرنے کے لیے "نیا دورہ" پر ٹیپ کریں' },
      },
      {
        title: { en: 'Add Evidence', ur: 'ثبوت شامل کریں' },
        description: { en: 'Upload photos as evidence during your visit', ur: 'اپنے دورے کے دوران ثبوت کے طور پر تصاویر اپ لوڈ کریں' },
      },
      {
        title: { en: 'Submit', ur: 'جمع کریں' },
        description: { en: 'Complete all fields and submit when done', ur: 'تمام فیلڈز مکمل کریں اور مکمل ہونے پر جمع کریں' },
      },
    ],
  },
  '/school-data': {
    screenName: { en: 'School Data', ur: 'اسکول ڈیٹا' },
    steps: [
      {
        title: { en: 'View School Info', ur: 'اسکول کی معلومات' },
        description: { en: 'See your school details and statistics', ur: 'اپنے اسکول کی تفصیلات اور اعداد و شمار دیکھیں' },
      },
      {
        title: { en: 'Edit Data', ur: 'ڈیٹا ایڈٹ کریں' },
        description: { en: 'Update school information when needed', ur: 'ضرورت پڑنے پر اسکول کی معلومات اپ ڈیٹ کریں' },
      },
      {
        title: { en: 'Inventory', ur: 'انوینٹری' },
        description: { en: 'Track school furniture and equipment', ur: 'اسکول کے فرنیچر اور سامان کو ٹریک کریں' },
      },
    ],
  },
  '/profile': {
    screenName: { en: 'Profile', ur: 'پروفائل' },
    steps: [
      {
        title: { en: 'View Profile', ur: 'پروفائل دیکھیں' },
        description: { en: 'See your account details and role', ur: 'اپنے اکاؤنٹ کی تفصیلات اور کردار دیکھیں' },
      },
      {
        title: { en: 'Change Theme', ur: 'تھیم تبدیل کریں' },
        description: { en: 'Switch between light and dark mode', ur: 'لائٹ اور ڈارک موڈ کے درمیان سوئچ کریں' },
      },
      {
        title: { en: 'Logout', ur: 'لاگ آؤٹ' },
        description: { en: 'Sign out of your account', ur: 'اپنے اکاؤنٹ سے سائن آؤٹ کریں' },
      },
    ],
  },
  '/user-management': {
    screenName: { en: 'User Management', ur: 'صارف کا انتظام' },
    steps: [
      {
        title: { en: 'View Users', ur: 'صارفین دیکھیں' },
        description: { en: 'See all users in your area of responsibility', ur: 'اپنے علاقے کے تمام صارفین دیکھیں' },
      },
      {
        title: { en: 'Filter Users', ur: 'صارفین فلٹر کریں' },
        description: { en: 'Filter by role, district, or school', ur: 'کردار، ضلع یا اسکول کے لحاظ سے فلٹر کریں' },
      },
      {
        title: { en: 'User Details', ur: 'صارف کی تفصیلات' },
        description: { en: 'Tap a user to view their full profile', ur: 'مکمل پروفائل دیکھنے کے لیے صارف پر ٹیپ کریں' },
      },
    ],
  },
  '/queries': {
    screenName: { en: 'Queries', ur: 'سوالات' },
    steps: [
      {
        title: { en: 'View Queries', ur: 'سوالات دیکھیں' },
        description: { en: 'See all queries and their status', ur: 'تمام سوالات اور ان کی حیثیت دیکھیں' },
      },
      {
        title: { en: 'Create Query', ur: 'سوال بنائیں' },
        description: { en: 'Submit a new query or question', ur: 'نیا سوال یا استفسار جمع کریں' },
      },
      {
        title: { en: 'Track Status', ur: 'حیثیت ٹریک کریں' },
        description: { en: 'Check responses and updates on your queries', ur: 'اپنے سوالات پر جوابات اور اپ ڈیٹس چیک کریں' },
      },
    ],
  },
  '/collaborative-forms': {
    screenName: { en: 'Collaborative Forms', ur: 'اشتراکی فارمز' },
    steps: [
      {
        title: { en: 'View Forms', ur: 'فارمز دیکھیں' },
        description: { en: 'See all collaborative data collection forms', ur: 'تمام اشتراکی ڈیٹا جمع کرنے کے فارمز دیکھیں' },
      },
      {
        title: { en: 'Fill Form', ur: 'فارم بھریں' },
        description: { en: 'Tap a form to fill in your data', ur: 'اپنا ڈیٹا بھرنے کے لیے فارم پر ٹیپ کریں' },
      },
      {
        title: { en: 'View Responses', ur: 'جوابات دیکھیں' },
        description: { en: 'See responses from other users', ur: 'دوسرے صارفین کے جوابات دیکھیں' },
      },
    ],
  },
};

// Default guide for screens without specific guides
const defaultGuide: ScreenGuide = {
  screenName: { en: 'Help', ur: 'مدد' },
  steps: [
    {
      title: { en: 'Navigation', ur: 'نیویگیشن' },
      description: { en: 'Use the menu or back button to navigate', ur: 'نیویگیٹ کرنے کے لیے مینو یا واپس بٹن استعمال کریں' },
    },
    {
      title: { en: 'Need Help?', ur: 'مدد چاہیے؟' },
      description: { en: 'Contact your supervisor for assistance', ur: 'مدد کے لیے اپنے سپروائزر سے رابطہ کریں' },
    },
  ],
};

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [location] = useLocation();

  useEffect(() => {
    setCurrentStep(0);
  }, [location]);

  // Find the matching guide - check for exact match first, then partial match
  const getGuide = (): ScreenGuide => {
    // Exact match
    if (guides[location]) return guides[location];
    
    // Partial match for dynamic routes like /request/:id
    const pathParts = location.split('/');
    if (pathParts[1] === 'request') return guides['/data-requests'] || defaultGuide;
    if (pathParts[1] === 'visit') return guides['/school-visits'] || defaultGuide;
    if (pathParts[1] === 'query') return guides['/queries'] || defaultGuide;
    if (pathParts[1] === 'album') return guides['/school-data'] || defaultGuide;
    if (pathParts[1] === 'collaborative-form') return guides['/collaborative-forms'] || defaultGuide;
    
    return defaultGuide;
  };

  const currentGuide = getGuide();
  const steps = currentGuide.steps;

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  // Hide on login and signup pages (they have their own help systems)
  const hideOnPages = ['/', '/signup'];
  const shouldHideButton = hideOnPages.includes(location);

  return (
    <>
      {/* Floating Help Button - hidden on login/signup */}
      {!shouldHideButton && (
        <button
          onClick={handleOpen}
          className="fixed bottom-20 right-4 z-[60] w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          aria-label="Open Help Guide"
          data-testid="button-help-guide"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}

      {/* Guide Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  <h2 className="font-semibold">
                    {language === 'en' ? 'Help Guide' : 'مدد گائیڈ'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-sm transition-colors"
                    data-testid="button-toggle-language"
                  >
                    <Languages className="w-4 h-4" />
                    {language === 'en' ? 'اردو' : 'English'}
                  </button>
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close"
                    data-testid="button-close-help"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-1">
                {currentGuide.screenName[language]}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                    {currentStep + 1}
                  </span>
                  <h3 className="font-semibold text-lg text-foreground">
                    {steps[currentStep]?.title[language]}
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {steps[currentStep]?.description[language]}
                </p>
              </div>

              {/* Progress */}
              <div className="flex gap-1 mb-6">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      idx <= currentStep ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {language === 'en' ? 'Back' : 'واپس'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {steps.length}
                </span>
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="gap-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {currentStep === steps.length - 1 
                    ? (language === 'en' ? 'Done' : 'مکمل') 
                    : (language === 'en' ? 'Next' : 'اگلا')}
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
