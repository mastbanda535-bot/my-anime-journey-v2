export function collectLocalData() {
  const readJSON = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    watchlist: readJSON("my-anime-journey-watchlist", []),
    favourites: readJSON("my-anime-journey-favourites", []),
    progress: readJSON("my-anime-journey-progress", {}),
    reviews: readJSON("my-anime-reviews", []),
    characters: readJSON("my-character-perspectives", []),
    wallpapers: readJSON("my-anime-wallpapers", []),
    wallpaper_favourites: readJSON("my-anime-wallpaper-favourites", []),
    custom_background: localStorage.getItem("my-anime-custom-background") || "",
    theme: localStorage.getItem("my-anime-journey-theme") || "dark",
  };
}

export function applyCloudData(data) {
  localStorage.setItem("my-anime-journey-watchlist", JSON.stringify(data.watchlist || []));
  localStorage.setItem("my-anime-journey-favourites", JSON.stringify(data.favourites || []));
  localStorage.setItem("my-anime-journey-progress", JSON.stringify(data.progress || {}));
  localStorage.setItem("my-anime-reviews", JSON.stringify(data.reviews || []));
  localStorage.setItem("my-character-perspectives", JSON.stringify(data.characters || []));
  localStorage.setItem("my-anime-wallpapers", JSON.stringify(data.wallpapers || []));
  localStorage.setItem("my-anime-wallpaper-favourites", JSON.stringify(data.wallpaper_favourites || []));
  localStorage.setItem("my-anime-custom-background", data.custom_background || "");
  localStorage.setItem("my-anime-journey-theme", data.theme || "dark");
}
