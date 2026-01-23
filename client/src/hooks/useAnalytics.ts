import { useEffect, useRef } from 'react';

function getVisitorId(): string {
  const key = 'ki_visitor_id';
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
}

export function usePageView(page: string) {
  const tracked = useRef(false);
  
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    
    const visitorId = getVisitorId();
    
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        page,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }, [page]);
}

export function trackEvent(eventType: string, eventData?: Record<string, any>, page?: string) {
  const visitorId = getVisitorId();
  
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visitorId,
      eventType,
      eventData: eventData ? JSON.stringify(eventData) : null,
      page: page || window.location.pathname,
    }),
  }).catch(console.error);
}

export function useQuizTracking() {
  return {
    trackQuizStart: () => trackEvent('quiz_start'),
    trackQuizStep: (step: number, answer: string) => trackEvent('quiz_step', { step, answer }),
    trackQuizComplete: () => trackEvent('quiz_complete'),
    trackQuizDisqualified: (step: number, answer: string) => trackEvent('quiz_disqualified', { step, answer }),
  };
}
