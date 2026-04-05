"use client";

import { useMemo } from "react";
import { CalendarViewType, CalendarEvent } from "./types";
import { DAYS_DB, MONTHS } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { AGENDA_CONFIG, UNAVAILABILITY_TYPE_LABELS } from "./constants";
import { UnavailabilityData } from "./types";
import AgendaHeader from "./components/AgendaHeader";
import AgendaGrid from "./components/AgendaGrid";
import TimeSlot from "./components/TimeSlot";
import TimeIndicator from "./components/TimeIndicator";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
  filters: { showAppointments: boolean; showUnavailabilities: boolean; showCancelled: boolean };
  onFiltersChange: (filters: { showAppointments: boolean; showUnavailabilities: boolean; showCancelled: boolean }) => void;
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
  filters,
  onFiltersChange,
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
      return dateStart === eventStartDate ? eventStart.getHours() === hour : hour === AGENDA_CONFIG.START_HOUR;
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
        <div className="flex-1 overflow-y-auto relative">
          {/* Header sticky inside scrollable container to align with content scrollbar */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 bg-gray-50/50 sticky top-0 z-30">
            <div className="h-14 bg-gray-50/50" />
            {weekDays.map((day, i) => (
              <div key={i} className="h-14 flex flex-col items-center justify-center font-semibold text-gray-700 border-l border-gray-100 bg-gray-50/50">
                <span className="text-[10px] uppercase text-gray-400">{DAYS[day.getDay() === 0 ? 6 : day.getDay() - 1]}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-lg ${isToday(day) ? "bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center -mb-1" : ""}`}>{day.getDate()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            {(() => {
              const todayIndex = weekDays.findIndex(d => isToday(d));
              if (todayIndex !== -1) {
                return (
                  <div
                    className="absolute pointer-events-none z-20 h-full"
                    style={{
                      left: `calc(60px + ${todayIndex} * (100% - 60px) / 7)`,
                      width: `calc((100% - 60px) / 7)`
                    }}
                  >
                    <TimeIndicator showLabel={false} />
                  </div>
                );
              }
              return null;
            })()}
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
      </div>
    );
  };

  const getEventsForDay = (day: Date) => {
    const dayStart = new Date(day).setHours(0, 0, 0, 0);
    const dayEnd = new Date(day).setHours(23, 59, 59, 999);
    return events.filter(event => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      return eventStart <= dayEnd && eventEnd >= dayStart;
    });
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
          {monthDays.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const appointments = dayEvents.filter(e => e.type === "appointment");
            const unavailabilities = dayEvents.filter(e => e.type === "unavailability");
            const isUnavailable = unavailabilities.length > 0;

            return (
              <div
                key={i}
                className={`border-b border-l border-gray-50 p-1 min-h-[100px] flex flex-col gap-0.5 ${!day ? "bg-gray-50/50" : "hover:bg-primary/5 cursor-pointer"
                  }`}
                onClick={() => day && (onDateChange(day), onViewChange("day"))}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold self-start ${isToday(day) ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
                      {day.getDate()}
                    </span>

                    {/* Unavailability indicator */}
                    {unavailabilities.map((unav, idx) => {
                      const unavData = unav.data as UnavailabilityData;
                      const label = UNAVAILABILITY_TYPE_LABELS[unavData.unavailability_type] || "Indisponible";
                      return (
                        <div key={`unav-${idx}`} className="text-[9px] lg:text-[10px] bg-red-100 text-red-700 rounded px-1 py-0.5 font-semibold truncate flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          {label}
                        </div>
                      );
                    })}

                    {/* Appointment dots/labels */}
                    {appointments.slice(0, 3).map((apt, idx) => {
                      const isCancelled = (apt.data as any)?.status === "cancelled";
                      return (
                        <div
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); onEventClick(apt); }}
                          className={cn(
                            "text-[9px] lg:text-[10px] rounded px-1 py-0.5 font-medium truncate cursor-pointer transition-colors flex items-center gap-0.5",
                            isCancelled 
                              ? "bg-gray-100 text-gray-400 line-through opacity-70 border border-gray-200" 
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            isCancelled ? "bg-gray-300" : "bg-primary"
                          )} />
                          {isCancelled && <span className="mr-0.5 text-[8px] font-bold">[X]</span>}
                          <span className="truncate">{(apt.data as any).client_name} - {apt.title}</span>
                        </div>
                      );
                    })}
                    {appointments.length > 3 && (
                      <div className="text-[9px] text-gray-400 px-1">+{appointments.length - 3} autre{appointments.length - 3 > 1 ? "s" : ""}</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
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
        filters={filters}
        onFiltersChange={onFiltersChange}
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
