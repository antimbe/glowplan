"use client";

import { useMemo } from "react";
import { Clock, User, Ban } from "lucide-react";
import { CalendarViewType, CalendarEvent, AppointmentData, UnavailabilityData, UnavailabilityType } from "./types";
import { DAYS_DB, MONTHS } from "@/lib/utils/formatters";
import AgendaHeader from "./components/AgendaHeader";
import AgendaGrid from "./components/AgendaGrid";

const UNAVAILABILITY_TYPE_LABELS: Record<UnavailabilityType, string> = {
  vacation: "Vacances",
  training: "Formation",
  illness: "Maladie",
  event: "Événement",
  other: "Indisponible",
};

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7h à 19h
const DAYS = DAYS_DB.map(d => d.substring(0, 3));
const DAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];

export default function CalendarView({
  events,
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onEventClick,
  onSlotClick,
}: CalendarViewProps) {

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() - 1);
    else if (view === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") newDate.setDate(newDate.getDate() + 1);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => onDateChange(new Date());

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSlotUnavailable = (date: Date, hour: number) => {
    const slotStart = new Date(date).setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date).setHours(hour + 1, 0, 0, 0);

    return events.find(event => {
      if (event.type !== "unavailability") return false;
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      return slotStart < eventEnd && slotEnd > eventStart;
    });
  };

  const getEventsStartingAtHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      if (event.type === "appointment") {
        return eventStart.toDateString() === date.toDateString() && eventStart.getHours() === hour;
      }
      // Indisponibilités
      const dateStart = new Date(date).setHours(0, 0, 0, 0);
      const eventStartDate = new Date(event.start).setHours(0, 0, 0, 0);
      const eventEndDate = new Date(event.end).setHours(0, 0, 0, 0);
      if (dateStart < eventStartDate || dateStart > eventEndDate) return false;
      return dateStart === eventStartDate ? eventStart.getHours() === hour : hour === 7;
    });
  };

  const formatDateHeader = (short = false) => {
    if (view === "day") {
      if (short) return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()].slice(0, 3)}`;
      return `${DAYS[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]} ${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (view === "week") {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      if (short) return `${start.getDate()} - ${end.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)}`;
      return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)} ${start.getFullYear()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const renderEventPositioned = (event: CalendarEvent, slotHour: number, cellHeight: number, currentDay: Date) => {
    const isAppointment = event.type === "appointment";
    const start = new Date(event.start);
    const end = new Date(event.end);

    let startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();

    if (!isAppointment) {
      const dayStart = new Date(currentDay).setHours(0, 0, 0, 0);
      const eventStartDay = new Date(event.start).setHours(0, 0, 0, 0);
      const eventEndDay = new Date(event.end).setHours(0, 0, 0, 0);
      if (dayStart === eventStartDay) endMinutes = 20 * 60;
      else if (dayStart === eventEndDay) startMinutes = 7 * 60;
      else { startMinutes = 7 * 60; endMinutes = 20 * 60; }
    }

    const topPercent = ((startMinutes - slotHour * 60) / 60) * 100;
    const heightPercent = ((endMinutes - startMinutes) / 60) * 100;

    const data = event.data as any;
    const typeLabel = !isAppointment ? (UNAVAILABILITY_TYPE_LABELS[data.unavailability_type] || "Indisponible") : "";

    return (
      <div
        key={event.id}
        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
        className={`absolute left-0.5 right-0.5 rounded-md cursor-pointer hover:shadow-lg transition-all overflow-hidden ${isAppointment ? "bg-gradient-to-r from-primary to-primary/80 border-l-2 border-primary-dark z-20" : "bg-gradient-to-r from-red-500 to-red-400 border-l-2 border-red-600 z-10"
          } text-white text-[10px] lg:text-xs px-1.5 py-0.5`}
        style={{ top: `${topPercent}%`, height: `${heightPercent}%`, minHeight: '20px' }}
      >
        <div className="font-semibold truncate flex items-center gap-1">
          {isAppointment ? <User size={10} /> : <Ban size={10} />}
          {event.title || typeLabel}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    // ... Gardé pour l'instant dans le fichier pour simplicité du portage ...
    // Note: On pourrait aussi l'extraire si besoin plus tard.
    const monthDays = getMonthDays();
    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {DAYS.map((day, i) => (
            <div key={day} className="h-10 lg:h-12 flex items-center justify-center text-[10px] lg:text-xs font-semibold text-gray-400 border-l border-gray-100 first:border-l-0 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {monthDays.map((day, i) => (
            <div key={i} className={`border-b border-l border-gray-50 p-1 min-h-[100px] ${!day ? "bg-gray-50/50" : "hover:bg-primary/5 cursor-pointer"}`}
              onClick={() => day && (onDateChange(day), onViewChange("day"))}>
              {day && <span className={`text-xs font-bold ${isToday(day) ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>{day.getDate()}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <AgendaHeader
        currentDate={currentDate}
        view={view}
        formatDateHeader={formatDateHeader}
        onNavigatePrev={navigatePrev}
        onNavigateNext={navigateNext}
        onGoToToday={goToToday}
        onViewChange={onViewChange}
      />
      <div className="flex-1 overflow-hidden">
        {view === "day" && (
          <AgendaGrid
            currentDate={currentDate}
            hours={HOURS}
            isSlotUnavailable={isSlotUnavailable}
            getEventsStartingAtHour={getEventsStartingAtHour}
            renderEventPositioned={renderEventPositioned}
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            isToday={isToday}
            MONTHS={MONTHS}
          />
        )}
        {view === "week" && (
          <div className="p-4 text-center text-gray-400">Vue semaine en cours de raccordement... (Utilisez "Jour")</div>
        )}
        {view === "month" && renderMonthView()}
      </div>
    </div>
  );
}
