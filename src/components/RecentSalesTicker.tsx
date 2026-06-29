import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { fetchRecentActivity } from '../lib/api';
import type { RecentActivity } from '../types';

const EMAIL_DOMAINS = ['wp.pl', 'proton.me', 'proton.mail', 'gmail.com', 'o2.pl', 'interia.pl'];

function generateAnonymousEmail(): string {
  const randomChars = Math.random().toString(36).substring(2, 8);
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${randomChars}@${domain}`;
}

function formatTimeAgo(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'przed chwilą';
  if (minutes < 60) return `${minutes} min temu`;

  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  if (hours < 24) {
    return remainMin > 0
      ? `${hours} godz ${remainMin} min temu`
      : `${hours} godz temu`;
  }

  const days = Math.floor(hours / 24);
  return `${days} dn temu`;
}

export default function RecentSalesTicker() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [timeLabel, setTimeLabel] = useState('');
  const [anonymousEmails, setAnonymousEmails] = useState<Record<string, string>>({});

  const loadActivities = useCallback(async () => {
    try {
      const data = await fetchRecentActivity();
      const thirteenHoursAgo = Date.now() - 13 * 60 * 60 * 1000;
      const recentData = data.filter(
        (item) => new Date(item.created_at).getTime() > thirteenHoursAgo
      );
      if (recentData.length > 0) setActivities(recentData);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadActivities();
    const reloadInterval = setInterval(loadActivities, 5 * 60 * 1000);
    return () => clearInterval(reloadInterval);
  }, [loadActivities]);

  useEffect(() => {
    if (activities.length === 0) return;

    const newEmails: Record<string, string> = {};
    activities.forEach((activity) => {
      if (!anonymousEmails[activity.id]) {
        newEmails[activity.id] = generateAnonymousEmail();
      }
    });
    if (Object.keys(newEmails).length > 0) {
      setAnonymousEmails((prev) => ({ ...prev, ...newEmails }));
    }

    setTimeLabel(formatTimeAgo(activities[0].created_at));
    setVisible(true);

    const rotateInterval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % activities.length;
          setTimeLabel(formatTimeAgo(activities[next].created_at));
          return next;
        });
        setVisible(true);
      }, 400);
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentIndex((prev) => {
        setTimeLabel(formatTimeAgo(activities[prev].created_at));
        return prev;
      });
    }, 60000);

    return () => {
      clearInterval(rotateInterval);
      clearInterval(timeInterval);
    };
  }, [activities]);

  if (activities.length === 0) return null;

  const current = activities[currentIndex];
  const currentEmail = current ? anonymousEmails[current.id] : '';

  return (
    <div className="bg-zinc-900/80 border-b border-zinc-800/50 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-center gap-2">
        <ShoppingBag className="h-3 w-3 text-neon-green shrink-0" />
        <p
          className={`font-mono text-[11px] text-zinc-400 transition-all duration-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <span className="text-zinc-500">***{currentEmail?.split('@')[1]}</span>
          <span className="text-zinc-500"> kupił </span>
          <span className="text-neon-green font-bold">{current?.product_name}</span>
          <span className="text-zinc-600"> — {timeLabel}</span>
        </p>
      </div>
    </div>
  );
}
