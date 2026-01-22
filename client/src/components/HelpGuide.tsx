import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Languages, BookOpen, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

type Language = 'en' | 'ur';

interface GuideStep {
  title: { en: string; ur: string };
  description: { en: string; ur: string };
  tip?: { en: string; ur: string };
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ScreenGuide {
  screenName: { en: string; ur: string };
  introduction: { en: string; ur: string };
  steps: GuideStep[];
}

const guides: Record<string, ScreenGuide> = {
  '/dashboard': {
    screenName: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
    introduction: {
      en: 'Welcome to your Dashboard! This is your control center where you can access all TaleemHub features. Let me show you each feature step by step.',
      ur: 'اپنے ڈیش بورڈ میں خوش آمدید! یہ آپ کا کنٹرول سینٹر ہے۔ آئیں میں آپ کو ہر خصوصیت قدم بہ قدم دکھاتا ہوں۔'
    },
    steps: [
      {
        title: { en: 'Your Profile Section', ur: 'آپ کا پروفائل سیکشن' },
        description: {
          en: 'This shows your name and role. Tap here to go to your profile where you can: Update personal information, Add or change your profile picture, View your assigned school details.',
          ur: 'یہ آپ کا نام اور کردار دکھاتا ہے۔ اپنے پروفائل پر جانے کے لیے یہاں ٹیپ کریں جہاں آپ: ذاتی معلومات اپڈیٹ کر سکتے ہیں، پروفائل تصویر شامل یا تبدیل کر سکتے ہیں، اپنے اسکول کی تفصیلات دیکھ سکتے ہیں۔'
        },
        tip: {
          en: 'Add a profile picture to personalize your account!',
          ur: 'اپنے اکاؤنٹ کو ذاتی بنانے کے لیے پروفائل تصویر شامل کریں!'
        },
        target: '[data-testid="user-profile-section"]',
        position: 'right'
      },
      {
        title: { en: 'Task & Stats Cards', ur: 'کام اور اعدادوشمار کارڈز' },
        description: {
          en: 'These cards show your task overview: My Tasks (pending work), Completed (finished tasks), and Lesson Plans (coming soon). Tap any card to learn more!',
          ur: 'یہ کارڈز آپ کے کام کا جائزہ دکھاتے ہیں: میرے کام (زیر التوا کام)، مکمل (ختم شدہ کام)، اور سبق کے منصوبے (جلد آ رہے ہیں)۔ مزید جاننے کے لیے کسی بھی کارڈ پر ٹیپ کریں!'
        },
        tip: {
          en: 'These features are coming soon!',
          ur: 'یہ خصوصیات جلد آ رہی ہیں!'
        },
        target: '[data-testid="widget-stats"]',
        position: 'bottom'
      },
      {
        title: { en: 'Today\'s Inspiration Quote', ur: 'آج کا حوصلہ افزا اقتباس' },
        description: {
          en: 'Every time you visit the dashboard, you see a new inspiring quote about teaching. These motivational quotes change randomly to keep you inspired!',
          ur: 'جب بھی آپ ڈیش بورڈ دیکھتے ہیں، آپ کو تدریس کے بارے میں ایک نیا حوصلہ افزا اقتباس نظر آتا ہے۔ یہ اقتباسات تصادفی طور پر بدلتے ہیں!'
        },
        tip: {
          en: 'Refresh the page to see a new quote!',
          ur: 'نیا اقتباس دیکھنے کے لیے صفحہ ریفریش کریں!'
        },
        target: '[data-testid="widget-quote"]',
        position: 'top'
      },
      {
        title: { en: 'Teaching Tips Section', ur: 'تدریسی تجاویز سیکشن' },
        description: {
          en: 'Get 3 random teaching tips every time you visit! These tips help you improve your classroom teaching with practical advice and techniques.',
          ur: 'ہر بار جب آپ آئیں تو 3 تصادفی تدریسی تجاویز حاصل کریں! یہ تجاویز آپ کو عملی مشورے اور تکنیکوں کے ساتھ اپنی کلاس روم تدریس بہتر بنانے میں مدد کرتی ہیں۔'
        },
        tip: {
          en: 'Tips change on every page refresh!',
          ur: 'ہر صفحہ ریفریش پر تجاویز بدل جاتی ہیں!'
        },
        target: '[data-testid="widget-tips"]',
        position: 'top'
      },
      {
        title: { en: 'Leave Calendar Button', ur: 'چھٹی کیلنڈر بٹن' },
        description: {
          en: 'Tap here to open the Leave Calendar. You can: View all your approved leaves, Apply for new leave by tapping any date, See different leave types (Casual, Sick, Earned, Special). All leaves are automatically approved!',
          ur: 'چھٹی کیلنڈر کھولنے کے لیے یہاں ٹیپ کریں۔ آپ: اپنی تمام منظور شدہ چھٹیاں دیکھ سکتے ہیں، کسی بھی تاریخ پر ٹیپ کرکے نئی چھٹی کے لیے درخواست دے سکتے ہیں، مختلف قسم کی چھٹیاں دیکھ سکتے ہیں۔ تمام چھٹیاں خودکار طور پر منظور ہو جاتی ہیں!'
        },
        tip: {
          en: 'All leaves are auto-approved - no waiting!',
          ur: 'تمام چھٹیاں خودکار منظور - کوئی انتظار نہیں!'
        },
        target: '[data-testid="button-view-calendar"]',
        position: 'right'
      },
      {
        title: { en: 'Community Album Button', ur: 'کمیونٹی البم بٹن' },
        description: {
          en: 'Tap here to view the Community Album! Here you can: See photos and activities from ALL schools, Post your own classroom activities with photos, Like and comment on other teachers\' posts, Share your teaching achievements with the community.',
          ur: 'کمیونٹی البم دیکھنے کے لیے یہاں ٹیپ کریں! یہاں آپ: تمام اسکولوں کی تصاویر اور سرگرمیاں دیکھ سکتے ہیں، اپنی کلاس روم سرگرمیاں تصاویر کے ساتھ پوسٹ کر سکتے ہیں، دوسرے اساتذہ کی پوسٹس کو لائک اور کمنٹ کر سکتے ہیں۔'
        },
        tip: {
          en: 'Share your best classroom moments with everyone!',
          ur: 'اپنے بہترین کلاس روم لمحات سب کے ساتھ شیئر کریں!'
        },
        target: '[data-testid="button-community-album"]',
        position: 'right'
      },
      {
        title: { en: 'Queries Button', ur: 'سوالات بٹن' },
        description: {
          en: 'Tap here to submit queries or questions to your supervisors. You can: Ask questions about policies or procedures, Report issues or concerns, Get responses from Head Teacher or AEO.',
          ur: 'اپنے سپروائزرز کو سوالات یا استفسارات بھیجنے کے لیے یہاں ٹیپ کریں۔ آپ: پالیسیوں یا طریقہ کار کے بارے میں سوالات پوچھ سکتے ہیں، مسائل یا خدشات رپورٹ کر سکتے ہیں، ہیڈ ٹیچر یا AEO سے جوابات حاصل کر سکتے ہیں۔'
        },
        target: '[data-testid="button-view-queries"]',
        position: 'right'
      },
      {
        title: { en: 'Theme Toggle (Light/Dark Mode)', ur: 'تھیم ٹوگل (لائٹ/ڈارک موڈ)' },
        description: {
          en: 'Tap this button to switch between light and dark mode. Dark mode is easier on the eyes at night and saves battery on some devices.',
          ur: 'لائٹ اور ڈارک موڈ کے درمیان سوئچ کرنے کے لیے یہ بٹن ٹیپ کریں۔ ڈارک موڈ رات میں آنکھوں کے لیے آسان ہے اور کچھ ڈیوائسز پر بیٹری بچاتا ہے۔'
        },
        target: '[data-testid="button-theme-toggle"]',
        position: 'left'
      },
      {
        title: { en: 'Notifications Bell', ur: 'نوٹیفیکیشن گھنٹی' },
        description: {
          en: 'Tap the bell icon to see your notifications. You will be notified when: Someone reacts to your Community Album posts, You receive new tasks or requests, Important announcements are made.',
          ur: 'اپنی نوٹیفیکیشنز دیکھنے کے لیے گھنٹی کا آئیکن ٹیپ کریں۔ آپ کو مطلع کیا جائے گا جب: کوئی آپ کی کمیونٹی البم پوسٹس پر ری ایکٹ کرے، آپ کو نئے کام یا درخواستیں ملیں، اہم اعلانات کیے جائیں۔'
        },
        target: '[data-testid="button-notifications"]',
        position: 'left'
      },
      {
        title: { en: 'Logout Button', ur: 'لاگ آؤٹ بٹن' },
        description: {
          en: 'Tap here to safely logout from your account. Always logout when using a shared device to keep your account secure.',
          ur: 'اپنے اکاؤنٹ سے محفوظ طریقے سے لاگ آؤٹ کرنے کے لیے یہاں ٹیپ کریں۔ مشترکہ ڈیوائس استعمال کرتے وقت ہمیشہ لاگ آؤٹ کریں تاکہ آپ کا اکاؤنٹ محفوظ رہے۔'
        },
        target: '[data-testid="button-logout"]',
        position: 'right'
      },
    ],
  },
  '/calendar': {
    screenName: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
    introduction: {
      en: 'The Leave Calendar helps you track staff absences. All leaves are automatically approved.',
      ur: 'چھٹی کیلنڈر آپ کو عملے کی غیر حاضریوں کو ٹریک کرنے میں مدد کرتا ہے۔ تمام چھٹیاں خودکار طور پر منظور ہو جاتی ہیں۔'
    },
    steps: [
      {
        title: { en: 'Month Navigation', ur: 'مہینے کی نیویگیشن' },
        description: {
          en: 'Use these arrow buttons to move between months. The left arrow goes to the previous month, and the right arrow goes to the next month.',
          ur: 'مہینوں کے درمیان جانے کے لیے ان تیر کے بٹنوں کا استعمال کریں۔ بائیں تیر پچھلے مہینے پر جاتا ہے اور دائیں تیر اگلے مہینے پر۔'
        },
        target: '[data-testid*="prev"], [data-testid*="next"], .calendar-nav',
        position: 'bottom'
      },
      {
        title: { en: 'Calendar Grid - Tap to Add Leave', ur: 'کیلنڈر گرڈ - چھٹی شامل کرنے کے لیے ٹیپ کریں' },
        description: {
          en: 'TAP ON ANY DATE to add a new leave! A form will appear where you select the teacher, leave type, and dates. Colored dots show existing leaves.',
          ur: 'نئی چھٹی شامل کرنے کے لیے کسی بھی تاریخ پر ٹیپ کریں! ایک فارم ظاہر ہوگا جہاں آپ استاد، چھٹی کی قسم اور تاریخیں منتخب کریں۔ رنگین نقطے موجودہ چھٹیاں دکھاتے ہیں۔'
        },
        tip: {
          en: 'Just tap a date - no button needed!',
          ur: 'بس تاریخ پر ٹیپ کریں - کسی بٹن کی ضرورت نہیں!'
        },
        target: '.calendar-grid, [data-testid*="calendar"], .grid-cols-7',
        position: 'top'
      },
      {
        title: { en: 'Leave Types & Colors', ur: 'چھٹی کی اقسام اور رنگ' },
        description: {
          en: 'GREEN = Casual Leave (عارضی), BLUE = Sick Leave (بیماری), PURPLE = Earned Leave (کمائی ہوئی), ORANGE = Special Leave (خصوصی). Look for the colored dots on dates.',
          ur: 'سبز = عارضی چھٹی، نیلا = بیماری کی چھٹی، جامنی = کمائی ہوئی چھٹی، نارنجی = خصوصی چھٹی۔ تاریخوں پر رنگین نقطے تلاش کریں۔'
        },
        target: '.legend, [data-testid*="legend"], [data-testid*="guide"]',
        position: 'top'
      },
      {
        title: { en: 'View Leave Details', ur: 'چھٹی کی تفصیلات دیکھیں' },
        description: {
          en: 'Tap on any date with a colored dot to see who is on leave that day, the leave type, and any notes that were added.',
          ur: 'رنگین نقطے والی کسی بھی تاریخ پر ٹیپ کریں تاکہ دیکھ سکیں کہ اس دن کون چھٹی پر ہے، چھٹی کی قسم اور کوئی نوٹ جو شامل کیے گئے تھے۔'
        },
        position: 'center'
      },
    ],
  },
  '/data-requests': {
    screenName: { en: 'Data Requests', ur: 'ڈیٹا کی درخواستیں' },
    introduction: {
      en: 'View and respond to data collection requests from your supervisors.',
      ur: 'اپنے سپروائزرز کی طرف سے ڈیٹا جمع کرنے کی درخواستیں دیکھیں اور ان کا جواب دیں۔'
    },
    steps: [
      {
        title: { en: 'Filter Tabs', ur: 'فلٹر ٹیبز' },
        description: {
          en: 'Use these tabs to filter: ALL shows everything, PENDING shows requests you haven\'t submitted yet, SUBMITTED shows completed ones.',
          ur: 'فلٹر کرنے کے لیے یہ ٹیبز استعمال کریں: سب کچھ دکھاتا ہے، زیر التوا وہ درخواستیں دکھاتا ہے جو آپ نے ابھی تک جمع نہیں کرائیں، جمع شدہ مکمل شدہ دکھاتا ہے۔'
        },
        target: '[data-testid*="filter"], .tabs, [role="tablist"]',
        position: 'bottom'
      },
      {
        title: { en: 'Request Cards', ur: 'درخواست کارڈز' },
        description: {
          en: 'Each card shows a request with its title, sender, deadline, and status. Tap a card to open it and submit your response.',
          ur: 'ہر کارڈ ایک درخواست دکھاتا ہے جس میں عنوان، بھیجنے والا، آخری تاریخ اور حیثیت ہوتی ہے۔ اسے کھولنے اور اپنا جواب جمع کرنے کے لیے کارڈ پر ٹیپ کریں۔'
        },
        tip: {
          en: 'Check deadlines! Submit before time expires.',
          ur: 'آخری تاریخیں چیک کریں! وقت ختم ہونے سے پہلے جمع کریں۔'
        },
        target: '[data-testid*="request-card"], .request-list',
        position: 'bottom'
      },
      {
        title: { en: 'Submitting a Response', ur: 'جواب جمع کرانا' },
        description: {
          en: 'After tapping a request, fill in all required fields carefully. Upload any needed files or photos. Tap "Submit" when done - you cannot change it after!',
          ur: 'درخواست پر ٹیپ کرنے کے بعد تمام مطلوبہ خانے احتیاط سے پُر کریں۔ کوئی بھی ضروری فائلیں یا تصاویر اپ لوڈ کریں۔ مکمل ہونے پر "جمع کریں" پر ٹیپ کریں - بعد میں تبدیل نہیں ہو سکتا!'
        },
        position: 'center'
      },
    ],
  },
  '/school-visits': {
    screenName: { en: 'School Visits', ur: 'اسکول دورے' },
    introduction: {
      en: 'Record and track your school visits for monitoring, mentoring, and office activities.',
      ur: 'نگرانی، رہنمائی اور دفتری سرگرمیوں کے لیے اپنے اسکول کے دوروں کا ریکارڈ رکھیں۔'
    },
    steps: [
      {
        title: { en: 'Visit Type Tabs', ur: 'دورے کی قسم کے ٹیبز' },
        description: {
          en: 'Choose the type of visit: MONITORING (school inspections), MENTORING (teacher coaching), OFFICE (administrative work). Each has different forms.',
          ur: 'دورے کی قسم منتخب کریں: نگرانی (اسکول معائنہ)، رہنمائی (اساتذہ کی کوچنگ)، دفتر (انتظامی کام)۔ ہر ایک کے مختلف فارمز ہیں۔'
        },
        target: '[data-testid*="tab"], [role="tablist"], .tabs',
        position: 'bottom'
      },
      {
        title: { en: 'New Visit Button', ur: 'نیا دورہ بٹن' },
        description: {
          en: 'Tap "New Visit" to start recording a visit. Select the school, and the system will record your arrival time automatically.',
          ur: 'دورہ ریکارڈ کرنا شروع کرنے کے لیے "نیا دورہ" پر ٹیپ کریں۔ اسکول منتخب کریں اور سسٹم خودکار طور پر آپ کے پہنچنے کا وقت ریکارڈ کرے گا۔'
        },
        target: '[data-testid*="new-visit"], [data-testid*="create"], button:contains("New")',
        position: 'bottom'
      },
      {
        title: { en: 'Add Photos as Evidence', ur: 'ثبوت کے طور پر تصاویر شامل کریں' },
        description: {
          en: 'During your visit, tap "Add Photo" to capture evidence. Take clear photos of classrooms, facilities, and any issues you find.',
          ur: 'اپنے دورے کے دوران ثبوت حاصل کرنے کے لیے "تصویر شامل کریں" پر ٹیپ کریں۔ کلاس رومز، سہولیات اور کسی بھی مسئلے کی واضح تصاویر لیں۔'
        },
        tip: {
          en: 'Photos help verify your visit!',
          ur: 'تصاویر آپ کے دورے کی تصدیق کرتی ہیں!'
        },
        position: 'center'
      },
      {
        title: { en: 'Submit Your Visit', ur: 'اپنا دورہ جمع کریں' },
        description: {
          en: 'Fill all required fields, record your departure time, and tap "Submit". Once submitted, your supervisor can see the visit report.',
          ur: 'تمام مطلوبہ خانے پُر کریں، اپنے جانے کا وقت ریکارڈ کریں اور "جمع کریں" پر ٹیپ کریں۔ جمع کرنے کے بعد آپ کا سپروائزر دورے کی رپورٹ دیکھ سکتا ہے۔'
        },
        position: 'center'
      },
    ],
  },
  '/profile': {
    screenName: { en: 'Your Profile', ur: 'آپ کا پروفائل' },
    introduction: {
      en: 'View your account information and manage app settings.',
      ur: 'اپنے اکاؤنٹ کی معلومات دیکھیں اور ایپ کی ترتیبات کا انتظام کریں۔'
    },
    steps: [
      {
        title: { en: 'Your Information', ur: 'آپ کی معلومات' },
        description: {
          en: 'Here you can see your name, role, phone number, and assigned school. This info is from your registration.',
          ur: 'یہاں آپ اپنا نام، کردار، فون نمبر اور تفویض کردہ اسکول دیکھ سکتے ہیں۔ یہ معلومات آپ کی رجسٹریشن سے ہے۔'
        },
        target: '.profile-info, [data-testid*="user-info"]',
        position: 'bottom'
      },
      {
        title: { en: 'Theme Toggle', ur: 'تھیم ٹوگل' },
        description: {
          en: 'Switch between Light Mode (bright) and Dark Mode (dark background). Dark mode is easier on eyes at night.',
          ur: 'لائٹ موڈ (روشن) اور ڈارک موڈ (گہرا پس منظر) کے درمیان سوئچ کریں۔ رات کو ڈارک موڈ آنکھوں کے لیے آسان ہے۔'
        },
        target: '[data-testid*="theme"], .theme-toggle',
        position: 'bottom'
      },
      {
        title: { en: 'Logout Button', ur: 'لاگ آؤٹ بٹن' },
        description: {
          en: 'Tap "Logout" to sign out. Always logout when using a shared or borrowed device for security.',
          ur: 'سائن آؤٹ کرنے کے لیے "لاگ آؤٹ" پر ٹیپ کریں۔ سیکیورٹی کے لیے مشترکہ یا ادھار لی گئی ڈیوائس پر ہمیشہ لاگ آؤٹ کریں۔'
        },
        tip: {
          en: 'Always logout on shared devices!',
          ur: 'مشترکہ ڈیوائسز پر ہمیشہ لاگ آؤٹ کریں!'
        },
        target: '[data-testid*="logout"], button:contains("Logout")',
        position: 'top'
      },
    ],
  },
  '/school-data': {
    screenName: { en: 'School Information', ur: 'اسکول کی معلومات' },
    introduction: {
      en: 'View and manage your school\'s information, inventory, and statistics.',
      ur: 'اپنے اسکول کی معلومات، انوینٹری اور اعداد و شمار دیکھیں اور ان کا انتظام کریں۔'
    },
    steps: [
      {
        title: { en: 'School Profile', ur: 'اسکول کا پروفائل' },
        description: {
          en: 'View EMIS code, school name, address, and contact details from official records.',
          ur: 'سرکاری ریکارڈ سے EMIS کوڈ، اسکول کا نام، پتہ اور رابطے کی تفصیلات دیکھیں۔'
        },
        position: 'center'
      },
      {
        title: { en: 'Staff & Student Count', ur: 'عملہ اور طالب علم کی تعداد' },
        description: {
          en: 'See current teacher count and student enrollment numbers at your school.',
          ur: 'اپنے اسکول میں موجودہ اساتذہ کی تعداد اور طلباء کے داخلے کی تعداد دیکھیں۔'
        },
        position: 'center'
      },
      {
        title: { en: 'Edit School Data', ur: 'اسکول کا ڈیٹا ایڈٹ کریں' },
        description: {
          en: 'If you have permission, tap "Edit" to update school information. Changes may need supervisor approval.',
          ur: 'اگر آپ کے پاس اجازت ہے تو اسکول کی معلومات اپ ڈیٹ کرنے کے لیے "ایڈٹ" پر ٹیپ کریں۔ تبدیلیوں کو سپروائزر کی منظوری درکار ہو سکتی ہے۔'
        },
        target: '[data-testid*="edit"], button:contains("Edit")',
        position: 'bottom'
      },
    ],
  },
  '/queries': {
    screenName: { en: 'Queries', ur: 'سوالات' },
    introduction: {
      en: 'Submit questions and track responses from your supervisors.',
      ur: 'سوالات جمع کریں اور اپنے سپروائزرز کے جوابات کو ٹریک کریں۔'
    },
    steps: [
      {
        title: { en: 'Your Queries', ur: 'آپ کے سوالات' },
        description: {
          en: 'See all your submitted queries. "Pending" means waiting for response. "Resolved" means answered.',
          ur: 'اپنے تمام جمع کرائے گئے سوالات دیکھیں۔ "زیر التوا" کا مطلب جواب کا انتظار۔ "حل شدہ" کا مطلب جواب دے دیا گیا۔'
        },
        position: 'center'
      },
      {
        title: { en: 'Create New Query', ur: 'نیا سوال بنائیں' },
        description: {
          en: 'Tap "Create Query" to ask a new question. Describe your problem clearly so your supervisor can help.',
          ur: 'نیا سوال پوچھنے کے لیے "سوال بنائیں" پر ٹیپ کریں۔ اپنے مسئلے کو واضح طور پر بیان کریں تاکہ آپ کا سپروائزر مدد کر سکے۔'
        },
        target: '[data-testid*="create"], button:contains("Create")',
        position: 'bottom'
      },
    ],
  },
  '/community-album': {
    screenName: { en: 'Community Album', ur: 'کمیونٹی البم' },
    introduction: {
      en: 'Welcome to the Community Album! This is where teachers from ALL schools share their classroom activities, achievements, and memorable moments. Let me show you how to use it!',
      ur: 'کمیونٹی البم میں خوش آمدید! یہاں تمام اسکولوں کے اساتذہ اپنی کلاس روم سرگرمیاں، کامیابیاں اور یادگار لمحات شیئر کرتے ہیں۔ آئیں میں آپ کو دکھاتا ہوں کہ اسے کیسے استعمال کریں!'
    },
    steps: [
      {
        title: { en: 'Feed & Albums Tabs', ur: 'فیڈ اور البمز ٹیبز' },
        description: {
          en: 'Switch between Feed (all posts) and Albums (organized by school). Feed shows recent activities from all schools. Albums lets you browse by school.',
          ur: 'فیڈ (تمام پوسٹس) اور البمز (اسکول کے لحاظ سے منظم) کے درمیان سوئچ کریں۔ فیڈ تمام اسکولوں کی حالیہ سرگرمیاں دکھاتی ہے۔ البمز آپ کو اسکول کے لحاظ سے براؤز کرنے دیتے ہیں۔'
        },
        tip: {
          en: 'You can see what other schools are doing for inspiration!',
          ur: 'آپ دوسرے اسکولوں کی سرگرمیاں دیکھ کر تحریک حاصل کر سکتے ہیں!'
        },
        target: '[data-testid="button-view-feed"]',
        position: 'bottom'
      },
      {
        title: { en: 'Create New Post Button', ur: 'نئی پوسٹ بنائیں بٹن' },
        description: {
          en: 'Tap this button to share your classroom activity! You can: Add up to 10 photos at once, Write a title and description, Share achievements, events, or daily activities.',
          ur: 'اپنی کلاس روم سرگرمی شیئر کرنے کے لیے یہ بٹن ٹیپ کریں! آپ: ایک وقت میں 10 تصاویر تک شامل کر سکتے ہیں، عنوان اور تفصیل لکھ سکتے ہیں، کامیابیاں، تقریبات یا روزانہ کی سرگرمیاں شیئر کر سکتے ہیں۔'
        },
        tip: {
          en: 'Maximum 10 photos per post!',
          ur: 'ہر پوسٹ میں زیادہ سے زیادہ 10 تصاویر!'
        },
        target: '[data-testid="button-create-activity"]',
        position: 'bottom'
      },
      {
        title: { en: 'React to Posts', ur: 'پوسٹس پر ری ایکٹ کریں' },
        description: {
          en: 'Show appreciation by reacting to posts! Tap the reaction button to: Like, Love, Clap, or Celebrate someone\'s work. The poster will be notified when you react!',
          ur: 'پوسٹس پر ری ایکٹ کرکے تعریف ظاہر کریں! ری ایکشن بٹن ٹیپ کریں: لائک، لو، تالی یا جشن منائیں۔ جب آپ ری ایکٹ کریں گے تو پوسٹ کرنے والے کو مطلع کیا جائے گا!'
        },
        tip: {
          en: 'Reactions notify the teacher who posted!',
          ur: 'ری ایکشنز پوسٹ کرنے والے استاد کو مطلع کرتے ہیں!'
        },
        target: '[data-testid^="button-reaction-"]',
        position: 'top'
      },
      {
        title: { en: 'Add Comments', ur: 'تبصرے شامل کریں' },
        description: {
          en: 'Type in the comment box to add a comment. Share your thoughts, ask questions, or appreciate the activity. Comments help build community!',
          ur: 'تبصرہ شامل کرنے کے لیے تبصرے کے باکس میں ٹائپ کریں۔ اپنے خیالات شیئر کریں، سوالات پوچھیں یا سرگرمی کی تعریف کریں۔ تبصرے کمیونٹی بنانے میں مدد کرتے ہیں!'
        },
        target: '[data-testid^="input-comment-"]',
        position: 'top'
      },
      {
        title: { en: 'Post Menu (Delete/Manage)', ur: 'پوسٹ مینو (حذف/انتظام)' },
        description: {
          en: 'Tap the three dots menu on your posts to delete them. Teachers can delete their own posts. Head Teachers can delete posts from their school.',
          ur: 'اپنی پوسٹس حذف کرنے کے لیے تین نقطوں کے مینو پر ٹیپ کریں۔ اساتذہ اپنی پوسٹس حذف کر سکتے ہیں۔ ہیڈ ٹیچرز اپنے اسکول کی پوسٹس حذف کر سکتے ہیں۔'
        },
        tip: {
          en: 'Only you can delete your posts!',
          ur: 'صرف آپ اپنی پوسٹس حذف کر سکتے ہیں!'
        },
        target: '[data-testid^="button-menu-"]',
        position: 'left'
      },
      {
        title: { en: 'Download Photos', ur: 'تصاویر ڈاؤن لوڈ کریں' },
        description: {
          en: 'You can download individual photos or all photos from a post. Tap the download button on any photo to save it to your device.',
          ur: 'آپ انفرادی تصاویر یا پوسٹ کی تمام تصاویر ڈاؤن لوڈ کر سکتے ہیں۔ کسی بھی تصویر کو اپنے ڈیوائس میں محفوظ کرنے کے لیے ڈاؤن لوڈ بٹن پر ٹیپ کریں۔'
        },
        target: '[data-testid="button-download-png"]',
        position: 'top'
      },
      {
        title: { en: 'Back to Dashboard', ur: 'ڈیش بورڈ پر واپس' },
        description: {
          en: 'Tap the back arrow at the top to return to your Dashboard.',
          ur: 'اپنے ڈیش بورڈ پر واپس جانے کے لیے اوپر والے بیک ایرو پر ٹیپ کریں۔'
        },
        target: '[data-testid="button-back"]',
        position: 'right'
      },
    ],
  },
  '/user-management': {
    screenName: { en: 'User Management', ur: 'صارف کا انتظام' },
    introduction: {
      en: 'View and manage users under your supervision.',
      ur: 'اپنی نگرانی میں صارفین کو دیکھیں اور ان کا انتظام کریں۔'
    },
    steps: [
      {
        title: { en: 'User List', ur: 'صارف کی فہرست' },
        description: {
          en: 'See all users in your area. The list shows name, role, school, and account status.',
          ur: 'اپنے علاقے کے تمام صارفین دیکھیں۔ فہرست نام، کردار، اسکول اور اکاؤنٹ کی حیثیت دکھاتی ہے۔'
        },
        position: 'center'
      },
      {
        title: { en: 'Filter Users', ur: 'صارفین فلٹر کریں' },
        description: {
          en: 'Use filters to find users by role, school, or district. This helps quickly find who you need.',
          ur: 'کردار، اسکول یا ضلع کے لحاظ سے صارفین تلاش کرنے کے لیے فلٹرز استعمال کریں۔ یہ جلدی تلاش کرنے میں مدد کرتا ہے۔'
        },
        target: '[data-testid*="filter"], .filters',
        position: 'bottom'
      },
      {
        title: { en: 'View User Profile', ur: 'صارف کا پروفائل دیکھیں' },
        description: {
          en: 'Tap any user to see their complete profile, contact info, and activity history.',
          ur: 'ان کا مکمل پروفائل، رابطے کی معلومات اور سرگرمی کی تاریخ دیکھنے کے لیے کسی بھی صارف پر ٹیپ کریں۔'
        },
        position: 'center'
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [location] = useLocation();

  const getGuide = useCallback((): ScreenGuide => {
    if (guides[location]) return guides[location];
    const pathParts = location.split('/');
    if (pathParts[1] === 'request') return guides['/data-requests'] || defaultGuide;
    if (pathParts[1] === 'visit') return guides['/school-visits'] || defaultGuide;
    if (pathParts[1] === 'query') return guides['/queries'] || defaultGuide;
    if (pathParts[1] === 'album') return guides['/school-data'] || defaultGuide;
    if (pathParts[1] === 'collaborative-form') return defaultGuide;
    return defaultGuide;
  }, [location]);

  const currentGuide = getGuide();
  const steps = currentGuide.steps;
  const currentStepData = steps[currentStep];

  useEffect(() => {
    setCurrentStep(0);
    setShowIntro(true);
    setTargetRect(null);
  }, [location]);

  useEffect(() => {
    if (!isOpen || showIntro || !currentStepData?.target) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const selectors = currentStepData.target!.split(',').map(s => s.trim());
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              setTargetRect(rect);
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              return;
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
    setIsOpen(false);
    setTargetRect(null);
  };

  const startGuide = () => {
    setShowIntro(false);
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
          {/* Spotlight overlay */}
          {targetRect && !showIntro && (
            <div className="fixed inset-0 z-[69] pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <mask id="spotlight-mask">
                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                    <rect
                      x={targetRect.left - 8}
                      y={targetRect.top - 8}
                      width={targetRect.width + 16}
                      height={targetRect.height + 16}
                      rx="8"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.6)"
                  mask="url(#spotlight-mask)"
                />
              </svg>
              {/* Highlight border */}
              <div
                className="absolute border-2 border-blue-400 rounded-lg animate-pulse pointer-events-none"
                style={{
                  left: targetRect.left - 8,
                  top: targetRect.top - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
              />
            </div>
          )}

          {/* Dark overlay for intro or when no target */}
          {(showIntro || !targetRect) && (
            <div className="fixed inset-0 z-[69] bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          )}

          {/* Guide panel */}
          <div
            className="fixed z-[70] w-[calc(100%-32px)] max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
            style={showIntro || !targetRect ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : getTooltipPosition()}
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
                  <button
                    onClick={handleClose}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close"
                    data-testid="button-close-help"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
