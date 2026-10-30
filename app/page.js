
"use client";

import { useEffect, useMemo, useState } from "react";
import AnimeCalendar from "./calendar";

const API = "https://jikan.lucashdo.com/v1";

const STORAGE_KEYS = {
  watchlist: "my-anime-journey-watchlist",
  favourites: "my-anime-journey-favourites",
  progress: "my-anime-journey-progress",
};
const THEME_STORAGE_KEY = "my-anime-journey-theme";

const ANIME_THEMES = {
  dark: {
    label: "Dark",
    emoji: "🌙",
    background: "#100d1c",
    surface: "#1b1630",
    accent: "#a78bfa",
    text: "#f5f3ff",
  },
  naruto: {
    label: "Naruto",
    emoji: "🍥",
    background: "#1c100b",
    surface: "#302018",
    accent: "#ff8c32",
    text: "#fff4e8",
  },
  onepiece: {
    label: "One Piece",
    emoji: "☠️",
    background: "#081522",
    surface: "#10283b",
    accent: "#42c9f5",
    text: "#eaf8ff",
  },
  anime: {
    label: "Anime Mix",
    emoji: "✨",
    background: "#170d24",
    surface: "#29183b",
    accent: "#f472b6",
    text: "#fff0fb",
  },
};
const STATUSES = [
  "Plan to Watch",
  "Watching",
  "Completed",
  "On Hold",
  "Dropped",
];

const TABS = [
  ["Home", "⌂"],
  ["Anime Library", "▧"],
  ["Smart Recommendations", "✦"],
  ["Anime Calendar", "CAL"],
  ["My Watchlist", "♡"],
  ["My Favourites", "♥"],
  ["Characters", "♙"],
  ["Anime Quotes", "❝"],
  ["Anime Themes", "🎨"],
  ["My Dashboard", "◈"],
  ["My Reviews", "✍️"],
  ["Character Universe", "🎭"],
  ["Wallpaper Studio", "🖼️"],
];
function animeId(item) {
  return String(item?.malId ?? "");
}

function sameAnime(a, b) {
  return animeId(a) !== "" && animeId(a) === animeId(b);
}

function safeCount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function getGenres(item) {
  const raw = item?.genres ?? item?.genre ?? [];
  const list = Array.isArray(raw) ? raw : [raw];

  return list
    .map((genre) => {
      if (typeof genre === "string") return genre.trim().toLowerCase();
      return String(genre?.name ?? genre?.title ?? "").trim().toLowerCase();
    })
    .filter(Boolean);
}

function normalizeAnime(item) {
  if (!item || typeof item !== "object") return null;

  const id = item.malId ?? item.mal_id ?? item.id;
  if (id == null) return null;

  const image =
    item.imageUrl ??
    item.image_url ??
    item.images?.jpg?.large_image_url ??
    item.images?.jpg?.image_url ??
    item.images?.webp?.image_url ??
    item.image ??
    "";

  return {
    ...item,
    malId: id,
    title: item.title ?? item.titleEnglish ?? item.title_english ?? "Untitled Anime",
    imageUrl: image,
    episodes: item.episodes ?? null,
    score: item.score ?? null,
    synopsis: item.synopsis ?? "",
    startDate: item.startDate ?? item.aired?.from ?? "",
    rating: item.rating ?? "",
    members: item.members ?? 0,
    genres: item.genres ?? [],
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Home");
  const [theme, setTheme] = useState("dark");
  const [themeReady, setThemeReady] = useState(false);
  const [anime, setAnime] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
const [characterPerspectives, setCharacterPerspectives] = useState([]);
const [wallpapers, setWallpapers] = useState([]);
const [favouriteWallpapers, setFavouriteWallpapers] = useState([]);
const [customBackground, setCustomBackground] = useState("");
const [editingReview, setEditingReview] = useState(null);
const [watchlistFilter, setWatchlistFilter] = useState("All");
const [editingCharacter, setEditingCharacter] = useState(null);
const [expandedCard, setExpandedCard] = useState(null);
const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [watchlist, setWatchlist] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [progress, setProgress] = useState({});
  const [storageReady, setStorageReady] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const [recommendSource, setRecommendSource] = useState("");
  useEffect(() => {
    const selectedTheme = ANIME_THEMES[theme] || ANIME_THEMES.dark;
    const root = document.documentElement;

    root.style.setProperty("--theme-background", selectedTheme.background);
    root.style.setProperty("--theme-surface", selectedTheme.surface);
    root.style.setProperty("--theme-accent", selectedTheme.accent);
    root.style.setProperty("--theme-text", selectedTheme.text);
    root.dataset.animeTheme = theme;
  }, [theme]);
  
  useEffect(() => {
    const root = document.documentElement;

    if (customBackground) {
      root.style.setProperty(
        "--custom-anime-background",
        `url("${customBackground.replace(/["\\]/g, "")}")`
      );
      root.dataset.customBackground = "true";
    } else {
      root.style.removeProperty("--custom-anime-background");
      delete root.dataset.customBackground;
    }

    return () => {
      root.style.removeProperty("--custom-anime-background");
      delete root.dataset.customBackground;
    };
  }, [customBackground]);

  useEffect(() => {
    try {
      const savedReviews = localStorage.getItem("my-anime-reviews");
const savedCharacters = localStorage.getItem("my-character-perspectives");
const savedWallpapers = localStorage.getItem("my-anime-wallpapers");
const savedWallpaperFavourites = localStorage.getItem("my-anime-wallpaper-favourites");
const savedCustomBackground = localStorage.getItem("my-anime-custom-background");

if (savedWallpapers) {
  const parsed = JSON.parse(savedWallpapers);
  if (Array.isArray(parsed)) setWallpapers(parsed);
}

if (savedWallpaperFavourites) {
  const parsed = JSON.parse(savedWallpaperFavourites);
  if (Array.isArray(parsed)) setFavouriteWallpapers(parsed);
}

if (savedCustomBackground) {
  setCustomBackground(savedCustomBackground);
}

if (savedReviews) {
  const parsedReviews = JSON.parse(savedReviews);
  if (Array.isArray(parsedReviews)) {
    setMyReviews(parsedReviews);
  }
}

if (savedCharacters) {
  const parsedCharacters = JSON.parse(savedCharacters);
  if (Array.isArray(parsedCharacters)) {
    setCharacterPerspectives(parsedCharacters);
  }
}
      const savedWatchlist = localStorage.getItem(STORAGE_KEYS.watchlist);
      const savedFavourites = localStorage.getItem(STORAGE_KEYS.favourites);
      const savedProgress = localStorage.getItem(STORAGE_KEYS.progress);

      if (savedWatchlist) {
        const parsed = JSON.parse(savedWatchlist);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed.map(normalizeAnime).filter(Boolean));
        }
      }

      if (savedFavourites) {
        const parsed = JSON.parse(savedFavourites);
        if (Array.isArray(parsed)) {
          setFavourites(parsed.map(normalizeAnime).filter(Boolean));
        }
      }

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setProgress(parsed);
        }
      }
    } catch (err) {
      console.error("Could not load saved anime data:", err);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    try {
      localStorage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(watchlist));
      localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify(favourites));
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
      localStorage.setItem("my-anime-wallpapers", JSON.stringify(wallpapers));
