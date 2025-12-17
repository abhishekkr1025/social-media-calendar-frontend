import { useState } from "react";
import DraggablePost from "./DraggablePost";

function MonthCalendar({ posts, onDateClick, calendarDate }) {






  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayIndex = firstDayOfMonth.getDay(); // 0 (Sun) → 6 (Sat)
  const totalDays = lastDayOfMonth.getDate();

  const days = [];

  // ⬅️ Empty cells before first day
  for (let i = 0; i < startDayIndex; i++) {
    days.push(null);
  }

  // 🗓️ Actual days
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  const isToday = (dateObj) => {
    const today = new Date();
    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    );
  };

  function toLocalDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }




  return (
    <div>
      {/* Week headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div
            key={d}
            className="text-center text-sm font-medium text-gray-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((dateObj, index) => {
          if (!dateObj) {
            return <div key={index} />;
          }

          const dateStr = toLocalDateString(dateObj);

          const postsForDate = posts.filter(p => p.date === dateStr);

          return (
            <div
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={`border rounded-lg min-h-[110px] p-2 cursor-pointer transition
    hover:bg-blue-50
    ${isToday(dateObj) ? "border-blue-500 bg-blue-50 ring-2 ring-blue-400" : ""}
  `}
            >

              <div className="text-xs font-semibold text-gray-700">
                {dateObj.getDate()}
              </div>

              {postsForDate.map(p => (
                <DraggablePost key={p.id} post={p} />
              ))}


              {postsForDate.length > 2 && (
                <div className="text-xs text-gray-400 mt-1">
                  +{postsForDate.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default MonthCalendar;

