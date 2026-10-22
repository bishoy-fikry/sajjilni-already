import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  CircleHelp,
  Flag,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { ServiceStage } from '../types';
import type { CalendarSnapshot } from '../services/dualCalendarEngine';

type ChatSource = { title: string; url: string };
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
};
type AuthState = 'checking' | 'ready' | 'required';
type QuizAudience = 'preschool' | 'primary' | 'youth' | 'servants' | 'general';
type QuizQuestion = {
  audience: QuizAudience;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const QUICK_QUESTIONS = [
  'ما معنى كلمة إفخارستيا؟',
  'إيه هي الأناجيل الأربعة؟',
  'ما معنى عيد النيروز؟',
  'إيه هي أسرار الكنيسة السبعة؟',
  'ما معنى التجسد؟',
  'إزاي أبدأ أصلي بالمزامير؟',
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    audience: 'preschool',
    question: 'مين هو ربنا يسوع؟',
    options: ['الراعي الصالح الذي يحبنا', 'شخصية من قصة خيالية'],
    correctIndex: 0,
    explanation: 'المادة التعليمية تصفه بأنه الراعي الصالح الذي يحبنا.',
  },
  {
    audience: 'preschool',
    question: 'نعمل إيه قبل ما ناكل أو ننام؟',
    options: ['نرسم علامة الصليب ونصلي', 'ننسى نشكر ربنا'],
    correctIndex: 0,
    explanation: 'المثال التعليمي يقترح علامة الصليب وصلاة صغيرة وشكر ربنا.',
  },
  {
    audience: 'preschool',
    question: 'كمّل: «ربنا يسوع…»',
    options: ['بيحبني', 'مايعرفنيش'],
    correctIndex: 0,
    explanation: 'دي الجملة التشجيعية الموجودة في المثال التعليمي للحضانة.',
  },
  {
    audience: 'primary',
    question: 'عدد الأناجيل في العهد الجديد؟',
    options: ['ثلاثة', 'أربعة', 'خمسة'],
    correctIndex: 1,
    explanation: 'الأناجيل هي متى ومرقس ولوقا ويوحنا.',
  },
  {
    audience: 'primary',
    question: 'مين كاتب الإنجيل الرابع؟',
    options: ['متى', 'يوحنا', 'مرقس'],
    correctIndex: 1,
    explanation: 'يوحنا هو كاتب الإنجيل الرابع.',
  },
  {
    audience: 'primary',
    question: 'مين هو «كارز الديار المصرية» في المثال التعليمي؟',
    options: ['مارمرقس', 'القديس يوحنا', 'القديس متى'],
    correctIndex: 0,
    explanation: 'المثال التعليمي يذكر أن مارمرقس هو كارز الديار المصرية.',
  },
  {
    audience: 'youth',
    question: 'أي سر من أسرار الكنيسة السبعة لا يتكرر؟',
    options: ['المعمودية', 'الاعتراف', 'الإفخارستيا'],
    correctIndex: 0,
    explanation: 'إجابة المثال التعليمي المرفق هي سر المعمودية.',
  },
  {
    audience: 'youth',
    question: 'ما المقصود بالتجسد بحسب المادة التعليمية؟',
    options: [
      'أن كلمة الله الابن اتخذ طبيعة بشرية كاملة',
      'أن الإنسان صار ملاكًا',
      'أن الله تخلّى عن لاهوته',
    ],
    correctIndex: 0,
    explanation: 'المادة تشرح أن كلمة الله الابن أخذ طبيعة بشرية كاملة دون أن يفقد لاهوته.',
  },
  {
    audience: 'youth',
    question: 'أيٌّ من الآتي مذكور ضمن أسرار الكنيسة السبعة؟',
    options: ['المعمودية', 'الرحلات', 'الترانيم فقط'],
    correctIndex: 0,
    explanation: 'المعمودية واحدة من الأسرار السبعة الواردة في المادة التعليمية.',
  },
  {
    audience: 'servants',
    question: 'ما أهمية مجمع نيقية سنة 325م بحسب المادة؟',
    options: ['أول مجمع مسكوني', 'أول كتاب للألحان', 'بداية التقويم الميلادي'],
    correctIndex: 0,
    explanation: 'المادة تصفه بأنه أول مجمع مسكوني.',
  },
  {
    audience: 'servants',
    question: 'ماذا تعني عبارة «هومو أوسيوس» في صياغة مجمع نيقية؟',
    options: ['مساوٍ للآب في الجوهر', 'مشابه للآب في الجوهر', 'مختلف عن الآب'],
    correctIndex: 0,
    explanation: 'قاعدة المعرفة المرفقة تشرحها بمعنى «مساوٍ للآب في الجوهر».',
  },
  {
    audience: 'servants',
    question: 'كيف تصف المادة علاقة اللحن بالعقيدة؟',
    options: ['اللحن صلاة عقائدية تحمل لاهوت الكنيسة', 'اللحن منفصل عن النص والطقس', 'اللحن للترفيه فقط'],
    correctIndex: 0,
    explanation: 'المثال التعليمي يصف اللحن بأنه صلاة عقائدية تتكامل مع النص والحركة الطقسية.',
  },
  {
    audience: 'general',
    question: 'ما معنى كلمة «إفخارستيا»؟',
    options: ['الشكر', 'السلام', 'التسبيح'],
    correctIndex: 0,
    explanation: 'المثال التعليمي المرفق يذكر أن معناها «الشكر».',
  },
  {
    audience: 'general',
    question: 'ما معنى كلمة «أليلويا»؟',
    options: ['سبّحوا الرب', 'سلام لكم', 'إلى اللقاء'],
    correctIndex: 0,
    explanation: 'المثال التعليمي يذكر أن «أليلويا» معناها «سبّحوا الرب».',
  },
  {
    audience: 'general',
    question: 'كيف تصف المادة المزامير؟',
    options: ['صلاة النفس اليومية وتعطي السلام والرجاء', 'سجل للحضور', 'قائمة بالأعياد فقط'],
    correctIndex: 0,
    explanation: 'المثال التعليمي لكبار السن يصف المزامير بأنها صلاة يومية تعطي السلام والرجاء.',
  },
];

