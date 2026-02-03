"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User, Ban } from "lucide-react";
import { Button } from "@/components/ui";
import { CalendarViewType, CalendarEvent, AppointmentData, UnavailabilityData } from "./types";

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  view: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h à 20h
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

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
    
    // Jours du mois précédent
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventsForHour = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      return eventStart < slotEnd && eventEnd > slotStart;
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
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)} ${start.getFullYear()}`;
    }
    if (short) return `${MONTHS[currentDate.getMonth()].slice(0, 3)} ${currentDate.getFullYear()}`;
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderEvent = (event: CalendarEvent, compact = false) => {
    const isAppointment = event.type === "appointment";
    
    if (compact) {
      return (
        <div
          key={event.id}
          onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
          className={`${
            isAppointment 
              ? "bg-gradient-to-r from-primary to-primary/80 border-l-2 border-primary-dark" 
              : "bg-gradient-to-r from-red-500 to-red-400 border-l-2 border-red-600"
          } text-white text-[10px] lg:text-xs px-1.5 py-0.5 rounded-md truncate cursor-pointer hover:shadow-md transition-all`}
        >
          {event.title}
        </div>
      );
    }

    const start = new Date(event.start);
    const end = new Date(event.end);
    
    return (
      <div
        key={event.id}
        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
        className={`${
          isAppointment 
            ? "bg-gradient-to-r from-primary to-primary/80 border-l-3 border-primary-dark" 
            : "bg-gradient-to-r from-red-500 to-red-400 border-l-3 border-red-600"
        } text-white text-xs px-2.5 py-1.5 rounded-lg cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all mb-1`}
      >
        <div className="font-semibold truncate flex items-center gap-1">
          {isAppointment ? <User size={10} /> : <Ban size={10} />}
          {event.title}
        </div>
        <div className="opacity-90 flex items-center gap-1 mt-0.5">
          <Clock size={10} />
          {start.getHours().toString().padStart(2, "0")}:{start.getMinutes().toString().padStart(2, "0")} - 
          {end.getHours().toString().padStart(2, "0")}:{end.getMinutes().toString().padStart(2, "0")}
        </div>
      </div>
    );
  };

  // Vue Jour
  const renderDayView = () => (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-[60px_1fr] border-b border-gray-100 bg-gray-50/50">
        <div className="h-14" />
        <div className="h-14 flex items-center justify-center font-semibold text-gray-700 border-l border-gray-100">
          {isToday(currentDate) && (
            <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1 rounded-full text-sm mr-2 shadow-sm">Aujourd'hui</span>
          )}
          <span className="text-lg">{currentDate.getDate()}</span>
          <span className="text-gray-500 ml-1">{MONTHS[currentDate.getMonth()].slice(0, 3)}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-[60px_1fr] min-h-[70px] border-b border-gray-50 hover:bg-primary/[0.02] transition-colors">
            <div className="text-xs text-gray-400 text-right pr-3 pt-2 font-medium">
              {hour.toString().padStart(2, "0")}:00
            </div>
            <div 
              className="border-l border-gray-100 p-1.5 cursor-pointer relative group"
              onClick={() => {
                const slotDate = new Date(currentDate);
                slotDate.setHours(hour, 0, 0, 0);
                onSlotClick(slotDate);
              }}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg" />
              <div className="relative z-10">
                {getEventsForHour(currentDate, hour).map(event => renderEvent(event))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Vue Semaine (Desktop)
  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-gradient-to-b from-gray-50 to-white z-10">
              <tr className="border-b border-gray-100">
                <th className="w-[40px] lg:w-[60px] h-12 lg:h-14 border-r border-gray-100" />
                {weekDays.map((day, i) => (
                  <th 
                    key={i} 
                    className={`h-12 lg:h-14 text-center border-r border-gray-100 transition-colors ${
                      isToday(day) ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-[10px] lg:text-xs text-gray-400 font-medium hidden lg:block uppercase tracking-wide">{DAYS[i]}</span>
                    <span className="text-[10px] lg:hidden text-gray-400 font-medium">{DAYS_SHORT[i]}</span>
                    <span className={`text-sm lg:text-base font-bold block mt-0.5 ${
                      isToday(day) 
                        ? "text-white bg-primary w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mx-auto" 
                        : "text-gray-700"
                    }`}>
                      {day.getDate()}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="w-[40px] lg:w-[60px] text-[10px] lg:text-xs text-gray-400 text-right pr-2 lg:pr-3 pt-1.5 border-r border-gray-100 align-top h-[45px] lg:h-[55px] font-medium">
                    {hour.toString().padStart(2, "0")}:00
                  </td>
                  {weekDays.map((day, i) => (
                    <td 
                      key={i}
                      className={`border-r border-gray-100 p-0.5 lg:p-1 cursor-pointer align-top h-[45px] lg:h-[55px] transition-colors ${
                        isToday(day) ? "bg-primary/[0.03]" : "hover:bg-primary/[0.02]"
                      }`}
                      onClick={() => {
                        const slotDate = new Date(day);
                        slotDate.setHours(hour, 0, 0, 0);
                        onSlotClick(slotDate);
                      }}
                    >
                      {getEventsForHour(day, hour).map(event => renderEvent(event, true))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Vue Mois
  const renderMonthView = () => {
    const monthDays = getMonthDays();
    
    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {DAYS.map((day, i) => (
            <div key={day} className="h-10 lg:h-12 flex items-center justify-center text-[10px] lg:text-xs font-semibold text-gray-400 border-l border-gray-100 first:border-l-0 uppercase tracking-wide">
              <span className="hidden lg:block">{day}</span>
              <span className="lg:hidden">{DAYS_SHORT[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
          {monthDays.map((day, i) => (
            <div 
              key={i}
              className={`border-b border-l border-gray-50 p-1 lg:p-1.5 min-h-[60px] lg:min-h-[90px] transition-colors ${
                day ? "hover:bg-primary/[0.02] cursor-pointer" : "bg-gray-50/50"
              } ${day && isToday(day) ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}`}
              onClick={() => day && onSlotClick(day)}
            >
              {day && (
                <>
                  <div className={`text-xs lg:text-sm font-semibold mb-1 ${
                    isToday(day) 
                      ? "text-white bg-primary w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center" 
                      : "text-gray-700"
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden max-h-[35px] lg:max-h-[65px]">
                    {getEventsForDate(day).slice(0, window.innerWidth < 1024 ? 1 : 3).map(event => renderEvent(event, true))}
                    {getEventsForDate(day).length > (window.innerWidth < 1024 ? 1 : 3) && (
                      <span className="text-[10px] lg:text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full w-fit">+{getEventsForDate(day).length - (window.innerWidth < 1024 ? 1 : 3)}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl lg:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white gap-2 lg:gap-0">
        {/* Navigation */}
        <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-3">
          <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
            <button
              onClick={navigatePrev}
              className="w-8 h-8 rounded-md hover:bg-primary/5 flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={navigateNext}
              className="w-8 h-8 rounded-md hover:bg-primary/5 flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs lg:text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors border border-primary/20"
          >
            Aujourd'hui
          </button>
          <h2 className="text-sm lg:text-lg font-bold text-gray-800 lg:ml-2">
            <span className="hidden lg:inline">{formatDateHeader()}</span>
            <span className="lg:hidden">{formatDateHeader(true)}</span>
          </h2>
        </div>

        {/* View switcher */}
        <div className="flex bg-gray-100/80 rounded-xl p-1 shadow-inner">
          {(["day", "week", "month"] as CalendarViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={`flex-1 lg:flex-none px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                view === v 
                  ? "bg-white text-primary shadow-md" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              {v === "day" ? "Jour" : v === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-hidden">
        {view === "day" && renderDayView()}
        {view === "week" && renderWeekView()}
        {view === "month" && renderMonthView()}
      </div>
    </div>
  );
}
