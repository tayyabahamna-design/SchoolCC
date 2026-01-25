import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Languages, BookOpen, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth';

type Language = 'en' | 'ur';

interface GuideStep {
  title: { en: string; ur: string };
  description: { en: string; ur: string };
  tip?: { en: string; ur: string };
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  openMenu?: boolean;
}

interface ScreenGuide {
  screenName: { en: string; ur: string };
  introduction: { en: string; ur: string };
  steps: GuideStep[];
}

const guides: Record<string, ScreenGuide> = {
  '/dashboard': {
    screenName: { en: 'Dashboard Guide', ur: 'ڈیش بورڈ گائیڈ' },
    introduction: {
      en: 'Welcome! Let me show you all the features of TaleemHub.',
      ur: 'خوش آمدید! آئیں TaleemHub کی تمام خصوصیات دیکھتے ہیں۔'
    },
    steps: [
      {
        title: { en: 'Task Cards', ur: 'کام کارڈز' },
        description: {
          en: 'See pending tasks, completed work, and lesson plans.',
          ur: 'زیر التوا کام، مکمل شدہ اور سبق کے منصوبے دیکھیں۔'
        },
        target: '[data-testid="widget-stats"]',
        position: 'bottom'
      },
      {
        title: { en: 'Inspiration Quote', ur: 'حوصلہ افزا اقتباس' },
        description: {
          en: 'A new quote appears each visit.',
          ur: 'ہر بار نیا اقتباس۔'
        },
        target: '[data-testid="widget-quote"]',
        position: 'top'
      },
      {
        title: { en: 'Teaching Tips', ur: 'تدریسی تجاویز' },
        description: {
          en: '3 tips to improve your teaching.',
          ur: 'تدریس بہتر کرنے کی 3 تجاویز۔'
        },
        target: '[data-testid="widget-tips"]',
        position: 'top'
      },
      {
        title: { en: 'Leave Calendar Button', ur: 'چھٹی کیلنڈر بٹن' },
        description: {
          en: 'Quick access to your leave calendar.',
          ur: 'اپنے چھٹی کیلنڈر تک فوری رسائی۔'
        },
        target: '[data-testid="button-view-calendar-mobile"], [data-testid="button-view-calendar"]',
        position: 'bottom'
      },
      {
        title: { en: 'Community Album Button', ur: 'کمیونٹی البم بٹن' },
        description: {
          en: 'Share classroom photos here.',
          ur: 'یہاں کلاس روم کی تصاویر شیئر کریں۔'
        },
        target: '[data-testid="button-community-album"]',
        position: 'bottom'
      },
      {
        title: { en: 'Queries Button', ur: 'سوالات بٹن' },
        description: {
          en: 'Ask questions to supervisors.',
          ur: 'سپروائزرز سے سوالات پوچھیں۔'
        },
        target: '[data-testid="button-view-queries"]',
        position: 'bottom'
      },
      {
        title: { en: 'Open Menu', ur: 'مینو کھولیں' },
        description: {
          en: 'Now let me show you the menu. I\'ll open it for you.',
          ur: 'اب مینو دیکھتے ہیں۔ میں آپ کے لیے کھولتا ہوں۔'
        },
        target: '[data-testid="button-open-menu"], [data-testid="button-toggle-menu"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Data Requests', ur: 'ڈیٹا درخواستیں' },
        description: {
          en: 'View and respond to data requests from supervisors.',
          ur: 'سپروائزرز کی ڈیٹا درخواستیں دیکھیں اور جواب دیں۔'
        },
        target: '[data-testid="mobile-button-data-requests-preview"], [data-testid="button-data-requests-preview"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
        description: {
          en: 'Track all your approved leaves.',
          ur: 'اپنی تمام منظور شدہ چھٹیاں ٹریک کریں۔'
        },
        target: '[data-testid="mobile-button-leave-calendar"], [data-testid="button-view-calendar"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Community Album', ur: 'کمیونٹی البم' },
        description: {
          en: 'Share and view photos from all schools.',
          ur: 'تمام اسکولوں کی تصاویر دیکھیں اور شیئر کریں۔'
        },
        target: '[data-testid="mobile-button-community-album"], [data-testid="button-community-album"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Queries', ur: 'سوالات' },
        description: {
          en: 'Ask questions and get help.',
          ur: 'سوالات پوچھیں اور مدد لیں۔'
        },
        target: '[data-testid="mobile-button-queries"], [data-testid="button-view-queries"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Lesson Plans', ur: 'سبق کے منصوبے' },
        description: {
          en: 'Create and manage lesson plans.',
          ur: 'سبق کے منصوبے بنائیں اور منظم کریں۔'
        },
        target: '[data-testid="mobile-button-lesson-plans"], [data-testid="button-lesson-plans"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Help Guide', ur: 'ہیلپ گائیڈ' },
        description: {
          en: 'Open this guide anytime from here.',
          ur: 'یہ گائیڈ کسی بھی وقت یہاں سے کھولیں۔'
        },
        target: '[data-testid="mobile-button-help-guide"], [data-testid="button-help-guide-sidebar"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Logout', ur: 'لاگ آؤٹ' },
        description: {
          en: 'Sign out of your account.',
          ur: 'اپنے اکاؤنٹ سے سائن آؤٹ کریں۔'
        },
        target: '[data-testid="mobile-button-logout"], [data-testid="button-logout"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'All Done!', ur: 'مکمل!' },
        description: {
          en: 'You know all features now! Tap Help anytime.',
          ur: 'آپ سب خصوصیات جان گئے! کسی بھی وقت Help ٹیپ کریں۔'
        },
        position: 'center'
      },
    ],
  },
  '/dashboard-head-teacher': {
    screenName: { en: 'Head Teacher Guide', ur: 'ہیڈ ٹیچر گائیڈ' },
    introduction: {
      en: 'Welcome! Let me show you all features of your dashboard.',
      ur: 'خوش آمدید! آئیں آپ کی تمام خصوصیات دیکھتے ہیں۔'
    },
    steps: [
      {
        title: { en: 'Task Cards', ur: 'کام کارڈز' },
        description: {
          en: 'See pending tasks, completed work, and lesson plans.',
          ur: 'زیر التوا کام، مکمل شدہ اور سبق کے منصوبے دیکھیں۔'
        },
        target: '[data-testid="widget-stats"]',
        position: 'bottom'
      },
      {
        title: { en: 'Staff Overview', ur: 'عملے کا جائزہ' },
        description: {
          en: 'See total, present, and absent teachers.',
          ur: 'کل، موجود اور غیر حاضر اساتذہ دیکھیں۔'
        },
        target: '[data-testid="widget-staff"]',
        position: 'bottom'
      },
      {
        title: { en: 'Manage Teachers Button', ur: 'اساتذہ انتظام بٹن' },
        description: {
          en: 'View and approve teacher registrations.',
          ur: 'اساتذہ کی رجسٹریشن دیکھیں اور منظور کریں۔'
        },
        target: '[data-testid="button-manage-teachers"]',
        position: 'bottom'
      },
      {
        title: { en: 'Edit School Button', ur: 'اسکول ایڈٹ بٹن' },
        description: {
          en: 'Update attendance, infrastructure, inventory.',
          ur: 'حاضری، انفراسٹرکچر، انوینٹری اپ ڈیٹ کریں۔'
        },
        target: '[data-testid="button-edit-school"]',
        position: 'bottom'
      },
      {
        title: { en: 'Data Requests Button', ur: 'ڈیٹا درخواستیں بٹن' },
        description: {
          en: 'Create requests with voice notes.',
          ur: 'وائس نوٹس کے ساتھ درخواستیں بنائیں۔'
        },
        target: '[data-testid="button-data-requests"]',
        position: 'bottom'
      },
      {
        title: { en: 'Leave Calendar Button', ur: 'چھٹی کیلنڈر بٹن' },
        description: {
          en: 'Track teacher leaves.',
          ur: 'اساتذہ کی چھٹیاں ٹریک کریں۔'
        },
        target: '[data-testid="button-view-calendar"], [data-testid="button-view-calendar-mobile"]',
        position: 'bottom'
      },
      {
        title: { en: 'Community Album Button', ur: 'کمیونٹی البم بٹن' },
        description: {
          en: 'View and share photos.',
          ur: 'تصاویر دیکھیں اور شیئر کریں۔'
        },
        target: '[data-testid="button-community-album"]',
        position: 'bottom'
      },
      {
        title: { en: 'Open Menu', ur: 'مینو کھولیں' },
        description: {
          en: 'Now let me show you the menu.',
          ur: 'اب مینو دیکھتے ہیں۔'
        },
        target: '[data-testid="button-open-menu"], [data-testid="button-toggle-menu"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'School Management', ur: 'اسکول انتظام' },
        description: {
          en: 'Manage all school data here.',
          ur: 'یہاں تمام اسکول ڈیٹا منظم کریں۔'
        },
        target: '[data-testid="mobile-button-school-management"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Manage Teachers', ur: 'اساتذہ انتظام' },
        description: {
          en: 'View and manage all teachers.',
          ur: 'تمام اساتذہ دیکھیں اور منظم کریں۔'
        },
        target: '[data-testid="mobile-button-manage-teachers"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Data Requests', ur: 'ڈیٹا درخواستیں' },
        description: {
          en: 'Create and track data requests.',
          ur: 'ڈیٹا درخواستیں بنائیں اور ٹریک کریں۔'
        },
        target: '[data-testid="mobile-button-data-requests"], [data-testid="button-data-requests"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
        description: {
          en: 'Manage staff leave calendar.',
          ur: 'عملے کی چھٹی کیلنڈر منظم کریں۔'
        },
        target: '[data-testid="mobile-button-leave-calendar"], [data-testid="button-view-calendar"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Community Album', ur: 'کمیونٹی البم' },
        description: {
          en: 'View and share school photos.',
          ur: 'اسکول کی تصاویر دیکھیں اور شیئر کریں۔'
        },
        target: '[data-testid="mobile-button-community-album"], [data-testid="button-community-album"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Queries', ur: 'سوالات' },
        description: {
          en: 'Handle staff queries.',
          ur: 'عملے کے سوالات کا جواب دیں۔'
        },
        target: '[data-testid="mobile-button-queries"], [data-testid="button-view-queries"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Lesson Plans', ur: 'سبق کے منصوبے' },
        description: {
          en: 'Review teacher lesson plans.',
          ur: 'اساتذہ کے سبق کے منصوبے دیکھیں۔'
        },
        target: '[data-testid="mobile-button-lesson-plans"], [data-testid="button-lesson-plans"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Help Guide', ur: 'ہیلپ گائیڈ' },
        description: {
          en: 'Open this guide anytime.',
          ur: 'یہ گائیڈ کسی بھی وقت کھولیں۔'
        },
        target: '[data-testid="mobile-button-help-guide"], [data-testid="button-help-guide-sidebar"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'Logout', ur: 'لاگ آؤٹ' },
        description: {
          en: 'Sign out of your account.',
          ur: 'اپنے اکاؤنٹ سے سائن آؤٹ کریں۔'
        },
        target: '[data-testid="mobile-button-logout"], [data-testid="button-logout"]',
        position: 'right',
        openMenu: true
      },
      {
        title: { en: 'All Done!', ur: 'مکمل!' },
        description: {
          en: 'You know all features now! Tap Help anytime.',
          ur: 'آپ سب خصوصیات جان گئے! کسی بھی وقت Help ٹیپ کریں۔'
        },
        position: 'center'
      },
    ],
  },
  '/calendar': {
    screenName: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
    introduction: {
      en: 'Track staff leaves here.',
      ur: 'یہاں عملے کی چھٹیاں ٹریک کریں۔'
    },
    steps: [
      {
        title: { en: 'Navigation', ur: 'نیویگیشن' },
        description: {
          en: 'Use arrows to move between months.',
          ur: 'مہینوں کے درمیان جانے کے لیے تیر استعمال کریں۔'
        },
        target: '[data-testid*="prev"], [data-testid*="next"], .calendar-nav',
        position: 'bottom'
      },
      {
        title: { en: 'Add Leave', ur: 'چھٹی شامل کریں' },
        description: {
          en: 'Tap any date to add a leave.',
          ur: 'چھٹی شامل کرنے کے لیے تاریخ ٹیپ کریں۔'
        },
        target: '.calendar-grid, [data-testid*="calendar"], .grid-cols-7',
        position: 'top'
      },
      {
        title: { en: 'Leave Colors', ur: 'چھٹی کے رنگ' },
        description: {
          en: 'Green=Casual, Blue=Sick, Purple=Earned, Orange=Special.',
          ur: 'سبز=عارضی، نیلا=بیماری، جامنی=کمائی، نارنجی=خصوصی۔'
        },
        target: '.legend, [data-testid*="legend"], [data-testid*="guide"]',
        position: 'top'
      },
    ],
  },
  '/data-requests': {
    screenName: { en: 'Data Requests', ur: 'ڈیٹا درخواستیں' },
    introduction: {
      en: 'View and respond to requests. Use voice notes!',
      ur: 'درخواستیں دیکھیں اور جواب دیں۔ وائس نوٹس استعمال کریں!'
    },
    steps: [
      {
        title: { en: 'Filter', ur: 'فلٹر' },
        description: {
          en: 'Use tabs: All, Pending, Submitted.',
          ur: 'ٹیبز استعمال کریں: سب، زیر التوا، جمع شدہ۔'
        },
        target: '[data-testid*="filter"], .tabs, [role="tablist"]',
        position: 'bottom'
      },
      {
        title: { en: 'Requests', ur: 'درخواستیں' },
        description: {
          en: 'Tap a card to view and respond.',
          ur: 'دیکھنے اور جواب دینے کے لیے کارڈ ٹیپ کریں۔'
        },
        target: '[data-testid*="request-card"], .request-list',
        position: 'bottom'
      },
      {
        title: { en: 'Voice Notes', ur: 'وائس نوٹس' },
        description: {
          en: 'Tap 🎤 to record. Speech converts to text.',
          ur: 'ریکارڈ کرنے کے لیے 🎤 ٹیپ کریں۔ آواز ٹیکسٹ میں بدل جاتی ہے۔'
        },
        target: '[data-testid*="voice-recorder"], [data-testid*="mic"]',
        position: 'bottom'
      },
    ],
  },
  '/school-visits': {
    screenName: { en: 'School Visits', ur: 'اسکول دورے' },
    introduction: {
      en: 'Record your school visits.',
      ur: 'اپنے اسکول کے دوروں کا ریکارڈ رکھیں۔'
    },
    steps: [
      {
        title: { en: 'Visit Type', ur: 'دورے کی قسم' },
        description: {
          en: 'Choose: Monitoring, Mentoring, or Office.',
          ur: 'منتخب کریں: نگرانی، رہنمائی، یا دفتر۔'
        },
        target: '[data-testid*="tab"], [role="tablist"], .tabs',
        position: 'bottom'
      },
      {
        title: { en: 'New Visit', ur: 'نیا دورہ' },
        description: {
          en: 'Tap to start a visit. Arrival time is auto-recorded.',
          ur: 'دورہ شروع کرنے کے لیے ٹیپ کریں۔ آمد کا وقت خودکار ریکارڈ ہوتا ہے۔'
        },
        target: '[data-testid*="new-visit"], [data-testid*="create"], button:contains("New")',
        position: 'bottom'
      },
      {
        title: { en: 'Photos', ur: 'تصاویر' },
        description: {
          en: 'Add photos as evidence of your visit.',
          ur: 'اپنے دورے کے ثبوت کے طور پر تصاویر شامل کریں۔'
        },
        position: 'center'
      },
    ],
  },
  '/profile': {
    screenName: { en: 'Profile', ur: 'پروفائل' },
    introduction: {
      en: 'Your account info and settings.',
      ur: 'آپ کے اکاؤنٹ کی معلومات اور ترتیبات۔'
    },
    steps: [
      {
        title: { en: 'Your Info', ur: 'آپ کی معلومات' },
        description: {
          en: 'View name, role, phone, school.',
          ur: 'نام، کردار، فون، اسکول دیکھیں۔'
        },
        target: '.profile-info, [data-testid*="user-info"]',
        position: 'bottom'
      },
      {
        title: { en: 'Theme', ur: 'تھیم' },
        description: {
          en: 'Switch between light and dark mode.',
          ur: 'لائٹ اور ڈارک موڈ کے درمیان سوئچ کریں۔'
        },
        target: '[data-testid*="theme"], .theme-toggle',
        position: 'bottom'
      },
    ],
  },
  '/school-data': {
    screenName: { en: 'School Info', ur: 'اسکول کی معلومات' },
    introduction: {
      en: 'View and manage school data.',
      ur: 'اسکول کا ڈیٹا دیکھیں اور انتظام کریں۔'
    },
    steps: [
      {
        title: { en: 'School Details', ur: 'اسکول تفصیلات' },
        description: {
          en: 'View EMIS code, name, address.',
          ur: 'EMIS کوڈ، نام، پتہ دیکھیں۔'
        },
        position: 'center'
      },
    ],
  },
  '/queries': {
    screenName: { en: 'Queries', ur: 'سوالات' },
    introduction: {
      en: 'Ask questions to supervisors.',
      ur: 'سپروائزرز سے سوالات پوچھیں۔'
    },
    steps: [
      {
        title: { en: 'Queries', ur: 'سوالات' },
        description: {
          en: 'See pending and resolved queries.',
          ur: 'زیر التوا اور حل شدہ سوالات دیکھیں۔'
        },
        position: 'center'
      },
      {
        title: { en: 'New Query', ur: 'نیا سوال' },
        description: {
          en: 'Tap Create to ask a question.',
          ur: 'سوال پوچھنے کے لیے Create ٹیپ کریں۔'
        },
        target: '[data-testid*="create"], button:contains("Create")',
        position: 'bottom'
      },
    ],
  },
  '/community-album': {
    screenName: { en: 'Community Album', ur: 'کمیونٹی البم' },
    introduction: {
      en: 'Share classroom photos with other schools.',
      ur: 'دوسرے اسکولوں کے ساتھ تصاویر شیئر کریں۔'
    },
    steps: [
      {
        title: { en: 'Feed', ur: 'فیڈ' },
        description: {
          en: 'See posts from all schools.',
          ur: 'تمام اسکولوں کی پوسٹس دیکھیں۔'
        },
        target: '[data-testid="button-view-feed"]',
        position: 'bottom'
      },
      {
        title: { en: 'Create Post', ur: 'پوسٹ بنائیں' },
        description: {
          en: 'Share up to 10 photos with a title.',
          ur: 'عنوان کے ساتھ 10 تصاویر تک شیئر کریں۔'
        },
        target: '[data-testid="button-create-activity"]',
        position: 'bottom'
      },
      {
        title: { en: 'React', ur: 'ری ایکٹ' },
        description: {
          en: 'Like, Love, Clap, or Celebrate posts.',
          ur: 'پوسٹس پر لائک، لو، تالی، یا جشن۔'
        },
        target: '[data-testid^="button-reaction-"]',
        position: 'top'
      },
    ],
  },
  '/user-management': {
    screenName: { en: 'Users', ur: 'صارفین' },
    introduction: {
      en: 'Manage users under you.',
      ur: 'اپنے ماتحت صارفین کا انتظام کریں۔'
    },
    steps: [
      {
        title: { en: 'User List', ur: 'صارف فہرست' },
        description: {
          en: 'View name, role, school, status.',
          ur: 'نام، کردار، اسکول، حیثیت دیکھیں۔'
        },
        position: 'center'
      },
      {
        title: { en: 'Filter', ur: 'فلٹر' },
        description: {
          en: 'Filter by role, school, or area.',
          ur: 'کردار، اسکول یا علاقے کے لحاظ سے فلٹر کریں۔'
        },
        target: '[data-testid*="filter"], .filters',
        position: 'bottom'
      },
    ],
  },
};

