import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Announcement {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdByName: string;
  createdAt: Date;
}

interface AnnouncementBarProps {
  districtId?: string;
}

export function AnnouncementBar({ districtId }: AnnouncementBarProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const params = districtId ? `?districtId=${districtId}` : '';
      const response = await fetch(`/api/announcements${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [districtId]);

  // Ensure currentIndex is always within bounds when announcements change
  useEffect(() => {
    if (announcements.length === 0) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      return;
    }

    setCurrentIndex((prev) => (prev >= announcements.length ? 0 : prev));
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  if (dismissed || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`${getPriorityColors(currentAnnouncement.priority)} px-4 py-2 relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm shrink-0">
              {currentAnnouncement.priority === 'high' && '🔴 URGENT:'}
              {currentAnnouncement.priority === 'medium' && '⚠️ IMPORTANT:'}
              {currentAnnouncement.priority === 'low' && 'ℹ️ NOTICE:'}
            </span>
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-sm">
                {currentAnnouncement.message}
                {' — '}
                <span className="italic">
                  {currentAnnouncement.createdByName}
                </span>
              </span>
            </div>
          </div>
        </div>

        {announcements.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs opacity-75">
              {currentIndex + 1} / {announcements.length}
            </span>
          </div>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
