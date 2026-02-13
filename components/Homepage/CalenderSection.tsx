'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, CalendarEvent } from '@/lib/supabase';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CALENDAR_HISTORY_YEARS = 1;
const CALENDAR_FUTURE_YEARS = 1;
const CALENDAR_FETCH_LIMIT = 300;

type CalendarEventWithMeta = CalendarEvent & {
    startDate: Date | null;
    timeLabel: string;
};

function parseEventStart(event: CalendarEvent): Date | null {
    const rawValue = event.start_at;
    if (!rawValue) return null;

    const parsed = new Date(rawValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimeLabel(date: Date | null): string {
    if (!date) return '--:--';

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildCalendarDays(year: number, month: number): Date[] {
    const firstDayOfMonth = new Date(year, month, 1);
    const mondayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const startDate = new Date(year, month, 1 - mondayIndex);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });
}

export default function CalendarSection() {
    const todayMonthStart = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }, []);
    const minViewDate = useMemo(
        () => new Date(todayMonthStart.getFullYear() - CALENDAR_HISTORY_YEARS, 0, 1),
        [todayMonthStart]
    );
    const maxViewDate = useMemo(
        () => new Date(todayMonthStart.getFullYear() + CALENDAR_FUTURE_YEARS, 11, 1),
        [todayMonthStart]
    );

    const [events, setEvents] = useState<CalendarEventWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMeta | null>(null);
    const [viewDate, setViewDate] = useState<Date>(todayMonthStart);

    useEffect(() => {
        async function fetchCalendarEvents() {
            try {
                const fetchStartDate = new Date(minViewDate.getFullYear(), 0, 1).toISOString();
                const fetchEndDate = new Date(maxViewDate.getFullYear() + 1, 0, 1).toISOString();

                const { data, error } = await supabase
                    .from('CalendarEvents')
                    .select('id,title,start_at,organizer_department')
                    .gte('start_at', fetchStartDate)
                    .lt('start_at', fetchEndDate)
                    .limit(CALENDAR_FETCH_LIMIT)
                    .order('start_at', { ascending: true });

                if (error) throw error;

                const normalizedEvents = (data ?? []).map((event) => {
                    const startDate = parseEventStart(event);
                    return {
                        ...event,
                        startDate,
                        timeLabel: formatTimeLabel(startDate),
                    };
                });

                setEvents(normalizedEvents);
            } catch (err) {
                console.error('Error fetching calendar events:', err);
                setError(err instanceof Error ? err.message : 'Failed to load calendar events');
            } finally {
                setLoading(false);
            }
        }

        fetchCalendarEvents();
    }, [maxViewDate, minViewDate]);

    useEffect(() => {
        if (!selectedEvent) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedEvent(null);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleEscape);
        };
    }, [selectedEvent]);

    const activeViewDate = viewDate;
    const calendarMonth = activeViewDate.getMonth();
    const calendarYear = activeViewDate.getFullYear();

    function shiftMonth(offset: number) {
        setViewDate((current) => {
            const nextViewDate = new Date(current.getFullYear(), current.getMonth() + offset, 1);
            if (nextViewDate < minViewDate) return minViewDate;
            if (nextViewDate > maxViewDate) return maxViewDate;
            return nextViewDate;
        });
    }

    const calendarDays = useMemo(
        () => buildCalendarDays(calendarYear, calendarMonth),
        [calendarMonth, calendarYear]
    );

    const monthlyEvents = useMemo(
        () =>
            events.filter(
                (event) =>
                    event.startDate &&
                    event.startDate.getFullYear() === calendarYear &&
                    event.startDate.getMonth() === calendarMonth
            ),
        [events, calendarMonth, calendarYear]
    );

    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEventWithMeta[]>();

        monthlyEvents.forEach((event) => {
            if (!event.startDate) return;
            const key = toDateKey(event.startDate);
            const currentEvents = map.get(key);
            if (currentEvents) {
                currentEvents.push(event);
            } else {
                map.set(key, [event]);
            }
        });

        return map;
    }, [monthlyEvents]);

    const isAtMinMonth =
        calendarYear === minViewDate.getFullYear() && calendarMonth === minViewDate.getMonth();
    const isAtMaxMonth =
        calendarYear === maxViewDate.getFullYear() && calendarMonth === maxViewDate.getMonth();

    const monthLabel = useMemo(
        () =>
            new Intl.DateTimeFormat('en-US', {
                month: 'short',
            }).format(new Date(calendarYear, calendarMonth, 1)),
        [calendarMonth, calendarYear]
    );

    const selectedEventDateTime = useMemo(() => {
        if (!selectedEvent?.startDate) return '-';

        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(selectedEvent.startDate);
    }, [selectedEvent]);

    if (loading) {
        return (
            <section className="relative mb-20 pt-32 md:pt-48 lg:pt-64 pb-20 md:pb-32 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-neutral-600">Loading calendar...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative mb-20 pt-32 md:pt-48 lg:pt-64 pb-20 md:pb-32 bg-white">
                <div className="container">
                    <div className="text-center">
                        <p className="text-red-600">Error: {error}</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="calendar" className="relative pt-10 sm:pt-15 md:pt-20 lg:pt-20 pb-10 md:pb-15 bg-white border-t border-b border-black">
            <div className="container">
                <div className="text-center mb-10 md:mb-14">
                    <h2
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900"
                        style={{ fontFamily: 'var(--font-bentham)' }}
                    >
                        Kalender Kegiatan
                    </h2>
                </div>

                <div className="max-w-7xl mx-auto border border-neutral-300 bg-white">
                    <div className="flex items-end justify-between gap-4 px-4 sm:px-8 md:px-12 py-6 md:py-8 border-b border-neutral-300">
                        <div className="flex items-end gap-4">
                            <h3
                                className="text-5xl sm:text-6xl md:text-7xl text-neutral-900 leading-none"
                                style={{ fontFamily: 'var(--font-bentham)' }}
                            >
                                {monthLabel}
                            </h3>
                            <p className="text-2xl md:text-3xl text-neutral-500 leading-none">{calendarYear}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                aria-label="Previous month"
                                disabled={isAtMinMonth}
                                className={`h-9 w-9 border border-neutral-400 text-neutral-700 transition-colors ${
                                    isAtMinMonth
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'hover:bg-neutral-900 hover:text-white'
                                }`}
                            >
                                &#8592;
                            </button>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                aria-label="Next month"
                                disabled={isAtMaxMonth}
                                className={`h-9 w-9 border border-neutral-400 text-neutral-700 transition-colors ${
                                    isAtMaxMonth
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'hover:bg-neutral-900 hover:text-white'
                                }`}
                            >
                                &#8594;
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 px-2 sm:px-4 md:px-6 py-3 md:py-4 border-b border-neutral-300">
                        {WEEK_DAYS.map((day) => (
                            <p key={day} className="text-center text-xs sm:text-sm text-neutral-500 font-medium">
                                {day}
                            </p>
                        ))}
                    </div>

                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, index) => {
                            const key = toDateKey(day);
                            const dayEvents = eventsByDate.get(key) ?? [];
                            const isCurrentMonth = day.getMonth() === calendarMonth;
                            const isLastColumn = (index + 1) % 7 === 0;

                            return (
                                <div
                                    key={key}
                                    className={`min-h-24 sm:min-h-28 md:min-h-32 px-2 py-2 sm:px-3 sm:py-3 border-b border-neutral-300 ${isLastColumn ? '' : 'border-r border-neutral-300'} ${isCurrentMonth ? 'bg-white' : 'bg-neutral-50'}`}
                                >
                                    <p className={`text-sm sm:text-base font-semibold ${isCurrentMonth ? 'text-neutral-900' : 'text-neutral-300'}`}>
                                        {day.getDate()}
                                    </p>
                                    <div className="mt-2 space-y-1">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <button
                                                key={event.id}
                                                type="button"
                                                onClick={() => setSelectedEvent(event)}
                                                className="block w-full rounded border border-neutral-200 px-1.5 py-1 text-left transition-colors hover:bg-neutral-100 hover:border-neutral-300"
                                            >
                                                <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-900 truncate">
                                                    {event.timeLabel} - {event.title}
                                                </p>
                                                <p className="text-[10px] sm:text-[11px] text-neutral-600 truncate">
                                                    {event.organizer_department}
                                                </p>
                                            </button>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <p className="text-[10px] sm:text-xs text-neutral-500">
                                                +{dayEvents.length - 2} kegiatan lainnya
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <p className="mt-5 text-center text-sm md:text-base text-neutral-600">
                    {monthlyEvents.length > 0
                        ? `Menampilkan ${monthlyEvents.length} kegiatan pada ${monthLabel} ${calendarYear}.`
                        : 'Belum ada kegiatan terjadwal pada bulan ini.'}
                </p>

                <div className="mt-10 md:mt-14 text-center">
                    <Link
                        href="https://www.instagram.com/hmit_uinantasari"
                        className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-neutral-900 text-neutral-900 font-semibold text-lg transition-all duration-300 hover:bg-neutral-900 hover:text-white"
                    >
                        Lihat Semua Kegiatan
                        <svg
                            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    onClick={() => setSelectedEvent(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Detail kegiatan kalender"
                >
                    <div
                        className="relative w-full max-w-md overflow-hidden border border-neutral-200 bg-white p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute bottom-1 right-0 opacity-70" aria-hidden="true">
                            <Image
                                src="/Ykiri.svg"
                                alt=""
                                width={120}
                                height={120}
                            />
                        </div>

                        <div className="relative z-10 flex items-start justify-between gap-4">
                            <h3
                                className="text-2xl text-neutral-900"
                                style={{ fontFamily: 'var(--font-bentham)' }}
                            >
                                {selectedEvent.title}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setSelectedEvent(null)}
                                className="h-8 w-8 border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white"
                                aria-label="Tutup detail kegiatan"
                            >
                                ×
                            </button>
                        </div>

                        <div className="relative z-10 mt-5 space-y-3">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-neutral-500">Waktu</p>
                                <p className="text-sm md:text-base text-neutral-900">{selectedEventDateTime}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-neutral-500">Penyelenggara</p>
                                <p className="text-sm md:text-base text-neutral-900">
                                    {selectedEvent.organizer_department}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