const defaultGuide: ScreenGuide = {
  screenName: { en: 'Help Guide', ur: 'مدد گائیڈ' },
  introduction: {
    en: 'Learn how to use this screen and its features.',
    ur: 'اس اسکرین اور اس کی خصوصیات کو استعمال کرنا سیکھیں۔'
  },
  steps: [
    {
      title: { en: 'Navigation', ur: 'نیویگیشن' },
      description: {
        en: 'Use the back button or menu to move between screens. Tap on buttons and cards to access features.',
        ur: 'اسکرینز کے درمیان جانے کے لیے واپس بٹن یا مینو استعمال کریں۔ خصوصیات تک رسائی کے لیے بٹنوں اور کارڈز پر ٹیپ کریں۔'
      },
      position: 'center'
    },
    {
      title: { en: 'Need Help?', ur: 'مدد چاہیے؟' },
      description: {
        en: 'Contact your supervisor or use Queries section to ask questions.',
        ur: 'اپنے سپروائزر سے رابطہ کریں یا سوالات پوچھنے کے لیے سوالات کا سیکشن استعمال کریں۔'
      },
      position: 'center'
    },
  ],
};

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [showIntro, setShowIntro] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleOpenGuide = () => {
      setIsOpen(true);
      setCurrentStep(0);
      setShowIntro(true);
      setIsFirstTimeUser(false); // Manual open is always skippable
    };
    window.addEventListener('openHelpGuide', handleOpenGuide);
    return () => window.removeEventListener('openHelpGuide', handleOpenGuide);
  }, []);

  // Auto-show guide for first-time users (unskippable until completed)
  useEffect(() => {
    if (!user?.id) return;
    
    const guideCompletedKey = `taleemhub_guide_completed_${user.id}`;
    const hasCompletedGuide = localStorage.getItem(guideCompletedKey);
    
    if (!hasCompletedGuide) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setIsOpen(true);
        setCurrentStep(0);
        setShowIntro(true);
        setIsFirstTimeUser(true); // Mark as first-time (unskippable)
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const getGuide = useCallback((): ScreenGuide => {
    // Check for role-specific dashboard guides
    if (location === '/dashboard' || location === '/' || location === '') {
      if (user?.role === 'HEAD_TEACHER') {
        return guides['/dashboard-head-teacher'] || guides['/dashboard'] || defaultGuide;
      }
      return guides['/dashboard'] || defaultGuide;
    }
    if (guides[location]) return guides[location];
    const pathParts = location.split('/');
    if (pathParts[1] === 'request') return guides['/data-requests'] || defaultGuide;
    if (pathParts[1] === 'visit') return guides['/school-visits'] || defaultGuide;
    if (pathParts[1] === 'query') return guides['/queries'] || defaultGuide;
    if (pathParts[1] === 'album') return guides['/school-data'] || defaultGuide;
    if (pathParts[1] === 'collaborative-form') return defaultGuide;
    return defaultGuide;
  }, [location, user?.role]);

  const currentGuide = getGuide();
  const steps = currentGuide.steps;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    setCurrentStep(0);
    setShowIntro(true);
    setTargetRect(null);
  }, [location]);

  // Handle menu open/close for guide steps
  useEffect(() => {
    if (!isOpen || showIntro) {
      // Close menu when guide closes or shows intro
      window.dispatchEvent(new CustomEvent('closeSidebarForGuide'));
      return;
    }

    // Open or close menu based on current step's openMenu property
    if (currentStepData?.openMenu) {
      window.dispatchEvent(new CustomEvent('openSidebarForGuide'));
    } else {
      window.dispatchEvent(new CustomEvent('closeSidebarForGuide'));
    }
  }, [isOpen, showIntro, currentStep, currentStepData?.openMenu]);

  useEffect(() => {
    if (!isOpen || showIntro || !currentStepData?.target) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const selectors = currentStepData.target!.split(',').map(s => s.trim());
      for (const selector of selectors) {
        try {
          // Find all matching elements and pick the visible one
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const rect = element.getBoundingClientRect();
            // Check if element is visible (has dimensions and is in viewport or scrollable area)
            if (rect.width > 0 && rect.height > 0) {
              // Check if element is actually visible (not hidden by CSS)
              const style = window.getComputedStyle(element);
              if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                setTargetRect(rect);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Update rect after scroll
                setTimeout(() => {
                  const newRect = element.getBoundingClientRect();
                  setTargetRect(newRect);
                }, 400);
                return;
              }
            }
          }
        } catch (e) {
          // Invalid selector, skip
        }
      }
      setTargetRect(null);
    };

    const timer = setTimeout(findTarget, 300);
    return () => clearTimeout(timer);
  }, [isOpen, showIntro, currentStep, currentStepData]);

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setShowIntro(true);
  };

  const handleClose = () => {
    // First-time users cannot skip - they must complete the guide
    if (isFirstTimeUser) return;
    setIsOpen(false);
    setTargetRect(null);
    // Close menu when guide closes
    window.dispatchEvent(new CustomEvent('closeSidebarForGuide'));
  };

  const handleComplete = () => {
    // Mark guide as completed for this user
    if (user?.id) {
      const guideCompletedKey = `taleemhub_guide_completed_${user.id}`;
      localStorage.setItem(guideCompletedKey, 'true');
    }
    setIsFirstTimeUser(false);
    setIsOpen(false);
    setTargetRect(null);
    // Close menu when guide completes
    window.dispatchEvent(new CustomEvent('closeSidebarForGuide'));
  };

  const startGuide = () => {
    setShowIntro(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step - complete the guide
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowIntro(true);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  const hideOnPages = ['/', '/signup'];
  const shouldHideButton = hideOnPages.includes(location);

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const pos = currentStepData?.position || 'bottom';
    const padding = 16;
    
    switch (pos) {
      case 'top':
        return {
          bottom: `${window.innerHeight - targetRect.top + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2, window.innerWidth - 200))}px`,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2, window.innerWidth - 200))}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          right: `${window.innerWidth - targetRect.left + padding}px`,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  const ArrowIcon = () => {
    if (!targetRect) return null;
    const pos = currentStepData?.position || 'bottom';
    switch (pos) {
      case 'top': return <ArrowDown className="w-6 h-6 animate-bounce" />;
      case 'bottom': return <ArrowUp className="w-6 h-6 animate-bounce" />;
      case 'left': return <ArrowRight className="w-6 h-6 animate-bounce" />;
      case 'right': return <ArrowLeft className="w-6 h-6 animate-bounce" />;
      default: return null;
    }
  };

  return (
    <>
      {!shouldHideButton && (
        <button
          onClick={handleOpen}
          className="fixed bottom-24 right-4 z-[60] w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 animate-pulse ring-4 ring-blue-300/50"
          aria-label="Open Help Guide"
          data-testid="button-help-guide"
        >
          <HelpCircle className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <>
          {/* Spotlight overlay with highlighted element */}
          {targetRect && !showIntro && (
            <>
              {/* Dark overlay background */}
              <div 
                className="fixed inset-0 z-[69] bg-black/70"
                style={{
                  clipPath: `polygon(
                    0% 0%, 
                    0% 100%, 
                    ${targetRect.left - 12}px 100%, 
                    ${targetRect.left - 12}px ${targetRect.top - 12}px, 
                    ${targetRect.left + targetRect.width + 12}px ${targetRect.top - 12}px, 
                    ${targetRect.left + targetRect.width + 12}px ${targetRect.top + targetRect.height + 12}px, 
                    ${targetRect.left - 12}px ${targetRect.top + targetRect.height + 12}px, 
                    ${targetRect.left - 12}px 100%, 
                    100% 100%, 
                    100% 0%
                  )`
                }}
              />
              {/* Highlight border around target */}
              <div
                className="fixed z-[69] border-4 border-blue-500 rounded-xl pointer-events-none shadow-[0_0_0_4px_rgba(59,130,246,0.5),0_0_30px_rgba(59,130,246,0.8)]"
                style={{
                  left: targetRect.left - 12,
                  top: targetRect.top - 12,
                  width: targetRect.width + 24,
                  height: targetRect.height + 24,
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                {/* Pulsing glow effect */}
                <div className="absolute inset-0 rounded-xl border-4 border-blue-400 animate-ping opacity-50" />
              </div>
            </>
          )}

          {/* Dark overlay for intro or when no target */}
          {(showIntro || !targetRect) && (
            <div 
              className="fixed inset-0 z-[69] bg-black/50 backdrop-blur-sm" 
              onClick={isFirstTimeUser ? undefined : handleClose}
            />
          )}

          {/* Guide panel */}
          <div
            className="fixed z-[70] w-[calc(100%-32px)] max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[80vh] overflow-y-auto"
            style={{ bottom: '16px', left: '50%', transform: 'translateX(-50%)' }}
            dir={language === 'ur' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {currentGuide.screenName[language]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs font-medium transition-colors"
                    data-testid="button-toggle-language"
                  >
                    <Languages className="w-3 h-3" />
                    {language === 'en' ? 'اردو' : 'EN'}
                  </button>
                  {!isFirstTimeUser && (
                    <button
                      onClick={handleClose}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Close"
                      data-testid="button-close-help"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {showIntro ? (
                <div className="text-center py-2">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {language === 'en' ? 'Welcome!' : 'خوش آمدید!'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {currentGuide.introduction[language]}
                  </p>
                  {isFirstTimeUser && (
                    <div className="mb-4 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {language === 'en' 
                          ? '⚠️ Please complete this quick tour to learn how to use the app. It only takes a minute!'
                          : '⚠️ براہ کرم ایپ استعمال کرنا سیکھنے کے لیے یہ فوری ٹور مکمل کریں۔ صرف ایک منٹ لگے گا!'}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={startGuide}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="sm"
                  >
                    {language === 'en' ? `Start Tour (${steps.length} steps)` : `ٹور شروع کریں (${steps.length} مراحل)`}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Arrow indicator */}
                  {targetRect && (
                    <div className="flex justify-center text-blue-500 mb-2">
                      <ArrowIcon />
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {currentStep + 1}
                      </span>
                      <h3 className="font-bold text-sm text-foreground leading-tight">
                        {currentStepData?.title[language]}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                      {currentStepData?.description[language]}
                    </p>
                    {currentStepData?.tip && (
                      <div className="ml-8 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <span className="font-semibold">💡 </span>
                          {currentStepData.tip[language]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-1 mb-3">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentStep(idx)}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          idx === currentStep 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                            : idx < currentStep 
                              ? 'bg-blue-300 dark:bg-blue-700' 
                              : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={prevStep} className="gap-1 text-xs h-8">
                      <ChevronLeft className="w-3 h-3" />
                      {language === 'en' ? 'Back' : 'واپس'}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentStep + 1}/{steps.length}
                    </span>
                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="gap-1 text-xs h-8 bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      {currentStep === steps.length - 1 
                        ? (language === 'en' ? 'Done' : 'مکمل') 
                        : (language === 'en' ? 'Next' : 'اگلا')}
                      {currentStep < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