const ERROR_TEXT: Record<string, string> = {
  session_required: 'انتهت جلسة الدخول. سجّل الدخول مجددًا للمتابعة.',
  assistant_unavailable: 'المرشد غير متاح الآن؛ إعدادات الخادم أو Gemini غير مكتملة.',
  rate_limited: 'وصلت إلى حد الأسئلة المسموح به مؤقتًا. جرّب بعد قليل.',
  provider_busy: 'المرشد مشغول حاليًا أو وصلت الخدمة إلى حد الاستخدام. جرّب لاحقًا.',
  question_too_long: 'خلّي السؤال في حدود 500 حرف.',
  invalid_question: 'اكتب سؤالًا قصيرًا للمتابعة.',
};

function makeId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function quizAudienceForStage(stage: ServiceStage): QuizAudience {
  if (stage.id.endsWith('_kg')) return 'preschool';
  if (stage.id.includes('prim') || stage.id.includes('scouts')) return 'primary';
  if (stage.id.includes('prep') || stage.id.includes('sec') || stage.id === 'gm_youth') return 'youth';
  if (stage.id === 'gm_servants') return 'servants';
  return 'general';
}

function toArabicDate(date: string): string {
  return new Date(`${date}T12:00:00.000Z`).toLocaleDateString('ar-EG', {
    timeZone: 'Africa/Cairo',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export interface GuideChatProps {
  stage: ServiceStage;
  sessionKey: string;
  onRequestLogin: () => void;
}

export const GuideChat: React.FC<GuideChatProps> = ({
  stage,
  sessionKey,
  onRequestLogin,
}) => {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [snapshot, setSnapshot] = useState<CalendarSnapshot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quizQuestions = useMemo(() => {
    const audience = quizAudienceForStage(stage);
    return QUIZ_QUESTIONS.filter((item) => item.audience === audience);
  }, [stage]);

  const currentQuizQuestion = quizQuestions[quizIndex];

  useEffect(() => {
    let cancelled = false;
    setAuthState('checking');
    setSnapshot(null);
    fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('session_required');
        if (cancelled) return;
        setAuthState('ready');
        return fetch('/api/chat/today', { credentials: 'same-origin', cache: 'no-store' })
          .then(async (todayResponse) => {
            if (!todayResponse.ok) throw new Error('calendar_unavailable');
            const data = (await todayResponse.json()) as CalendarSnapshot;
            if (!cancelled) setSnapshot(data);
          })
          .catch(() => {
            if (!cancelled) setNotice('تعذر تحميل بطاقة اليوم الآن.');
          });
      })
      .catch(() => {
        if (!cancelled) setAuthState('required');
      });
    return () => {
      cancelled = true;
    };
  }, [sessionKey, stage.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending]);

  const sendQuestion = async (text: string) => {
    const cleanQuestion = text.trim();
    if (!cleanQuestion || isSending) return;
    if (authState !== 'ready') {
      setAuthState('required');
      return;
    }
    if (cleanQuestion.length > 500) {
      setNotice(ERROR_TEXT.question_too_long);
      return;
    }

    setNotice('');
    setQuestion('');
    setMessages((current) => [...current, { id: makeId(), role: 'user', text: cleanQuestion }]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: cleanQuestion, stageId: stage.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload?.error === 'session_required') {
          setAuthState('required');
          setNotice(ERROR_TEXT.session_required);
        } else {
          setNotice(ERROR_TEXT[payload?.error] ?? 'تعذر الحصول على إجابة الآن. حاول مرة أخرى.');
        }
        return;
      }
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: 'assistant',
          text: typeof payload.answer === 'string' ? payload.answer : 'لم تصل إجابة صالحة.',
          sources: Array.isArray(payload.sources) ? payload.sources : [],
        },
      ]);
    } catch {
      setNotice('تعذر الاتصال بالمرشد. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  const reportAnswer = async (answerId: string) => {
    try {
      const response = await fetch('/api/chat/report', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        setNotice('تعذر إرسال البلاغ الآن.');
        return;
      }
      setReportedIds((current) => [...current, answerId]);
      setNotice('وصل البلاغ للمسؤول. لا نرسل معه السؤال أو بياناتك.');
    } catch {
      setNotice('تعذر إرسال البلاغ الآن.');
    }
  };

  const readAnswerAloud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setNotice('ميزة القراءة الصوتية غير متاحة في هذا المتصفح.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    window.speechSynthesis.speak(utterance);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizScore(0);
  };

  const chooseQuizAnswer = (index: number) => {
    if (quizAnswer !== null || !currentQuizQuestion) return;
    setQuizAnswer(index);
    if (index === currentQuizQuestion.correctIndex) setQuizScore((score) => score + 1);
  };

  const continueQuiz = () => {
    setQuizIndex((index) => index + 1);
    setQuizAnswer(null);
  };

  const quizComplete = quizIndex >= quizQuestions.length;

  return (
    <section dir="rtl" className="space-y-5 text-white">
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-950/70 via-slate-900/90 to-slate-950 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-300">مساعد الخدمة</p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">اسأل المرشد</h2>
              <p className="mt-1 text-sm text-slate-300">
                إجابات تعليمية مناسبة لمرحلة {stage.name} ({stage.ageGroup})
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setQuizMode(false)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                !quizMode
                  ? 'border-rose-400/40 bg-rose-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              دردشة
            </button>
            <button
              type="button"
              onClick={() => {
                setQuizMode(true);
                resetQuiz();
              }}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                quizMode
                  ? 'border-rose-400/40 bg-rose-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <CircleHelp className="h-4 w-4" />
              اختبر معلوماتك
            </button>
          </div>
        </div>
      </div>

      {snapshot && (
        <div className="grid gap-3 lg:grid-cols-[1.05fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <CalendarDays className="h-4 w-4 text-rose-300" />
              بطاقة اليوم
            </div>
            <p className="text-sm font-bold text-rose-200">{snapshot.weekday}، {toArabicDate(snapshot.gregorian)}</p>
            <p className="mt-1 text-sm text-slate-300">التقويم القبطي: {snapshot.coptic}</p>
            <p className="mt-2 text-xs text-slate-400">
              {snapshot.fasts.length ? snapshot.fasts.join('، ') : 'لا يوجد صوم مسجل في بيانات هذا اليوم.'}
            </p>
            {snapshot.events.length > 0 && (
              <p className="mt-2 text-xs text-amber-200">{snapshot.events.map((event) => event.name).join('، ')}</p>
            )}
            <p className="mt-3 border-t border-white/10 pt-2 text-[10px] leading-5 text-slate-500">{snapshot.note}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <BookOpen className="h-4 w-4 text-rose-300" />
              المناسبات القادمة
            </div>
            <div className="space-y-2">
              {snapshot.upcomingFeasts.map((event, index) => (
                <div key={`${event.date}-${event.name}-${index}`} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-200">{event.name}</span>
                  <span className="shrink-0 text-slate-400">{event.coptic} · {toArabicDate(event.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/5 p-3 text-[11px] leading-5 text-amber-100/80">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p>
          مواد قاعدة المعرفة والأسئلة لم تُراجع كنسيًا بعد. التطبيق لا يحفظ المحادثة؛ لا تكتب أسماء أو أرقامًا أو بيانات شخصية في السؤال، فالنص يُرسل إلى Gemini للإجابة.
        </p>
      </div>

      {notice && (
        <div role="status" className="rounded-xl border border-rose-400/20 bg-rose-950/40 px-4 py-3 text-xs text-rose-100">
          {notice}
        </div>
      )}

      {authState === 'checking' ? (
        <div className="flex min-h-60 items-center justify-center rounded-3xl border border-white/10 bg-slate-900/60 text-sm text-slate-300">
          <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-rose-300" />
          جارٍ التحقق من جلسة الدخول…
        </div>
      ) : authState === 'required' ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-rose-300" />
          <h3 className="text-lg font-black">تسجيل الدخول مطلوب</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            المرشد متاح للمستخدمين الذين لديهم جلسة خدمة صالحة. لن تُرسل بيانات الاسم أو الهاتف إلى الشات.
          </p>
          <button
            type="button"
            onClick={onRequestLogin}
            className="mt-5 rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold transition hover:bg-rose-600"
          >
            تسجيل الدخول مجددًا
          </button>
        </div>
      ) : quizMode ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-rose-200">
              {quizComplete ? 'انتهى الاختبار' : `السؤال ${quizIndex + 1} من ${quizQuestions.length}`}
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">النتيجة: {quizScore}</span>
          </div>
          {quizComplete ? (
            <div className="py-8 text-center">
              <Check className="mx-auto mb-3 h-9 w-9 text-emerald-300" />
              <h3 className="text-xl font-black">أحسنت!</h3>
              <p className="mt-2 text-sm text-slate-300">إجابات صحيحة: {quizScore} من {quizQuestions.length}</p>
              <button
                type="button"
                onClick={resetQuiz}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                ابدأ من جديد
              </button>
            </div>
          ) : currentQuizQuestion ? (
            <>
              <h3 className="text-lg font-black leading-8">{currentQuizQuestion.question}</h3>
              <div className="mt-4 grid gap-2">
                {currentQuizQuestion.options.map((option, index) => {
                  const isCorrect = quizAnswer !== null && index === currentQuizQuestion.correctIndex;
                  const isWrongChoice = quizAnswer === index && !isCorrect;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={quizAnswer !== null}
                      onClick={() => chooseQuizAnswer(index)}
                      className={`rounded-xl border p-3 text-right text-sm transition ${
                        isCorrect
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                          : isWrongChoice
                            ? 'border-rose-400/40 bg-rose-500/10 text-rose-100'
                            : 'border-white/10 bg-black/20 text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {quizAnswer !== null && (
                <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs leading-6 text-slate-300">
                  {quizAnswer === currentQuizQuestion.correctIndex ? 'إجابة صحيحة! ' : 'ولا يهمك. '}
                  {currentQuizQuestion.explanation}
                  <button
                    type="button"
                    onClick={continueQuiz}
                    className="mt-3 block rounded-lg bg-rose-700 px-4 py-2 font-bold text-white hover:bg-rose-600"
                  >
                    {quizIndex === quizQuestions.length - 1 ? 'عرض النتيجة' : 'السؤال التالي'}
                  </button>
                </div>
              )}
            </>
          ) : null}
          <p className="mt-5 text-[10px] text-slate-500">أسئلة الاختبار مأخوذة من ملفات غير مراجعة كنسيًا.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-xl">
          <div className="flex min-h-[360px] max-h-[58vh] flex-col overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="m-auto max-w-xl py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-black">ابدأ بسؤال عن الدرس أو الكنيسة</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  الإجابة تتكيّف مع المرحلة، وتعرض بطاقة اليوم عند توفرها.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {QUICK_QUESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendQuestion(suggestion)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-500/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${
                        message.role === 'user'
                          ? 'border border-rose-400/20 bg-rose-950/50 text-rose-50'
                          : 'border border-white/10 bg-slate-900 text-slate-100'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-7">{message.text}</div>
                      {message.role === 'assistant' && (
                        <>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 border-t border-white/10 pt-2">
                              <p className="mb-1 text-[10px] font-bold text-slate-400">مصادر الويب</p>
                              <ul className="space-y-1">
                                {message.sources.map((source) => (
                                  <li key={source.url}>
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-sky-300 underline decoration-sky-300/40 underline-offset-2"
                                    >
                                      {source.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2">
                            <button
                              type="button"
                              onClick={() => readAnswerAloud(message.text)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                              استمع
                            </button>
                            <button
                              type="button"
                              disabled={reportedIds.includes(message.id)}
                              onClick={() => void reportAnswer(message.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-slate-400 hover:bg-white/5 hover:text-white disabled:text-emerald-300"
                            >
                              <Flag className="h-3.5 w-3.5" />
                              {reportedIds.includes(message.id) ? 'تم الإبلاغ' : 'إبلاغ عن إجابة'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-xs text-slate-400">
                      <LoaderCircle className="h-4 w-4 animate-spin text-rose-300" />
                      المرشد يكتب…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendQuestion(question);
            }}
            className="border-t border-white/10 bg-slate-900/80 p-3 sm:p-4"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion(question);
                  }
                }}
                maxLength={500}
                rows={2}
                placeholder="اكتب سؤالك هنا… (500 حرف كحد أقصى)"
                aria-label="اكتب سؤالك للمرشد"
                className="min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-rose-400/50 focus:outline-none"
              />
              <div className="flex flex-col items-center gap-1">
                <button
                  type="submit"
                  disabled={!question.trim() || isSending || authState !== 'ready'}
                  aria-label="إرسال السؤال"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-700 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
                <span className="text-[9px] text-slate-500">{question.length}/500</span>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
            بيانات السجل لا تُرسل تلقائيًا؛ لا تضع أسماءً أو أرقامًا في السؤال. المحادثة غير محفوظة بعد إغلاق التبويب.
            </p>
          </form>
        </div>
      )}

      {snapshot && (
        <p className="text-center text-[10px] text-slate-500">
          بطاقة اليوم {toArabicDate(snapshot.gregorian)} · التقويم المحسوب تنبيه إرشادي وليس إعلانًا كنسيًا رسميًا.
        </p>
      )}
    </section>
  );
};
