
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "my-anime-journey-calendar-reminders";

export default function AnimeCalendar({ tracked = [], onOpenAnime }) {
  const [reminders, setReminders] = useState([]);
  const [ready, setReady] = useState(false);
  const [selectedAnimeId, setSelectedAnimeId] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setReminders(parsed);
      }
    } catch (error) {
      console.error("Could not load calendar reminders:", error);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error("Could not save calendar reminders:", error);
    }
  }, [reminders, ready]);

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const sortedReminders = [...reminders].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const visibleReminders = sortedReminders.filter((item) => {
    if (filter === "upcoming") return item.date >= todayString;
    if (filter === "past") return item.date < todayString;
    return true;
  });

  function addReminder(event) {
    event.preventDefault();

    const animeItem = tracked.find(
      (item) => String(item.malId) === selectedAnimeId
    );

    if (!animeItem || !reminderDate) return;

    setReminders((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        animeId: String(animeItem.malId),
        animeTitle: animeItem.title,
        imageUrl: animeItem.imageUrl || "",
        date: reminderDate,
        note: reminderNote.trim() || "Anime reminder",
      },
    ]);

    setReminderDate("");
    setReminderNote("");
  }

  function removeReminder(id) {
    setReminders((current) => current.filter((item) => item.id !== id));
  }

  function formatDate(dateString) {
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <section className="library-section calendar-page">
      <p className="section-kicker">YOUR PERSONAL ANIME SCHEDULE</p>
      <h1 className="library-title">
        Anime Calendar <span>◷</span>
      </h1>
      <p className="muted">
        Plan your anime sessions, save reminders and keep your next adventure
        on schedule.
      </p>

      <div className="calendar-stats">
        <article className="calendar-stat">
          <span>◷</span>
          <p>All reminders</p>
          <strong>{reminders.length}</strong>
        </article>
        <article className="calendar-stat">
          <span>✦</span>
          <p>Upcoming</p>
          <strong>
            {reminders.filter((item) => item.date >= todayString).length}
          </strong>
        </article>
        <article className="calendar-stat">
          <span>✓</span>
          <p>Tracked anime</p>
          <strong>{tracked.length}</strong>
        </article>
      </div>

      <div className="calendar-panel">
        <p className="section-kicker">PLAN YOUR NEXT SESSION</p>
        <h2>Create a reminder</h2>

        {tracked.length === 0 ? (
          <p className="muted">
            Pehle Anime Library se anime ko Watchlist ya Favourites mein add
            karo. Phir yahan reminder bana sakte ho.
          </p>
        ) : (
          <form className="calendar-form" onSubmit={addReminder}>
            <label htmlFor="calendar-anime">Choose anime</label>
            <select
              id="calendar-anime"
              value={selectedAnimeId}
              onChange={(event) => setSelectedAnimeId(event.target.value)}
              required
            >
              <option value="">Select tracked anime</option>
              {tracked.map((item) => (
                <option key={item.malId} value={String(item.malId)}>
                  {item.title}
                </option>
              ))}
            </select>

            <label htmlFor="calendar-date">Reminder date</label>
            <input
              id="calendar-date"
              type="date"
              min={todayString}
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
              required
            />

            <label htmlFor="calendar-note">What do you want to remember?</label>
            <input
              id="calendar-note"
              type="text"
              maxLength={100}
              placeholder="e.g. Watch episode 5"
              value={reminderNote}
              onChange={(event) => setReminderNote(event.target.value)}
            />

            <button className="primary-button" type="submit">
              + Save Reminder
            </button>
          </form>
        )}
      </div>

      <div className="calendar-list-heading">
        <div>
          <p className="section-kicker">YOUR PERSONAL SCHEDULE</p>
          <h2>Saved reminders</h2>
        </div>
        <select
          aria-label="Filter reminders"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All reminders</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      {!ready ? (
        <p className="status-message">Loading your calendar...</p>
      ) : visibleReminders.length === 0 ? (
        <div className="empty-watchlist">
          <div className="empty-heart">◷</div>
          <h2>Your calendar is waiting</h2>
          <p className="muted">
            Save your first reminder above to start planning your anime
            sessions.
          </p>
        </div>
      ) : (
        <div className="calendar-reminder-list">
          {visibleReminders.map((item) => (
            <article className="calendar-reminder" key={item.id}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" loading="lazy" />
              ) : (
                <div className="calendar-reminder-placeholder">✦</div>
              )}

              <div className="calendar-reminder-info">
                <span className="calendar-date">{formatDate(item.date)}</span>
                <h3>{item.animeTitle}</h3>
                <p className="muted">{item.note}</p>
                {item.date < todayString && (
                  <span className="calendar-past-label">Date passed</span>
                )}
                {onOpenAnime && (
                  <button
                    className="calendar-text-button"
                    onClick={() => {
                      const animeItem = tracked.find(
                        (anime) => String(anime.malId) === item.animeId
                      );
                      if (animeItem) onOpenAnime(animeItem);
                    }}
                  >
                    View anime →
                  </button>
                )}
              </div>

              <button
                className="calendar-delete"
                onClick={() => removeReminder(item.id)}
                aria-label={`Delete reminder for ${item.animeTitle}`}
                title="Delete reminder"
              >
                ×
              </button>
            </article>
          ))}
        </div>
      )}

      <p className="calendar-disclaimer">
        These are personal reminders saved in this browser, not official anime
        release dates or automatic notifications.
      </p>
    </section>
  );
}
