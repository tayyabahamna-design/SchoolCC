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
      en: 'Welcome to your Dashboard! This is your control center where you can access all TaleemHub features. Let me show you each feature step by step.',
      ur: 'اپنے ڈیش بورڈ میں خوش آمدید! یہ آپ کا کنٹرول سینٹر ہے۔ آئیں میں آپ کو ہر خصوصیت قدم بہ قدم دکھاتا ہوں۔'
    },
    steps: [
      {
        title: { en: 'Task & Stats Cards', ur: 'کام اور اعدادوشمار کارڈز' },
        description: {
          en: 'At the top of your dashboard, you\'ll see 3 cards:\n\n• MY TASKS - Shows pending work assigned to you\n• COMPLETED - Shows tasks you\'ve finished\n• LESSON PLANS - Coming soon!\n\nThese cards give you a quick overview of your workload.',
          ur: 'آپ کے ڈیش بورڈ کے اوپر 3 کارڈز نظر آئیں گے:\n\n• میرے کام - آپ کو دیے گئے زیر التوا کام\n• مکمل - آپ کے ختم شدہ کام\n• سبق کے منصوبے - جلد آ رہے ہیں!\n\nیہ کارڈز آپ کے کام کا فوری جائزہ دیتے ہیں۔'
        },
        tip: {
          en: 'Tap any card to see more details!',
          ur: 'مزید تفصیلات کے لیے کسی بھی کارڈ پر ٹیپ کریں!'
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
        title: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
        description: {
          en: 'The LEAVE CALENDAR helps you track your time off:\n\n• Tap the "Calendar" button to open it\n• Select any date to add a leave entry\n• Choose leave type: Casual, Sick, Earned, or Special\n• Add your already approved leaves here for visibility\n\nKeep all your leaves recorded in one place!',
          ur: 'چھٹی کیلنڈر آپ کی چھٹیوں کو ٹریک کرنے میں مدد کرتا ہے:\n\n• کھولنے کے لیے "کیلنڈر" بٹن ٹیپ کریں\n• چھٹی کا اندراج شامل کرنے کے لیے کوئی بھی تاریخ منتخب کریں\n• چھٹی کی قسم چنیں: کیژول، بیمار، ارنڈ، یا خصوصی\n• اپنی پہلے سے منظور شدہ چھٹیاں یہاں نظر آنے کے لیے شامل کریں'
        },
        tip: {
          en: 'Add your approved leaves here for easy tracking!',
          ur: 'آسان ٹریکنگ کے لیے اپنی منظور شدہ چھٹیاں یہاں شامل کریں!'
        },
        target: '[data-testid="button-view-calendar-mobile"], [data-testid="button-view-calendar"]',
        position: 'bottom'
      },
      {
        title: { en: 'Community Album', ur: 'کمیونٹی البم' },
        description: {
          en: 'The COMMUNITY ALBUM is where you share your teaching moments:\n\n• See photos from ALL schools in the district\n• Post your classroom activities with up to 10 photos\n• React with Like, Love, Clap, or Celebrate\n• Comment and engage with other teachers\n• Get notified when someone reacts to your posts!',
          ur: 'کمیونٹی البم وہ جگہ ہے جہاں آپ اپنے تدریسی لمحات شیئر کرتے ہیں:\n\n• ضلع کے تمام اسکولوں کی تصاویر دیکھیں\n• 10 تصاویر تک اپنی کلاس روم سرگرمیاں پوسٹ کریں\n• لائک، لو، تالی یا جشن سے ری ایکٹ کریں\n• دوسرے اساتذہ کے ساتھ تبصرے کریں!'
        },
        tip: {
          en: 'Share your best classroom moments with everyone!',
          ur: 'اپنے بہترین کلاس روم لمحات سب کے ساتھ شیئر کریں!'
        },
        target: '[data-testid="button-community-album"]',
        position: 'bottom'
      },
      {
        title: { en: 'Queries & Help', ur: 'سوالات اور مدد' },
        description: {
          en: 'Need help? Use the QUERIES section to:\n\n• Ask questions to your Head Teacher or AEO\n• Report issues or concerns\n• Track responses to your queries\n• Get help with policies and procedures\n\nYour supervisors will respond to your queries.',
          ur: 'مدد چاہیے؟ سوالات کا سیکشن استعمال کریں:\n\n• اپنے ہیڈ ٹیچر یا AEO سے سوالات پوچھیں\n• مسائل یا خدشات رپورٹ کریں\n• اپنے سوالات کے جوابات ٹریک کریں\n• پالیسیوں اور طریقہ کار میں مدد لیں'
        },
        target: '[data-testid="button-view-queries"]',
        position: 'bottom'
      },
      {
        title: { en: 'Menu Button (Mobile)', ur: 'مینو بٹن (موبائل)' },
        description: {
          en: 'On mobile, tap the ☰ MENU BUTTON (three lines) in the top-left corner to open the sidebar menu:\n\n• Leave Calendar - Track your approved leaves\n• Data Requests - View and respond to requests\n• Community Album - Share and view activities\n• Queries - Get help from seniors\n• My Profile - View and edit your info\n• Help Guide - Open this guide again\n• Logout - Sign out of the app\n\nTap anywhere outside to close the menu!',
          ur: 'موبائل پر، سائڈبار مینو کھولنے کے لیے اوپر بائیں کونے میں ☰ مینو بٹن (تین لائنیں) ٹیپ کریں:\n\n• چھٹی کیلنڈر - اپنی منظور شدہ چھٹیاں دیکھیں\n• ڈیٹا کی درخواستیں - درخواستیں دیکھیں اور جواب دیں\n• کمیونٹی البم - سرگرمیاں شیئر کریں\n• سوالات - بڑوں سے مدد حاصل کریں\n• میرا پروفائل - اپنی معلومات دیکھیں\n• ہیلپ گائیڈ - یہ گائیڈ دوبارہ کھولیں\n• لاگ آؤٹ - ایپ سے باہر نکلیں'
        },
        tip: {
          en: 'Tap outside the menu or the X button to close it!',
          ur: 'مینو بند کرنے کے لیے باہر ٹیپ کریں یا X بٹن دبائیں!'
        },
        target: '[data-testid="button-open-menu"]',
        position: 'right'
      },
      {
        title: { en: 'Sidebar Menu (Desktop)', ur: 'سائڈبار مینو (ڈیسک ٹاپ)' },
        description: {
          en: 'On larger screens, the LEFT SIDEBAR is always visible and gives you quick access to:\n\n• Your profile at the top\n• Quick action buttons\n• Navigation menu with all features\n• Logout button at the bottom\n\nUse the sidebar for easy navigation!',
          ur: 'بڑی سکرینوں پر، بائیں سائڈبار ہمیشہ نظر آتا ہے اور آپ کو فوری رسائی دیتا ہے:\n\n• اوپر آپ کا پروفائل\n• فوری ایکشن بٹن\n• تمام خصوصیات کے ساتھ نیویگیشن مینو\n• نیچے لاگ آؤٹ بٹن'
        },
        position: 'center'
      },
      {
        title: { en: 'That\'s it!', ur: 'بس!' },
        description: {
          en: 'You now know all the features of TaleemHub Dashboard!\n\n• Task cards show your work overview\n• Quotes and tips keep you inspired\n• Leave Calendar for time-off management\n• Community Album for sharing activities\n• Queries for getting help\n\nTap "Done" to close this guide. You can open it anytime from the Help button!',
          ur: 'اب آپ TaleemHub ڈیش بورڈ کی تمام خصوصیات جان گئے!\n\n• ٹاسک کارڈز آپ کے کام کا جائزہ دکھاتے ہیں\n• اقتباسات اور تجاویز آپ کو متحرک رکھتے ہیں\n• چھٹی کیلنڈر وقت کے انتظام کے لیے\n• کمیونٹی البم سرگرمیاں شیئر کرنے کے لیے\n• سوالات مدد کے لیے\n\nگائیڈ بند کرنے کے لیے "مکمل" ٹیپ کریں۔ آپ اسے کسی بھی وقت Help بٹن سے کھول سکتے ہیں!'
        },
        tip: {
          en: 'Tap the Help button anytime to reopen this guide!',
          ur: 'یہ گائیڈ دوبارہ کھولنے کے لیے کسی بھی وقت Help بٹن ٹیپ کریں!'
        },
        position: 'center'
      },
    ],
  },
  '/dashboard-head-teacher': {
    screenName: { en: 'Head Teacher Dashboard Guide', ur: 'ہیڈ ٹیچر ڈیش بورڈ گائیڈ' },
    introduction: {
      en: 'Welcome to your Head Teacher Dashboard! This is your control center for managing your school, staff, and data requests. Let me show you each feature step by step.',
      ur: 'اپنے ہیڈ ٹیچر ڈیش بورڈ میں خوش آمدید! یہ آپ کا اسکول، عملے اور ڈیٹا کی درخواستوں کے انتظام کا مرکز ہے۔ آئیں میں آپ کو ہر خصوصیت قدم بہ قدم دکھاتا ہوں۔'
    },
    steps: [
      {
        title: { en: 'Task & Stats Cards', ur: 'کام اور اعدادوشمار کارڈز' },
        description: {
          en: 'At the top of your dashboard, you\'ll see 3 cards:\n\n• PENDING TASKS - Data requests you need to respond to\n• COMPLETED - Tasks you\'ve finished\n• LESSON PLANS - View lesson plans from your teachers (coming soon!)\n\nThese cards give you a quick overview of your workload.',
          ur: 'آپ کے ڈیش بورڈ کے اوپر 3 کارڈز نظر آئیں گے:\n\n• زیر التوا کام - ڈیٹا کی درخواستیں جن کا آپ کو جواب دینا ہے\n• مکمل - آپ کے ختم شدہ کام\n• سبق کے منصوبے - اپنے اساتذہ کے سبق کے منصوبے دیکھیں (جلد آ رہا ہے!)\n\nیہ کارڈز آپ کے کام کا فوری جائزہ دیتے ہیں۔'
        },
        tip: {
          en: 'Tap any card to see more details!',
          ur: 'مزید تفصیلات کے لیے کسی بھی کارڈ پر ٹیپ کریں!'
        },
        target: '[data-testid="widget-stats"]',
        position: 'bottom'
      },
      {
        title: { en: 'My School Staff', ur: 'میرے اسکول کا عملہ' },
        description: {
          en: 'This section shows your school\'s staff statistics:\n\n• Total number of teachers\n• Present teachers today\n• Teachers on leave\n\nThis helps you track daily attendance at a glance.',
          ur: 'یہ سیکشن آپ کے اسکول کے عملے کے اعداد و شمار دکھاتا ہے:\n\n• اساتذہ کی کل تعداد\n• آج موجود اساتذہ\n• چھٹی پر اساتذہ\n\nیہ آپ کو روزانہ حاضری کا فوری جائزہ لینے میں مدد کرتا ہے۔'
        },
        target: '[data-testid="widget-staff"]',
        position: 'bottom'
      },
      {
        title: { en: 'Manage Teachers', ur: 'اساتذہ کا انتظام' },
        description: {
          en: 'Tap "MANAGE TEACHERS" to:\n\n• View all teachers in your school\n• See their details and contact info\n• Monitor their work status\n• Approve new teacher registrations',
          ur: '"اساتذہ کا انتظام" پر ٹیپ کریں:\n\n• اپنے اسکول کے تمام اساتذہ دیکھیں\n• ان کی تفصیلات اور رابطہ معلومات دیکھیں\n• ان کی کام کی حیثیت کی نگرانی کریں\n• نئے اساتذہ کی رجسٹریشن منظور کریں'
        },
        tip: {
          en: 'You can approve pending teacher registrations here!',
          ur: 'آپ یہاں زیر التوا اساتذہ کی رجسٹریشن منظور کر سکتے ہیں!'
        },
        target: '[data-testid="button-manage-teachers"]',
        position: 'bottom'
      },
      {
        title: { en: 'School Management', ur: 'اسکول کا انتظام' },
        description: {
          en: 'Tap "EDIT SCHOOL" to manage your school\'s data:\n\n• Basic Info - School details, EMIS code, contact info\n• Attendance - Daily student and teacher attendance\n• Infrastructure - Classrooms, facilities, utilities\n• Inventory - Furniture, equipment, supplies\n\n⚠️ Remember to update attendance daily before 10:00 AM!',
          ur: 'اپنے اسکول کا ڈیٹا منظم کرنے کے لیے "اسکول ایڈٹ" پر ٹیپ کریں:\n\n• بنیادی معلومات - اسکول کی تفصیلات، EMIS کوڈ، رابطہ معلومات\n• حاضری - روزانہ طلباء اور اساتذہ کی حاضری\n• انفراسٹرکچر - کلاس رومز، سہولیات\n• انوینٹری - فرنیچر، سامان\n\n⚠️ یاد رکھیں روزانہ صبح 10 بجے سے پہلے حاضری اپ ڈیٹ کریں!'
        },
        tip: {
          en: 'Update attendance daily before 10:00 AM!',
          ur: 'روزانہ صبح 10 بجے سے پہلے حاضری اپ ڈیٹ کریں!'
        },
        target: '[data-testid="button-edit-school"]',
        position: 'bottom'
      },
      {
        title: { en: 'Data Requests', ur: 'ڈیٹا کی درخواستیں' },
        description: {
          en: 'Use "DATA REQUESTS" to:\n\n• View requests from AEO, DEO, or CEO\n• Create new data requests for your teachers\n• Use VOICE NOTES to record instructions in English or Urdu - speech is automatically converted to text!\n• Track responses and submissions\n• Export data to Excel for reporting\n\n🎤 Voice Recording: Tap the microphone icon to record voice notes. Your speech will be transcribed automatically!',
          ur: '"ڈیٹا کی درخواستیں" استعمال کریں:\n\n• AEO، DEO یا CEO کی درخواستیں دیکھیں\n• اپنے اساتذہ کے لیے نئی ڈیٹا کی درخواستیں بنائیں\n• انگریزی یا اردو میں ہدایات ریکارڈ کرنے کے لیے وائس نوٹس استعمال کریں - تقریر خودکار طور پر ٹیکسٹ میں تبدیل ہو جاتی ہے!\n• جوابات اور جمع کرائیں ٹریک کریں\n• رپورٹنگ کے لیے ڈیٹا Excel میں ایکسپورٹ کریں\n\n🎤 وائس ریکارڈنگ: وائس نوٹس ریکارڈ کرنے کے لیے مائیکروفون آئیکن ٹیپ کریں۔ آپ کی تقریر خودکار طور پر لکھی جائے گی!'
        },
        tip: {
          en: 'Use voice notes in English or Urdu - they get converted to text automatically!',
          ur: 'انگریزی یا اردو میں وائس نوٹس استعمال کریں - یہ خودکار طور پر ٹیکسٹ میں تبدیل ہو جاتے ہیں!'
        },
        target: '[data-testid="button-data-requests"]',
        position: 'bottom'
      },
      {
        title: { en: 'Leave Calendar', ur: 'چھٹی کیلنڈر' },
        description: {
          en: 'The LEAVE CALENDAR helps you manage staff leave:\n\n• View all teachers\' approved leaves\n• Add new leave entries for teachers\n• Track leave types: Casual, Sick, Earned, Special\n• Plan staffing based on upcoming leaves',
          ur: 'چھٹی کیلنڈر آپ کو عملے کی چھٹی کا انتظام کرنے میں مدد کرتا ہے:\n\n• تمام اساتذہ کی منظور شدہ چھٹیاں دیکھیں\n• اساتذہ کے لیے نئے چھٹی کے اندراج شامل کریں\n• چھٹی کی اقسام ٹریک کریں\n• آنے والی چھٹیوں کی بنیاد پر عملے کی منصوبہ بندی کریں'
        },
        tip: {
          en: 'Keep track of all teacher leaves in one place!',
          ur: 'تمام اساتذہ کی چھٹیوں کا ایک جگہ ریکارڈ رکھیں!'
        },
        target: '[data-testid="button-view-calendar"], [data-testid="button-view-calendar-mobile"]',
        position: 'bottom'
      },
      {
        title: { en: 'Community Album (Social Feed)', ur: 'کمیونٹی البم (سوشل فیڈ)' },
        description: {
          en: 'The COMMUNITY ALBUM is a social media-style feed (separate from School Inventory):\n\n• Teachers share classroom activity photos here\n• View posts from ALL schools in the district\n• React with Like, Love, Clap, or Celebrate\n• Comment and encourage fellow teachers\n• You can delete inappropriate posts from your school\n\n📌 Note: This is different from School Inventory which tracks furniture and supplies.',
          ur: 'کمیونٹی البم ایک سوشل میڈیا سٹائل فیڈ ہے (اسکول انوینٹری سے الگ):\n\n• اساتذہ یہاں کلاس روم سرگرمیوں کی تصاویر شیئر کرتے ہیں\n• ضلع کے تمام اسکولوں کی پوسٹس دیکھیں\n• لائک، لو، تالی یا جشن سے ری ایکٹ کریں\n• ساتھی اساتذہ کو تبصرے کریں اور حوصلہ افزائی کریں\n• آپ اپنے اسکول کی نامناسب پوسٹس حذف کر سکتے ہیں\n\n📌 نوٹ: یہ اسکول انوینٹری سے مختلف ہے جو فرنیچر اور سپلائز کو ٹریک کرتی ہے۔'
        },
        target: '[data-testid="button-community-album"]',
        position: 'bottom'
      },
      {
        title: { en: 'Quick Coaching Tips', ur: 'فوری کوچنگ تجاویز' },
        description: {
          en: 'The COACHING TIPS section helps you guide your teachers:\n\n• Get 3 random coaching tips each time you visit\n• Use these tips during teacher observations\n• Share tips with teachers during mentoring sessions\n• Tips cover teaching techniques, classroom management, and student engagement',
          ur: 'کوچنگ تجاویز کا سیکشن آپ کو اپنے اساتذہ کی رہنمائی میں مدد کرتا ہے:\n\n• ہر بار جب آپ آئیں تو 3 تصادفی کوچنگ تجاویز حاصل کریں\n• اساتذہ کے مشاہدے کے دوران ان تجاویز کا استعمال کریں\n• مینٹورنگ سیشنز کے دوران اساتذہ کے ساتھ تجاویز شیئر کریں\n• تجاویز میں تدریسی تکنیک، کلاس روم کا انتظام، اور طلباء کی مشغولیت شامل ہے'
        },
        tip: {
          en: 'Use these tips during your classroom observations!',
          ur: 'کلاس روم مشاہدے کے دوران ان تجاویز کا استعمال کریں!'
        },
        target: '[data-testid="widget-coaching-tips"]',
        position: 'bottom'
      },
      {
        title: { en: 'Menu Button (Mobile)', ur: 'مینو بٹن (موبائل)' },
        description: {
          en: 'On mobile, tap the ☰ MENU BUTTON (three lines) to open the sidebar menu with all options:\n\n• School Management\n• Manage Teachers\n• Data Requests\n• Leave Calendar\n• Community Album\n• My Profile & Settings\n• Help Guide & Logout',
          ur: 'موبائل پر، تمام آپشنز کے ساتھ سائڈبار مینو کھولنے کے لیے ☰ مینو بٹن پر ٹیپ کریں:\n\n• اسکول کا انتظام\n• اساتذہ کا انتظام\n• ڈیٹا کی درخواستیں\n• چھٹی کیلنڈر\n• کمیونٹی البم\n• میرا پروفائل اور ترتیبات\n• ہیلپ گائیڈ اور لاگ آؤٹ'
        },
        tip: {
          en: 'Tap outside the menu or the X button to close it!',
          ur: 'مینو بند کرنے کے لیے باہر ٹیپ کریں یا X بٹن دبائیں!'
        },
        target: '[data-testid="button-open-menu"]',
        position: 'right'
      },
      {
        title: { en: 'That\'s it!', ur: 'بس!' },
        description: {
          en: 'You now know all the features of your Head Teacher Dashboard!\n\n• Task cards show your work overview\n• Staff section shows teacher attendance\n• School Management for all school data\n• Data Requests for collecting information\n• Leave Calendar for tracking leaves\n\nTap "Done" to close this guide. You can open it anytime from the Help button!',
          ur: 'اب آپ اپنے ہیڈ ٹیچر ڈیش بورڈ کی تمام خصوصیات جان گئے!\n\n• ٹاسک کارڈز آپ کے کام کا جائزہ دکھاتے ہیں\n• عملے کا سیکشن اساتذہ کی حاضری دکھاتا ہے\n• تمام اسکول ڈیٹا کے لیے اسکول کا انتظام\n• معلومات جمع کرنے کے لیے ڈیٹا کی درخواستیں\n• چھٹیوں کو ٹریک کرنے کے لیے چھٹی کیلنڈر\n\nگائیڈ بند کرنے کے لیے "مکمل" ٹیپ کریں!'
        },
        tip: {
          en: 'Tap the Help button anytime to reopen this guide!',
          ur: 'یہ گائیڈ دوبارہ کھولنے کے لیے کسی بھی وقت Help بٹن ٹیپ کریں!'
        },
        position: 'center'
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
      en: 'View and respond to data collection requests from your supervisors. You can use voice notes to record responses in English or Urdu!',
      ur: 'اپنے سپروائزرز کی طرف سے ڈیٹا جمع کرنے کی درخواستیں دیکھیں اور ان کا جواب دیں۔ آپ انگریزی یا اردو میں جوابات ریکارڈ کرنے کے لیے وائس نوٹس استعمال کر سکتے ہیں!'
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
        title: { en: 'Voice Notes Feature', ur: 'وائس نوٹس کی خصوصیت' },
        description: {
          en: 'Use VOICE NOTES to record your instructions or responses:\n\n• Tap the 🎤 microphone icon to start recording\n• Speak in English or Urdu\n• Your speech is automatically converted to text!\n• The transcribed text appears in the text field\n• You can edit the text after recording',
          ur: 'اپنی ہدایات یا جوابات ریکارڈ کرنے کے لیے وائس نوٹس استعمال کریں:\n\n• ریکارڈنگ شروع کرنے کے لیے 🎤 مائیکروفون آئیکن ٹیپ کریں\n• انگریزی یا اردو میں بولیں\n• آپ کی تقریر خودکار طور پر ٹیکسٹ میں تبدیل ہو جاتی ہے!\n• لکھا ہوا ٹیکسٹ ٹیکسٹ فیلڈ میں ظاہر ہوتا ہے\n• آپ ریکارڈنگ کے بعد ٹیکسٹ ایڈٹ کر سکتے ہیں'
        },
        tip: {
          en: 'Speak clearly - your voice is converted to text automatically!',
          ur: 'واضح بولیں - آپ کی آواز خودکار طور پر ٹیکسٹ میں تبدیل ہو جاتی ہے!'
        },
        target: '[data-testid*="voice-recorder"], [data-testid*="mic"]',
        position: 'bottom'
      },
      {
        title: { en: 'Submitting a Response', ur: 'جواب جمع کرانا' },
        description: {
          en: 'After tapping a request, fill in all required fields carefully. You can type or use voice notes. Upload any needed files or photos. Tap "Submit" when done - you cannot change it after!',
          ur: 'درخواست پر ٹیپ کرنے کے بعد تمام مطلوبہ خانے احتیاط سے پُر کریں۔ آپ ٹائپ کر سکتے ہیں یا وائس نوٹس استعمال کر سکتے ہیں۔ کوئی بھی ضروری فائلیں یا تصاویر اپ لوڈ کریں۔ مکمل ہونے پر "جمع کریں" پر ٹیپ کریں - بعد میں تبدیل نہیں ہو سکتا!'
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
