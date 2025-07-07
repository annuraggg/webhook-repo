import { useEffect, useRef, useState } from "react";
import axios from "axios";
import EventItem from "./components/EventItem";
import { FiGithub, FiLoader } from "react-icons/fi";

type EventType = {
  type: string;
  author: string;
  from_branch?: string;
  to_branch?: string;
  timestamp: string;
  action?: string;
  _id?: string;
};

function App() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mergeNewEvents = (newEvents: EventType[]) => {
    if (events.length === 0) {
      setEvents(newEvents);
      return;
    }
    const existingIds = new Set(events.map((e) => e._id || e.timestamp));
    const newUnique = newEvents.filter(
      (e) => !existingIds.has(e._id || e.timestamp)
    );
    if (newUnique.length > 0) {
      setEvents((prev) => [...newUnique, ...prev]);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/webhook/events`);
      const sortedEvents = res.data.sort(
        (a: EventType, b: EventType) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      mergeNewEvents(sortedEvents);
    } catch (err) {
      console.error("Error fetching events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    intervalRef.current = setInterval(fetchEvents, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#191724] via-[#232136] to-[#1f1d2e] p-0 md:p-8 transition-all duration-300">
      <div className="max-w-3xl mx-auto py-10 relative">
        <header className="flex flex-col items-center mb-10">
          <FiGithub className="text-6xl text-[#eb6f92] mb-2 drop-shadow" />
          <h1 className="text-4xl font-extrabold mb-2 text-[#e0def4] tracking-tight text-center drop-shadow">
            GitHub Webhook Events
          </h1>
        </header>
        {/* Top right loading spinner */}
        <div className="absolute top-6 right-8 z-30">
          {loading && (
            <FiLoader
              className="text-2xl text-[#eb6f92] animate-spin"
              title="Updating..."
            />
          )}
        </div>
        <section className="w-full min-h-[320px] transition-all">
          {events.length === 0 ? (
            <div className="flex flex-col items-center py-14 text-[#6e6a86]">
              <span className="text-lg font-semibold">No events yet.</span>
              <span className="text-sm mt-1">Activity will appear here.</span>
            </div>
          ) : (
            <div>
              {events.map((event) => (
                <EventItem key={event._id || event.timestamp} {...event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
