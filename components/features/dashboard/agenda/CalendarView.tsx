"use client";

import { useMemo } from "react";
import { CalendarViewType, CalendarEvent } from "./types";
import { DAYS_DB, MONTHS } from "@/lib/utils/formatters";
import { AGENDA_CONFIG } from "./constants";
import AgendaHeader from "./components/AgendaHeader";
import AgendaGrid from "./components/AgendaGrid";
import TimeSlot from "./components/TimeSlot";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
}

const HOURS = Array.from(
  { length: AGENDA_CONFIG.END_HOUR - AGENDA_CONFIG.START_HOUR + 1 },
  (_, i) => i + AGENDA_CONFIG.START_HOUR
);
const DAYS = DAYS_DB.map(d => d.substring(0, 3));

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

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 bg-gray-50/50">
          <div className="h-14" />
          {weekDays.map((day, i) => (
            <div key={i} className="h-14 flex flex-col items-center justify-center font-semibold text-gray-700 border-l border-gray-100">
              <span className="text-[10px] uppercase text-gray-400">{DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}</span>
              <div className="flex items-center gap-1">
                <span className={`text-lg ${isToday(day) ? "bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center -mb-1" : ""}`}>{day.getDate()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] group">
              <div className="text-[10px] text-gray-400 text-right pr-3 pt-2 font-medium border-b border-gray-50 h-[70px]">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day, i) => {
                const unavailableSlot = isSlotUnavailable(day, hour);
                const slotEvents = getEventsStartingAtHour(day, hour);
                return (
                  <div key={i} className="border-l border-b border-gray-50 relative h-[70px]">
                    <TimeSlot
                      hour={hour}
                      currentDay={day}
                      unavailableSlot={unavailableSlot}
                      slotEvents={slotEvents}
                      showTimeColumn={false}
                      onSlotClick={(h) => {
                        const slotDate = new Date(day);
                        slotDate.setHours(h, 0, 0, 0);
                        onSlotClick(slotDate);
                      }}
                      onEventClick={onEventClick}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
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
            onSlotClick={onSlotClick}
            onEventClick={onEventClick}
            isToday={isToday}
            MONTHS={MONTHS}
          />
        )}
        {view === "week" && renderWeekView()}
        {view === "month" && renderMonthView()}
      </div>
    </div>
  );
}