localStorage.setItem("my-anime-wallpaper-favourites", JSON.stringify(favouriteWallpapers));
localStorage.setItem("my-anime-custom-background", customBackground);
    } catch (err) {
      console.error("Could not save anime data:", err);
    }
  }, [
  watchlist,
  favourites,
  progress,
  wallpapers,
  favouriteWallpapers,
  customBackground,
  storageReady,
]);
  useEffect(() => {
  if (!storageReady) return;

  try {
    localStorage.setItem(
      "my-anime-reviews",
      JSON.stringify(myReviews)
    );

    localStorage.setItem(
      "my-character-perspectives",
      JSON.stringify(characterPerspectives)
    );
  } catch (err) {
    console.error("Could not save reviews and characters:", err);
  }
}, [myReviews, characterPerspectives, storageReady]);
   useEffect(() => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme && ANIME_THEMES[savedTheme]) {
      setTheme(savedTheme);
    }
  } catch (err) {
    console.error("Could not load anime theme:", err);
  } finally {
    setThemeReady(true);
  }
}, []);

  useEffect(() => {
  if (!themeReady) return;

  try {
    if (ANIME_THEMES[theme]) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch (err) {
    console.error("Could not save anime theme:", err);
  }
}, [theme, themeReady]);
  async function fetchAnime(searchTerm) {
    const response = await fetch(
      `${API}/anime?q=${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
      throw new Error("Anime API request failed");
    }

    const result = await response.json();
    const data = Array.isArray(result.data) ? result.data : [];

    return data.map(normalizeAnime).filter(Boolean);
  }

  async function loadAnime(search = "Naruto") {
    setLoading(true);
    setError("");
    setSelectedAnime(null);

    try {
      const results = await fetchAnime(search.trim() || "Naruto");
      setAnime(results);
      if (results.length === 0) setError("Koi anime nahi mila. Dusra search try karo.");
    } catch (err) {
      console.error(err);
      setError("Anime load nahi ho paaye. API connection check karke dobara try karo.");
      setAnime([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnime("Naruto");
  }, []);

  function openTab(tab) {
    setActiveTab(tab);
    setSelectedAnime(null);

    if (tab === "Anime Library" && anime.length === 0 && !loading) {
      loadAnime("Naruto");
    }

    if (tab === "Smart Recommendations") {
      buildRecommendations();
    }
  }

  function openAnime(item) {
    setSelectedAnime(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isSaved(list, item) {
    return list.some((saved) => sameAnime(saved, item));
  }

  function toggleList(listName, item) {
    const setter = listName === "watchlist" ? setWatchlist : setFavourites;
    const currentList = listName === "watchlist" ? watchlist : favourites;

    if (isSaved(currentList, item)) {
      setter((current) => current.filter((saved) => !sameAnime(saved, item)));
    } else {
      setter((current) => [...current, item]);
    }
  }

  function getRecord(item) {
    return progress[animeId(item)] || {
      anime: item,
      status: "Plan to Watch",
      watchedEpisodes: 0,
    };
  }

  function updateProgress(item, changes) {
    const id = animeId(item);
    if (!id) return;

    setProgress((current) => {
      const previous = current[id] || {
        anime: item,
        status: "Plan to Watch",
        watchedEpisodes: 0,
      };

      const next = { ...previous, ...changes, anime: item };
      const total = safeCount(item.episodes);

      next.watchedEpisodes = Math.min(
        safeCount(next.watchedEpisodes),
        total > 0 ? total : Number.MAX_SAFE_INTEGER
      );

      if (
        total > 0 &&
        next.watchedEpisodes >= total &&
        next.status === "Watching"
      ) {
        next.status = "Completed";
      }

      return { ...current, [id]: next };
    });
  }

  function setStatus(item, status) {
    updateProgress(item, { status });
  }

  function setWatchedEpisodes(item, value) {
    const total = safeCount(item.episodes);
    const watched = total > 0
      ? Math.min(safeCount(value), total)
      : safeCount(value);

    updateProgress(item, {
      watchedEpisodes: watched,
      status:
        total > 0 && watched >= total
          ? "Completed"
          : watched > 0
            ? "Watching"
            : getRecord(item).status,
    });
  }

  const tracked = useMemo(() => {
    const items = new Map();

    watchlist.forEach((item) => items.set(animeId(item), item));
    favourites.forEach((item) => items.set(animeId(item), item));

    Object.values(progress).forEach((record) => {
      if (record?.anime?.malId != null) {
        items.set(animeId(record.anime), normalizeAnime(record.anime));
      }
    });

    items.delete("");
    return Array.from(items.values()).filter(Boolean);
  }, [watchlist, favourites, progress]);

  const completedCount = tracked.filter(
    (item) => getRecord(item).status === "Completed"
  ).length;

  const watchingCount = tracked.filter(
    (item) => getRecord(item).status === "Watching"
  ).length;

  const planCount = tracked.filter(
    (item) => getRecord(item).status === "Plan to Watch"
  ).length;

  const onHoldCount = tracked.filter(
    (item) => getRecord(item).status === "On Hold"
  ).length;

  const droppedCount = tracked.filter(
    (item) => getRecord(item).status === "Dropped"
  ).length;

  const totalEpisodesWatched = tracked.reduce(
    (sum, item) => sum + safeCount(getRecord(item).watchedEpisodes),
    0
  );

  const estimatedWatchMinutes = totalEpisodesWatched * 24;
  const estimatedWatchHours = Math.floor(estimatedWatchMinutes / 60);
  const estimatedWatchDays = Math.floor(estimatedWatchHours / 24);
  const knownEpisodes = tracked.reduce(
    (sum, item) => sum + safeCount(item.episodes),
    0
  );

  const overallPercent = knownEpisodes > 0
    ? Math.min(100, Math.round((totalEpisodesWatched / knownEpisodes) * 100))
    : 0;

  // Build suggestions from your saved anime's genres and related search terms.
  async function buildRecommendations() {
    setRecommendLoading(true);
    setRecommendError("");

    try {
      const tasteList = [...favourites, ...watchlist];
      const preferredGenres = new Map();

      tasteList.forEach((item) => {
        getGenres(item).forEach((genre) => {
          preferredGenres.set(genre, (preferredGenres.get(genre) || 0) + 1);
        });
      });

      const sortedGenres = Array.from(preferredGenres.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre);

      const source = tasteList[0] || tracked[0] || anime[0] || null;
      const searchTerms = [];

      // A genre is used as a search term only if genre metadata exists.
      sortedGenres.slice(0, 3).forEach((genre) => searchTerms.push(genre));

      if (source?.title) {
        searchTerms.push(source.title);
      }

      // Popular fallback searches keep recommendations useful for new users.
      ["One Piece", "Fullmetal Alchemist", "Frieren", "Demon Slayer"].forEach(
        (term) => searchTerms.push(term)
      );

      const uniqueTerms = [...new Set(searchTerms)].slice(0, 5);
      const batches = await Promise.allSettled(
        uniqueTerms.map((term) => fetchAnime(term))
      );

      const pool = new Map();

      batches.forEach((batch) => {
        if (batch.status !== "fulfilled") return;

        batch.value.forEach((item) => {
          const id = animeId(item);
          if (id) pool.set(id, item);
        });
      });

      const excluded = new Set([
        ...watchlist.map(animeId),
        ...favourites.map(animeId),
        ...tracked.map(animeId),
      ]);

      const candidates = Array.from(pool.values()).filter(
        (item) => !excluded.has(animeId(item))
      );

      candidates.sort((a, b) => {
        const score = (item) => {
          const genreScore = getGenres(item).reduce(
            (sum, genre) => sum + (preferredGenres.get(genre) || 0) * 5,
            0
          );
          const ratingScore = Number(item.score) || 0;
          return genreScore + ratingScore;
        };

        return score(b) - score(a);
      });

      setRecommendations(candidates.slice(0, 18));
      setRecommendSource(
        tasteList.length > 0
          ? "Personalized using your saved anime and available genre data."
          : "Starter recommendations. Save favourites or watchlist anime to personalize future suggestions."
      );

      if (candidates.length === 0) {
        setRecommendError(
          "Abhi recommendations nahi mil paayi. Internet connection check karo ya Refresh Recommendations dabao."
        );
      }
    } catch (err) {
      console.error(err);
      setRecommendError("Recommendations load nahi ho paayi. Dobara try karo.");
    } finally {
      setRecommendLoading(false);
    }
  }

  function progressPercent(item) {
    const total = safeCount(item.episodes);
    const watched = safeCount(getRecord(item).watchedEpisodes);
    if (!total) return 0;
    return Math.min(100, Math.round((watched / total) * 100));
  }

  function renderAnimeCard(item, reason = "") {
    const saved = isSaved(watchlist, item);
    const favourite = isSaved(favourites, item);
    const record = getRecord(item);

    return (
      <article className="anime-card-wrap" key={animeId(item)}>
        <button
          type="button"
          className="anime-card"
          onClick={() => openAnime(item)}
          aria-label={`View details for ${item.title}`}
        >
          <div className="poster-wrap">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} loading="lazy" />
            ) : (
              <div className="poster-placeholder">✦</div>
            )}
            <span className="poster-score">★ {item.score ?? "N/A"}</span>
          </div>

          <div className="anime-card-info">
            <h3>{item.title}</h3>
            <p>{item.type || "Anime"} · {item.episodes ?? "?"} eps</p>
            {reason && <p className="recommend-reason">{reason}</p>}
          </div>
        </button>

        <div className="card-actions">
          <button
            type="button"
            className={`action-button ${saved ? "is-saved" : ""}`}
            onClick={() => toggleList("watchlist", item)}
            aria-pressed={saved}
          >
            {saved ? "✓ Watchlist" : "+ Watchlist"}
          </button>

          <button
            type="button"
            className={`heart-button ${favourite ? "is-favourite" : ""}`}
            onClick={() => toggleList("favourites", item)}
            aria-label={favourite ? "Remove favourite" : "Add favourite"}
            aria-pressed={favourite}
          >
            {favourite ? "♥" : "♡"}
          </button>
        </div>

        <div className="card-status">
          <label htmlFor={`status-${animeId(item)}`}>Status</label>
          <select
            id={`status-${animeId(item)}`}
            value={record.status}
            onChange={(event) => setStatus(item, event.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </article>
    );
  }

  function renderDetail(backLabel) {
    if (!selectedAnime) return null;

    const item = selectedAnime;
    const saved = isSaved(watchlist, item);
    const favourite = isSaved(favourites, item);
    const record = getRecord(item);
    const total = safeCount(item.episodes);
    const watched = safeCount(record.watchedEpisodes);
    const percent = progressPercent(item);

    return (
      <article className="anime-detail">
        <button
          type="button"
          className="detail-close"
          onClick={() => setSelectedAnime(null)}
        >
          â† Back to {backLabel}
        </button>

        <div className="detail-layout">
          {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}

          <div className="detail-copy">
            <p className="section-kicker">YOUR ANIME UNIVERSE</p>
            <h2>{item.title}</h2>
            <p className="detail-score">★ {item.score ?? "N/A"} / 10</p>
            <p className="detail-meta">{item.type || "Anime"} · {item.episodes ?? "?"} episodes</p>
            <p className="detail-synopsis">{item.synopsis || "No synopsis available."}</p>
            <p className="detail-meta">Start date: {item.startDate || "Unknown"}</p>
            <p className="detail-meta">Rating: {item.rating || "Not available"}</p>
            <p className="detail-meta">Genres: {getGenres(item).join(", ") || "Not available"}</p>

            <div className="detail-actions">
              <button
                type="button"
                className={`primary-button ${saved ? "button-saved" : ""}`}
                onClick={() => toggleList("watchlist", item)}
              >
                {saved ? "✓ In Watchlist â€” Remove" : "+ Add to Watchlist"}
              </button>
              <button
                type="button"
                className={`secondary-button ${favourite ? "favourite-active" : ""}`}
                onClick={() => toggleList("favourites", item)}
              >
                {favourite ? "♥ Favourite â€” Remove" : "♡ Add to Favourites"}
              </button>
            </div>

            <div className="tracker-panel">
              <h3>My Anime Progress</h3>
              <label htmlFor={`detail-status-${animeId(item)}`}>Watching status</label>
              <select
                id={`detail-status-${animeId(item)}`}
                value={record.status}
                onChange={(event) => setStatus(item, event.target.value)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="episode-heading">
                <label htmlFor={`episodes-${animeId(item)}`}>Episodes watched</label>
                <span>{watched} / {total || "?"}</span>
              </div>

              <input
                id={`episodes-${animeId(item)}`}
                className="episode-input"
                type="number"
                min="0"
                max={total || undefined}
                value={watched}
                onChange={(event) => setWatchedEpisodes(item, event.target.value)}
              />

              <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <p className="progress-caption">{percent}% complete</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  function renderCollection(title, subtitle, items, kind) {
    return (
      <section className="library-section">
        <p className="section-kicker">
          {kind === "watchlist" ? "YOUR NEXT ADVENTURE" : "ANIME CLOSE TO YOUR HEART"}
        </p>
        <h1 className="library-title">{title} <span>{kind === "watchlist" ? "♡" : "♥"}</span></h1>
        <p className="muted">{items.length} anime · {subtitle}</p>
        {kind === "watchlist" && (
  <div className="watchlist-filters">
    {["All", "Plan to Watch", "Watching", "Completed", "On Hold", "Dropped"].map((status) => {
      const count = status === "All"
        ? items.length
        : items.filter((item) => getRecord(item).status === status).length;

      return (
        <button
          key={status}
          type="button"
          className={`watchlist-filter ${watchlistFilter === status ? "active" : ""}`}
          onClick={() => setWatchlistFilter(status)}
        >
          {status} <span className="filter-count">{count}</span>
        </button>
      );
    })}
  </div>
)}

        {selectedAnime && renderDetail(kind === "watchlist" ? "watchlist" : "favourites")}

        {!selectedAnime && items.length > 0 && (
          <div className="anime-grid">
  {(kind === "watchlist"
    ? items.filter((item) => {
        if (watchlistFilter === "All") return true;
        return getRecord(item).status === watchlistFilter;
      })
    : items
  ).map((item) => renderAnimeCard(item))}
</div>
        )}

        {!selectedAnime && items.length === 0 && (
          <div className="empty-watchlist">
            <div className="empty-heart">{kind === "watchlist" ? "♡" : "♥"}</div>
            <h2>{kind === "watchlist" ? "Your watchlist is waiting" : "No favourites just yet"}</h2>
            <p className="muted">
              {kind === "watchlist"
                ? "Explore anime and add shows you want to watch."
                : "Find an anime you love and tap the heart to save it here."}
            </p>
            <button className="primary-button" onClick={() => openTab("Anime Library")}>
              Explore Anime â†—
            </button>
          </div>
        )}
      </section>
    );
  }

  function renderRecommendations() {
    return (
      <section className="library-section">
        <p className="section-kicker">CURATED FOR YOUR TASTE</p>
        <h1 className="library-title">Smart Recommendations <span>✦</span></h1>
        <p className="muted">
          Discover your next favourite anime using your saved collection and available genre data.
        </p>

        <div className="recommendation-banner">
          <div>
            <p className="section-kicker">YOUR PERSONAL ANIME RADAR</p>
            <h2>Find your next obsession.</h2>
            <p className="muted">
              Save favourites and watchlist anime to make suggestions more personal.
            </p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={buildRecommendations}
            disabled={recommendLoading}
          >
            {recommendLoading ? "Finding anime..." : "â†» Refresh Recommendations"}
          </button>
        </div>

        {recommendSource && <p className="recommend-source">{recommendSource}</p>}

        {recommendLoading && (
          <p className="status-message">Finding anime for your next adventure... âœ¨</p>
        )}

        {recommendError && !recommendLoading && (
          <div className="status-message error-message">
            <p>{recommendError}</p>
            <button className="secondary-button" onClick={buildRecommendations}>
              Try Again â†»
            </button>
          </div>
        )}

        {!recommendLoading && recommendations.length > 0 && (
          <>
            <div className="recommendation-heading">
              <div>
                <p className="section-kicker">SELECTED FOR YOU</p>
                <h2>Recommended For You</h2>
              </div>
              <span>{recommendations.length} anime</span>
            </div>
            <div className="anime-grid">
              {recommendations.map((item) => {
                const shared = getGenres(item).filter((genre) =>
                  [...favourites, ...watchlist].some((saved) =>
                    getGenres(saved).includes(genre)
                  )
                );

                return renderAnimeCard(
                  item,
                  shared.length ? `Because you like ${shared.slice(0, 2).join(", ")}` : "Discover something new"
                );
              })}
            </div>
          </>
        )}

        {!recommendLoading && recommendations.length === 0 && !recommendError && (
          <div className="empty-watchlist">
            <div className="empty-heart">✦</div>
            <h2>Your next anime is waiting</h2>
            <p className="muted">Refresh recommendations to discover anime.</p>
            <button className="primary-button" onClick={buildRecommendations}>
              Find Anime â†—
            </button>
          </div>
        )}
      </section>
    );
  }
const animeQuotes = [
  {
    quote: "If you don't take risks, you can't create a future!",
    character: "Monkey D. Luffy",
    anime: "One Piece",
    image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
  },
  {
    quote: "Hard work is worthless for those that don't believe in themselves.",
    character: "Naruto Uzumaki",
    anime: "Naruto",
    image: "https://cdn.myanimelist.net/images/characters/2/284193.jpg",
  },
  {
    quote: "A lesson without pain is meaningless.",
    character: "Edward Elric",
    anime: "Fullmetal Alchemist",
    image: "https://cdn.myanimelist.net/images/characters/5/54265.jpg",
  },
  {
    quote: "Whatever you lose, you'll find it again.",
    character: "Kenshin Himura",
    anime: "Rurouni Kenshin",
    image: "https://cdn.myanimelist.net/images/characters/8/218145.jpg",
  },
];

function renderMyReviews() {
  const clearReviewForm = () => {
    ["review-anime", "review-image", "review-text"].forEach((id) => {
      document.getElementById(id).value = "";
    });
    document.getElementById("review-rating").value = "5";
    setEditingReview(null);
  };

  const saveReview = () => {
    const name = document.getElementById("review-anime").value.trim();
    const image = document.getElementById("review-image").value.trim();
    const review = document.getElementById("review-text").value.trim();
    const rating = Number(document.getElementById("review-rating").value);

    if (!name || !review) {
      alert("Please enter anime name and your review.");
      return;
    }

    if (editingReview) {
      setMyReviews((previous) =>
        previous.map((item) =>
          item.id === editingReview.id
            ? { ...item, name, image, review, rating, date: new Date().toLocaleDateString() }
            : item
        )
      );
    } else {
      setMyReviews((previous) => [
        ...previous,
        { id: Date.now(), name, image, review, rating, date: new Date().toLocaleDateString() },
      ]);
    }

    clearReviewForm();
  };

  return (
    <section className="library-section">
      <p className="section-kicker">YOUR PERSONAL ANIME JOURNAL</p>
      <h1 className="library-title">My Anime Reviews ✍️</h1>
      <p className="muted">Write honest reviews and save your personal anime experiences.</p>

      <div className="review-form">
        <input type="text" placeholder="Anime name" id="review-anime" />
        <input type="url" placeholder="Anime poster image URL" id="review-image" />
        <textarea placeholder="Write your honest review..." id="review-text" rows="6" />

        <label>Your rating</label>
        <select id="review-rating" defaultValue="5">
          <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
          <option value="4">⭐⭐⭐⭐ 4/5</option>
          <option value="3">⭐⭐⭐ 3/5</option>
          <option value="2">⭐⭐ 2/5</option>
          <option value="1">⭐ 1/5</option>
        </select>

        <button className="primary-button" type="button" onClick={saveReview}>
          {editingReview ? "Update Review" : "Save Review"}
        </button>

        {editingReview && (
          <button className="secondary-button" type="button" onClick={clearReviewForm}>
            Cancel Editing
          </button>
        )}
      </div>

      <div className="anime-grid">
        {myReviews.map((item) => (
          <article
  className="anime-card expandable-card"
  key={item.id}
  onClick={() => setExpandedCard({ type: "review", item })}
  role="button"
  tabIndex={0}
>
            <div className="anime-card-content">
              {item.image && (
                <img src={item.image} alt={`${item.name} poster`}
                  style={{ width: "100%", height: "260px", objectFit: "cover", borderRadius: "14px", marginBottom: "14px" }}
                />
              )}
              <h2>{item.name}</h2>
              <p>⭐ {item.rating}/5</p>
              <p>{item.review}</p>
              <small>{item.date}</small>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                <button className="primary-button" type="button" onClick={() => {
                  event.stopPropagation();
                  document.getElementById("review-anime").value = item.name;
                  document.getElementById("review-image").value = item.image || "";
                  document.getElementById("review-text").value = item.review;
                  document.getElementById("review-rating").value = String(item.rating);
                  setEditingReview(item);
                  document.getElementById("review-anime").scrollIntoView({ behavior: "smooth", block: "center" });
                }}>
                  ✏️ Edit Review
                </button>

                <button className="secondary-button" type="button"
                  onClick={() => setDeleteConfirmation({ type: "review", id: item.id, name: item.name })}>
                  🗑️ Delete Review
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {myReviews.length === 0 && <p className="muted">Your reviews will appear here.</p>}
      {expandedCard?.type === "review" && (
  <div
    className="expanded-card-overlay"
    onClick={() => setExpandedCard(null)}
  >
    <div
      className="expanded-card-modal"
      onClick={(event) => {
  event.stopPropagation();
  setDeleteConfirmation({
    type: "character",
    id: item.id,
    name: item.name
  });
}}
    >
      <button
        className="expanded-card-close"
        type="button"
        onClick={() => setExpandedCard(null)}
      >
        ✕
      </button>

      {expandedCard.item.image && (
        <img
          src={expandedCard.item.image}
          alt={expandedCard.item.name}
          className="expanded-card-image"
        />
      )}

      <p className="section-kicker">YOUR PERSONAL ANIME JOURNAL</p>
      <h2>{expandedCard.item.name}</h2>
      <h3>⭐ {expandedCard.item.rating}/5</h3>
      <p className="expanded-card-description">
        {expandedCard.item.review}
      </p>
      <small>{expandedCard.item.date}</small>
    </div>
  </div>
)}

      {deleteConfirmation?.type === "review" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,3,15,0.85)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "390px", padding: "28px 22px", textAlign: "center", color: "#392313", background: "linear-gradient(135deg,#f8e8bd,#d9b77c)", border: "4px double #8b5427", borderRadius: "12px", boxShadow: "0 0 35px rgba(245,158,11,0.3)" }}>
            <div style={{ fontSize: "42px" }}>⚔️</div>
            <div style={{ fontSize: "12px", letterSpacing: "4px", fontWeight: 900 }}>ROYAL DELETION NOTICE</div>
            <h2 style={{ margin: "12px 0", fontFamily: "serif" }}>A Letter Sealed by the Sword</h2>
            <p>Are you sure you want to erase your review of <strong>{deleteConfirmation.name}</strong>?</p>
            <p style={{ fontSize: "13px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
              <button className="primary-button" type="button" onClick={() => {
                setMyReviews((previous) => previous.filter((item) => item.id !== deleteConfirmation.id));
                if (editingReview?.id === deleteConfirmation.id) {
                  clearReviewForm();
                }
                setDeleteConfirmation(null);
              }}>⚔️ Confirm Delete</button>
              <button className="secondary-button" type="button" onClick={() => setDeleteConfirmation(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}



function renderCharacterUniverse() {
  const clearCharacterForm = () => {
    ["character-name", "character-anime", "character-image", "character-opinion", "character-moments"].forEach((id) => {
      document.getElementById(id).value = "";
    });
    document.getElementById("character-rating").value = "5";
    setEditingCharacter(null);
  };

  const saveCharacter = () => {
    const name = document.getElementById("character-name").value.trim();
    const anime = document.getElementById("character-anime").value.trim();
    const image = document.getElementById("character-image").value.trim();
    const opinion = document.getElementById("character-opinion").value.trim();
    const moments = document.getElementById("character-moments").value.trim();
    const rating = Number(document.getElementById("character-rating").value);

    if (!name || !anime || !opinion) {
      alert("Please enter character name, anime name and your opinion.");
      return;
    }

    if (editingCharacter) {
      setCharacterPerspectives((previous) =>
        previous.map((item) =>
          item.id === editingCharacter.id
            ? { ...item, name, anime, image, opinion, moments, rating }
            : item
        )
      );
    } else {
      setCharacterPerspectives((previous) => [
        ...previous,
        { id: Date.now(), name, anime, image, opinion, moments, rating },
      ]);
    }

    clearCharacterForm();
  };

  return (
    <section className="library-section">
      <p className="section-kicker">BEYOND THE STORY</p>
      <h1 className="library-title">Character Universe 🎭</h1>
      <p className="muted">Your personal thoughts about the characters you love.</p>

      <div className="review-form">
        <input id="character-name" type="text" placeholder="Character name" />
        <input id="character-anime" type="text" placeholder="Anime name" />
        <input id="character-image" type="url" placeholder="Character image URL (optional)" />
        <textarea id="character-opinion" placeholder="What do you honestly think about this character?" rows="5" />
        <textarea id="character-moments" placeholder="Your favourite moments..." rows="3" />

        <label>Your character rating</label>
        <select id="character-rating" defaultValue="5">
          <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
          <option value="4">⭐⭐⭐⭐ 4/5</option>
          <option value="3">⭐⭐⭐ 3/5</option>
          <option value="2">⭐⭐ 2/5</option>
          <option value="1">⭐ 1/5</option>
        </select>

        <button className="primary-button" type="button" onClick={saveCharacter}>
          {editingCharacter ? "Update Character" : "Save Character"}
        </button>

        {editingCharacter && (
          <button className="secondary-button" type="button" onClick={clearCharacterForm}>
            Cancel Editing
          </button>
        )}
      </div>

      <div className="anime-grid">
        {characterPerspectives.map((item) => (
          <article
  className="anime-card expandable-card"
  key={item.id}
  onClick={() => setExpandedCard({ type: "character", item })}
  role="button"
  tabIndex={0}
>
            <div className="anime-card-content">
              {item.image && (
                <img src={item.image} alt={item.name}
                  style={{ width: "100%", maxHeight: "260px", objectFit: "cover", borderRadius: "14px", marginBottom: "14px" }}
                />
              )}
              <h2>{item.name}</h2>
              <p className="muted">{item.anime}</p>
              <p>⭐ {item.rating}/5</p>
              <p>{item.opinion}</p>
              {item.moments && <p><strong>Favourite moments:</strong> {item.moments}</p>}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
                <button className="primary-button" type="button" onClick={() => {
                  document.getElementById("character-name").value = item.name;
                  document.getElementById("character-anime").value = item.anime;
                  document.getElementById("character-image").value = item.image || "";
                  document.getElementById("character-opinion").value = item.opinion;
                  document.getElementById("character-moments").value = item.moments || "";
                  document.getElementById("character-rating").value = String(item.rating);
                  setEditingCharacter(item);
                  document.getElementById("character-name").scrollIntoView({ behavior: "smooth", block: "center" });
                }}>
                  ✏️ Edit Character
                </button>

                <button className="secondary-button" type="button"
                  onClick={() => setDeleteConfirmation({ type: "character", id: item.id, name: item.name })}>
                  🗑️ Delete Character
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {characterPerspectives.length === 0 && <p className="muted">Your character perspectives will appear here.</p>}
{expandedCard?.type === "character" && (
  <div
    className="expanded-card-overlay"
    onClick={() => setExpandedCard(null)}
  >
    <div
      className="expanded-card-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="expanded-card-close"
        type="button"
        onClick={() => setExpandedCard(null)}
      >
        ✕
      </button>

      {expandedCard.item.image && (
        <img
          src={expandedCard.item.image}
          alt={expandedCard.item.name}
          className="expanded-card-image"
        />
      )}

      <p className="section-kicker">BEYOND THE STORY</p>
      <h2>{expandedCard.item.name}</h2>
      <h3>{expandedCard.item.anime}</h3>
      <h3>⭐ {expandedCard.item.rating}/5</h3>

      <h4>My Perspective</h4>
      <p className="expanded-card-description">
        {expandedCard.item.opinion}
      </p>

      {expandedCard.item.moments && (
        <>
          <h4>Favourite Moments</h4>
          <p className="expanded-card-description">
            {expandedCard.item.moments}
          </p>
        </>
      )}
    </div>
  </div>
)}
      {deleteConfirmation?.type === "character" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,3,15,0.85)", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "390px", padding: "28px 22px", textAlign: "center", color: "#392313", background: "linear-gradient(135deg,#f8e8bd,#d9b77c)", border: "4px double #8b5427", borderRadius: "12px", boxShadow: "0 0 35px rgba(245,158,11,0.3)" }}>
            <div style={{ fontSize: "42px" }}>⚔️</div>
            <div style={{ fontSize: "12px", letterSpacing: "4px", fontWeight: 900 }}>ROYAL DELETION NOTICE</div>
            <h2 style={{ margin: "12px 0", fontFamily: "serif" }}>A Letter Sealed by the Sword</h2>
            <p>Are you sure you want to erase <strong>{deleteConfirmation.name}</strong> from your Character Universe?</p>
            <p style={{ fontSize: "13px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "22px" }}>
              <button className="primary-button" type="button" onClick={() => {
                setCharacterPerspectives((previous) => previous.filter((item) => item.id !== deleteConfirmation.id));
                if (editingCharacter?.id === deleteConfirmation.id) {
                  clearCharacterForm();
                }
                setDeleteConfirmation(null);
              }}>⚔️ Confirm Delete</button>
              <button className="secondary-button" type="button" onClick={() => setDeleteConfirmation(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function renderWallpaperStudio() {
  const saveWallpaper = () => {
    const title = document.getElementById("wallpaper-title").value.trim();
    const anime = document.getElementById("wallpaper-anime").value.trim();
    const character = document.getElementById("wallpaper-character").value.trim();
    const image = document.getElementById("wallpaper-image").value.trim();

    if (!title || !anime || !image) {
      alert("Please enter wallpaper title, anime name and image URL.");
      return;
    }

    try {
      new URL(image);
    } catch {
      alert("Please enter a valid image URL.");
      return;
    }

    setWallpapers((previous) => [
      {
        id: Date.now(),
        title,
        anime,
        character,
        image,
      },
      ...previous,
    ]);

    document.getElementById("wallpaper-title").value = "";
    document.getElementById("wallpaper-anime").value = "";
    document.getElementById("wallpaper-character").value = "";
    document.getElementById("wallpaper-image").value = "";
  };

  const toggleWallpaperFavourite = (id) => {
    setFavouriteWallpapers((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const downloadWallpaper = (image, title) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `${title.replace(/[^a-z0-9]/gi, "-")}-wallpaper`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const visibleWallpapers = wallpapers.filter((item) =>
    item.title.toLowerCase().includes(
      document.getElementById("wallpaper-search")?.value?.toLowerCase() || ""
    ) ||
    item.anime.toLowerCase().includes(
      document.getElementById("wallpaper-search")?.value?.toLowerCase() || ""
    ) ||
    (item.character || "").toLowerCase().includes(
      document.getElementById("wallpaper-search")?.value?.toLowerCase() || ""
    )
  );

  return (
    <section className="library-section wallpaper-studio">
      <p className="section-kicker">YOUR PERSONAL ANIME COLLECTION</p>
      <h1 className="library-title">Wallpaper Studio 🖼️</h1>
      <p className="muted">
        Collect your favourite anime wallpapers and customize your universe.
      </p>

      <div className="review-form wallpaper-add-form">
        <h2>＋ Add New Wallpaper</h2>

        <input
          id="wallpaper-title"
          type="text"
          placeholder="Wallpaper title"
        />

        <input
          id="wallpaper-anime"
          type="text"
          placeholder="Anime name"
        />

        <input
          id="wallpaper-character"
          type="text"
          placeholder="Character name (optional)"
        />

        <input
          id="wallpaper-image"
          type="url"
          placeholder="Wallpaper image URL"
        />

        <button
          className="primary-button"
          type="button"
          onClick={saveWallpaper}
        >
          ＋ Add Wallpaper
        </button>
      </div>

      <div className="wallpaper-gallery-heading">
        <div>
          <h2>My Wallpaper Collection</h2>
          <p className="muted">{wallpapers.length} wallpapers collected</p>
        </div>
        <input
          id="wallpaper-search"
          type="search"
          placeholder="Search wallpapers..."
          className="wallpaper-search"
        />
      </div>

      <div className="wallpaper-grid">
        {visibleWallpapers.map((item) => (
          <article className="wallpaper-card" key={item.id}>
            <img
              src={item.image}
              alt={item.title}
              className="wallpaper-thumbnail"
              onClick={() => setExpandedCard({ type: "wallpaper", item })}
            />

            <div className="wallpaper-card-content">
              <h3>{item.title}</h3>
              <p className="muted">{item.anime}</p>
              {item.character && <p className="muted">{item.character}</p>}

              <div className="wallpaper-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => toggleWallpaperFavourite(item.id)}
                >
                  {favouriteWallpapers.includes(item.id) ? "❤️" : "♡"} Favourite
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => downloadWallpaper(item.image, item.title)}
                >
                  ↓ Download
                </button>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => setCustomBackground(item.image)}
                >
                  Set Background
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${item.title}?`)) {
                      setWallpapers((previous) =>
                        previous.filter((wallpaper) => wallpaper.id !== item.id)
                      );
                      setFavouriteWallpapers((previous) =>
                        previous.filter((id) => id !== item.id)
                      );
                    }
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {wallpapers.length === 0 && (
        <p className="muted">
          Your wallpaper collection is empty. Add your first wallpaper above!
        </p>
      )}

      {wallpapers.length > 0 && visibleWallpapers.length === 0 && (
        <p className="muted">No wallpapers match your search.</p>
      )}

      {favouriteWallpapers.length > 0 && (
        <div className="wallpaper-favourites">
          <h2>❤️ My Favourite Wallpapers</h2>
          <div className="wallpaper-grid">
            {wallpapers
              .filter((item) => favouriteWallpapers.includes(item.id))
              .map((item) => (
                <article className="wallpaper-card" key={item.id}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="wallpaper-thumbnail"
                    onClick={() => setExpandedCard({ type: "wallpaper", item })}
                  />
                  <div className="wallpaper-card-content">
                    <h3>{item.title}</h3>
                    <p className="muted">{item.anime}</p>
                  </div>
                </article>
              ))}
          </div>
        </div>
      )}

      {customBackground && (
        <button
          className="secondary-button"
          type="button"
          onClick={() => setCustomBackground("")}
        >
          ↺ Reset Website Background
        </button>
      )}

      {expandedCard?.type === "wallpaper" && (
        <div
          className="wallpaper-preview-overlay"
          onClick={() => setExpandedCard(null)}
        >
          <div
            className="wallpaper-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="expanded-card-close"
              type="button"
              onClick={() => setExpandedCard(null)}
            >
              ✕
            </button>

            <img
              src={expandedCard.item.image}
              alt={expandedCard.item.title}
              className="wallpaper-preview-image"
            />

            <h2>{expandedCard.item.title}</h2>
            <p className="muted">{expandedCard.item.anime}</p>

            <div className="wallpaper-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  setCustomBackground(expandedCard.item.image)
                }
              >
                Set as Website Background
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  toggleWallpaperFavourite(expandedCard.item.id)
                }
              >
                {favouriteWallpapers.includes(expandedCard.item.id)
                  ? "❤️ Remove Favourite"
                  : "♡ Add Favourite"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  downloadWallpaper(
                    expandedCard.item.image,
                    expandedCard.item.title
                  )
                }
              >
                ↓ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function renderAnimeQuotes() {
  const dayIndex = Math.floor(Date.now() / 86400000) % animeQuotes.length;
  const dailyQuote = animeQuotes[dayIndex];

  return (
    <section className="library-section">
      <p className="section-kicker">A LITTLE INSPIRATION, EVERY DAY</p>
      <h1 className="library-title">
        Anime Quotes <span>❝</span>
      </h1>
      <p className="muted">
        Words from anime worlds to inspire your own journey.
      </p>

      <article className="dashboard-progress status-chart">
        <p className="section-kicker">QUOTE OF THE DAY</p>
        <div className="anime-quote-mark">“</div>
        <img
  src={`/characters/${dailyQuote.character === "Monkey D. Luffy"
    ? "luffy.jpg"
    : dailyQuote.character === "Naruto Uzumaki"
    ? "naruto.png"
    : dailyQuote.character === "Edward Elric"
    ? "edward.jpg"
    : "kenshin.jpg"}`}
  alt={dailyQuote.character}
  className="anime-quote-image"
/>
        <blockquote className="anime-quote-text">
          {dailyQuote.quote}
        </blockquote>
        <p className="anime-quote-character">{dailyQuote.character}</p>
        <p className="muted">{dailyQuote.anime}</p>

        <button
          className="primary-button"
          onClick={() => {
            const text = `“${dailyQuote.quote}” — ${dailyQuote.character}, ${dailyQuote.anime}`;
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(text);
            }
          }}
        >
          Copy Quote
        </button>
      </article>
    </section>
  );
}
function renderAnimeThemes() {
  return (
    <section className="library-section">
      <p className="section-kicker">MAKE IT YOUR OWN</p>
      <h1 className="library-title">Anime Themes 🎨</h1>
      <p className="muted">
        Choose the anime universe that matches your mood.
      </p>

      <div className="anime-themes-grid">
        {Object.entries(ANIME_THEMES).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`anime-theme-card ${theme === key ? "selected" : ""}`}
            onClick={() => setTheme(key)}
            style={{
              "--preview-bg": item.background,
              "--preview-surface": item.surface,
              "--preview-accent": item.accent,
              "--preview-text": item.text,
            }}
          >
            <div className="anime-theme-preview">
              <span className="anime-theme-emoji">{item.emoji}</span>
              <span className="anime-theme-preview-title">
                My Anime Journey
              </span>
              <span className="anime-theme-preview-bar" />
              <span className="anime-theme-preview-line" />
            </div>

            <div className="anime-theme-info">
              <span className="anime-theme-name">{item.label}</span>
              <span className="anime-theme-description">
                {key === "dark" && "Classic dark purple"}
                {key === "naruto" && "Ninja orange and black"}
                {key === "onepiece" && "Ocean blue adventure"}
                {key === "anime" && "Neon anime mix"}
              </span>
            </div>

            <span className="anime-theme-select">
              {theme === key ? "✓ Selected" : "Select theme"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
  function renderDashboard() {
    return (
      <section className="library-section">
        <p className="section-kicker">YOUR PERSONAL PROGRESS</p>
        <h1 className="library-title">My Dashboard <span>✦</span></h1>
        <p className="muted">Your anime journey, episode progress and collection statistics.</p>

        <div className="stats-grid">
          {[
            ["▧", "Tracked anime", tracked.length],
            ["✓", "Completed", completedCount],
            ["â–¶", "Currently watching", watchingCount],
            ["◷", "Episodes watched", totalEpisodesWatched],
            ["⌛", "Watch time (hours)", estimatedWatchHours],
            ["♡", "Plan to Watch", planCount],
            ["♥", "Favourites", favourites.length],
          ].map(([icon, label, count]) => (
            <article className="stat-card" key={label}>
              <span>{icon}</span>
              <p>{label}</p>
              <strong>{count}</strong>
            </article>
          ))}
        </div>

        <article className="dashboard-progress">
          <div className="dashboard-progress-heading">
            <div>
              <p className="section-kicker">YOUR OVERALL PROGRESS</p>
              <h2>Keep going, anime explorer!</h2>
            </div>
            <strong>{overallPercent}%</strong>
          </div>
          <div className="progress-track overall-track">
            <div className="progress-fill" style={{ width: `${overallPercent}%` }} />
          </div>
          <p className="muted">
            {totalEpisodesWatched} episodes watched out of {knownEpisodes} known episodes.
          </p>
        </article>
<article className="dashboard-progress status-chart">
  <div className="dashboard-progress-heading">
    <div>
      <p className="section-kicker">COLLECTION BREAKDOWN</p>
      <h2>Your anime at a glance</h2>
    </div>
  </div>

  {[
    ["Watching", watchingCount],
    ["Completed", completedCount],
    ["Plan to Watch", planCount],
    ["On Hold", onHoldCount],
    ["Dropped", droppedCount],
  ].map(([label, count]) => {
    const percent = tracked.length
      ? Math.round((count / tracked.length) * 100)
      : 0;

    return (
      <div className="status-chart-row" key={label}>
        <div className="status-chart-label">
          <span>{label}</span>
          <strong>{count} · {percent}%</strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  })}
</article>
        <div className="status-summary-grid">
          {[["Watching", watchingCount], ["Completed", completedCount], ["Plan to Watch", planCount], ["On Hold", onHoldCount], ["Dropped", droppedCount]].map(([label, count]) => (
            <div className="status-summary" key={label}>
              <span>{label}</span><strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="dashboard-list-heading">
          <div><p className="section-kicker">YOUR TRACKED COLLECTION</p><h2>Continue your journey</h2></div>
          <button className="secondary-button" onClick={() => openTab("Anime Library")}>+ Add anime</button>
        </div>

        {tracked.length === 0 ? (
          <div className="empty-watchlist">
            <div className="empty-heart">✦</div>
            <h2>Your journey starts here</h2>
            <p className="muted">Add anime to your watchlist or favourites to track your progress.</p>
            <button className="primary-button" onClick={() => openTab("Anime Library")}>Explore Anime â†—</button>
          </div>
        ) : (
          <div className="tracked-list">
            {tracked.map((item) => {
              const record = getRecord(item);
              const total = safeCount(item.episodes);
              const watched = safeCount(record.watchedEpisodes);
              const percent = progressPercent(item);

              return (
                <article className="tracked-item" key={animeId(item)}>
                  <button className="tracked-poster" onClick={() => openAnime(item)}>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} loading="lazy" />}
                  </button>
                  <div className="tracked-info">
                    <button className="tracked-title" onClick={() => openAnime(item)}>{item.title}</button>
                    <p className="detail-meta">{watched} / {total || "?"} episodes · {percent}%</p>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                    <div className="tracked-controls">
                      <label className="sr-only" htmlFor={`dashboard-status-${animeId(item)}`}>Status for {item.title}</label>
                      <select id={`dashboard-status-${animeId(item)}`} value={record.status} onChange={(event) => setStatus(item, event.target.value)}>
                        {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <label className="sr-only" htmlFor={`dashboard-episodes-${animeId(item)}`}>Episodes watched for {item.title}</label>
                      <input id={`dashboard-episodes-${animeId(item)}`} type="number" min="0" max={total || undefined} value={watched} onChange={(event) => setWatchedEpisodes(item, event.target.value)} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <main className="anime-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <div><h2>MY ANIME</h2><p>JOURNEY</p></div>
        </div>

        <p className="menu-label">YOUR SPACE</p>
        <nav className="navigation">
          {TABS.map(([tab, icon]) => (
            <button key={tab} className={`nav-item ${activeTab === tab ? "selected" : ""}`} onClick={() => openTab(tab)}>
              <span>{icon}</span>{tab}
              {tab === "My Watchlist" && <span className="nav-count">{watchlist.length}</span>}
              {tab === "My Favourites" && <span className="nav-count">{favourites.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span>âœ§</span><h3>Your story.</h3><p>Your anime. Your memories. Your journey.</p>
        </div>
        <div className="profile">
          <div className="avatar">å›</div><div><strong>Anime Explorer</strong><p>Dreamer of worlds</p></div>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div className="breadcrumb">MY SPACE <span>/</span> {activeTab.toUpperCase()}</div>
          <div className="top-actions"><span className="online-dot" /> YOUR ANIME UNIVERSE</div>
        </header>

        {activeTab === "Home" && (
          <>
            <section className="hero">
              <div className="hero-overlay" />
              <div className="hero-content">
                <span className="eyebrow">✦ YOUR PERSONAL ANIME UNIVERSE</span>
                <h1>Every story<br />becomes <span>a part of you.</span></h1>
                <p>Keep track of the worlds you explore, the characters you love, and every unforgettable anime moment.</p>
                <div className="hero-buttons">
                  <button className="primary-button" onClick={() => openTab("Anime Library")}>Explore Anime â†—</button>
                  <button className="secondary-button" onClick={() => openTab("My Dashboard")}>My Journey â†’</button>
                </div>
              </div>
              <div className="hero-index">001 <span>/ YOUR NEXT ADVENTURE</span></div>
            </section>

            <section className="welcome-row">
              <div><p className="section-kicker">WELCOME TO YOUR WORLD</p><h2>Your next adventure awaits.</h2><p className="muted">A little corner of the internet, made entirely for your anime journey.</p></div>
              <div className="date-card"><span>âœ§</span><div><strong>YOUR COLLECTION</strong><p>{watchlist.length} watchlist · {favourites.length} favourites</p><p>{completedCount} completed · {watchingCount} watching</p></div></div>
            </section>

            <section className="feature-grid">
              {[
                ["01 / COLLECTION", "▧", "Anime Library", "Discover anime, posters, ratings and stories.", "Anime Library"],
                ["02 / DISCOVERY", "✦", "Smart Recommendations", "Discover anime based on your taste.", "Smart Recommendations"],
                ["03 / WATCHLIST", "♡", "My Watchlist", "Save anime you want to watch.", "My Watchlist"],
                ["04 / PROGRESS", "◈", "My Dashboard", "Track statuses and episode progress.", "My Dashboard"],
              ].map(([number, icon, title, description, target]) => (
                <article className="feature-card" key={title}>
                  <div className="card-top"><span>{number}</span><span>â†—</span></div>
                  <div className="feature-icon">{icon}</div><h3>{title}</h3><p>{description}</p>
                  <button onClick={() => openTab(target)}>Explore â†’</button>
                </article>
              ))}
            </section>
          </>
        )}

        {activeTab === "Anime Library" && (
          <section className="library-section">
            <p className="section-kicker">DISCOVER YOUR NEXT OBSESSION</p>
            <h1 className="library-title">Anime Library <span>✦</span></h1>
            <p className="muted">Search anime, explore posters, ratings and stories.</p>
            <form className="anime-search" onSubmit={(event) => { event.preventDefault(); loadAnime(query); }}>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anime... e.g. Naruto, One Piece" aria-label="Search anime" />
              <button className="primary-button" type="submit" disabled={loading}>{loading ? "Searching..." : "Search â†—"}</button>
            </form>
            {loading && <p className="status-message">Loading anime universe... âœ¨</p>}
            {error && <div className="status-message error-message"><p>{error}</p><button className="secondary-button" onClick={() => loadAnime(query || "Naruto")}>Try Again â†»</button></div>}
            {selectedAnime && renderDetail("library")}
            {!loading && !error && !selectedAnime && <div className="anime-grid">{anime.map((item) => renderAnimeCard(item))}</div>}
          </section>
        )}

        {activeTab === "Smart Recommendations" && renderRecommendations()}
        {activeTab === "Anime Quotes" && renderAnimeQuotes()}
        {activeTab === "Anime Themes" && renderAnimeThemes()}
        {activeTab === "My Reviews" && renderMyReviews()}
{activeTab === "Character Universe" && renderCharacterUniverse()}
{activeTab === "Wallpaper Studio" && renderWallpaperStudio()}
        {activeTab === "Anime Calendar" && (
          <AnimeCalendar
            tracked={[...watchlist, ...favourites].filter((item, index, list) =>
              list.findIndex((other) => String(other.malId) === String(item.malId)) === index
            )}
            onOpenAnime={(item) => {
              openTab("Anime Library");
            }}
          />
        )}
        {activeTab === "My Watchlist" && renderCollection("My Watchlist", "Anime you plan to watch, all in one place.", watchlist, "watchlist")}
        {activeTab === "My Favourites" && renderCollection("My Favourites", "The anime that mean the most to you.", favourites, "favourites")}

        {activeTab === "Characters" && (
          <section className="library-section">
            <p className="section-kicker">THE PEOPLE WHO MAKE STORIES SPECIAL</p>
            <h1 className="library-title">Favourite Characters <span>✦</span></h1>
            <p className="muted">Character profiles and galleries can be added in a future update.</p>
          </section>
        )}

        {activeTab === "My Dashboard" && renderDashboard()}

        <footer><span>MY ANIME JOURNEY Â© 2026</span><span>MADE FOR ANIME LOVERS <span className="footer-star">✦</span></span></footer>
      </section>
    </main>
  );
}




