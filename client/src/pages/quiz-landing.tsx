import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Quiz, { QuizAnswers } from "@/components/Quiz";
import LeadForm from "@/components/LeadForm";
import DisqualifiedMessage from "@/components/DisqualifiedMessage";
import { useToast } from "@/hooks/use-toast";
import { usePageView, trackEvent } from "@/hooks/useAnalytics";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ChevronRight, Users, Star, TrendingUp, Clock, Target, Coins, GraduationCap, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function LiveCounter() {
  const [count, setCount] = useState(Math.floor(Math.random() * 8) + 18);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(12, Math.min(35, newCount));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <Users className="h-3 w-3 text-primary" />
      <span className="text-xs text-foreground font-medium">{count} Personen machen gerade den Test</span>
    </div>
  );
}


const benefits = [
  { icon: Coins, title: "Umsatzgarantie", description: "Du erhältst eine klare Garantie" },
  { icon: GraduationCap, title: "Komplette Schulung", description: "Umfassende Ausbildung inklusive" },
  { icon: Target, title: "KI gestützt", description: "Lerne wie du KI richtig nutzt" },
  { icon: Clock, title: "Flexible Zeiten", description: "Arbeite wann du willst" },
  { icon: TrendingUp, title: "Wachsender Markt", description: "Explodierender KI-Markt" },
  { icon: HeadphonesIcon, title: "1:1 Support", description: "Persönlicher Ansprechpartner" },
];


type FunnelState = "quiz" | "form" | "disqualified";

interface UTMParams {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export default function QuizLandingPage() {
  const [funnelState, setFunnelState] = useState<FunnelState>("quiz");
  const [isLoading, setIsLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const quizRef = useRef<HTMLDivElement>(null);
  const [utmParams, setUtmParams] = useState<UTMParams>({
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
  });

  usePageView('quiz-landing');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utmSource: params.get("utm_source"),
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
      utmContent: params.get("utm_content"),
      utmTerm: params.get("utm_term"),
    });

    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }
  }, []);

  const scrollToQuiz = () => {
    quizRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuizComplete = (answers: QuizAnswers) => {
    setQuizAnswers(answers);
    setFunnelState("form");
    trackEvent('quiz_complete', { answers });
  };

  const handleDisqualify = () => {
    setFunnelState("disqualified");
    trackEvent('quiz_disqualified');
  };

  const handleFormSubmit = async (data: { name: string; email: string; countryCode: string; phone: string }) => {
    setIsLoading(true);
    try {
      const fullPhone = `${data.countryCode} ${data.phone}`;
      await apiRequest("POST", "/api/leads", {
        name: data.name,
        email: data.email,
        phone: fullPhone,
        utmSource: utmParams.utmSource,
        utmMedium: utmParams.utmMedium,
        utmCampaign: utmParams.utmCampaign,
        utmContent: utmParams.utmContent,
        utmTerm: utmParams.utmTerm,
        source: "Quiz Funnel",
        quizAnswers: quizAnswers,
      });

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", {
          content_name: "Quiz Optin",
          utm_source: utmParams.utmSource,
        });
      }

      toast({
        title: "Erfolgreich!",
        description: "Du wirst jetzt zum Video weitergeleitet.",
      });

      setTimeout(() => {
        setLocation("/vsl");
      }, 1000);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Fehler",
        description: "Etwas ist schief gelaufen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Kompakt mit direktem CTA */}
      <section className="relative flex flex-col items-center justify-center px-3 pt-8 pb-3 sm:px-4 sm:pt-12 sm:pb-4 md:pt-16 md:pb-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[200px] sm:h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 w-full">
          <div className="mb-2 sm:mb-3">
            <LiveCounter />
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-2 sm:mb-3 px-2">
            Finde in <span className="text-primary">30 Sekunden</span> heraus, ob du dafür geeignet bist.
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-muted-foreground text-[10px] sm:text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary flex
