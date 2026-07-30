"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { NewsItem, GeneralNewsItem, AchievementItem, UpcomingEvent, HeroSlide, defaultSkeletonData } from "@/data/skeletonData";
import {
  Newspaper,
  Trophy,
  Upload,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Tag,
  Award,
  Layers,
  Database,
  Cloud,
  RefreshCw,
  LogOut,
  Lock,
  Globe,
  Search,
  Download,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"news" | "generalNews" | "events" | "achievements" | "hero">("news");

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Data States
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [generalNewsList, setGeneralNewsList] = useState<GeneralNewsItem[]>([]);
  const [eventsList, setEventsList] = useState<UpcomingEvent[]>([]);
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-Fetch News States
  const [searchQuery, setSearchQuery] = useState("technology");
  const [fetchedNews, setFetchedNews] = useState<any[]>([]);
  const [fetchingNews, setFetchingNews] = useState(false);

  // Convex Events Sync States
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [fetchEventsStats, setFetchEventsStats] = useState<{
    totalRemote?: number;
    newEventsCount?: number;
    alreadyExistedCount?: number;
  } | null>(null);

  // Form states for Campus News
  const [isEditingNews, setIsEditingNews] = useState<boolean>(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<{
    tag: string;
    tagColor: NewsItem["tagColor"];
    title: string;
    description: string;
    date: string;
    image: string;
  }>({
    tag: "NEW",
    tagColor: "blue",
    title: "",
    description: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  });

  // Form states for General News
  const [isEditingGenNews, setIsEditingGenNews] = useState<boolean>(false);
  const [editingGenNewsId, setEditingGenNewsId] = useState<string | null>(null);
  const [genNewsForm, setGenNewsForm] = useState<{
    tag: string;
    tagColor: GeneralNewsItem["tagColor"];
    title: string;
    description: string;
    date: string;
    image: string;
    source: string;
  }>({
    tag: "GLOBAL",
    tagColor: "purple",
    title: "",
    description: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    source: "Global News",
  });

  // Form states for Events
  const [isEditingEvent, setIsEditingEvent] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<{
    day: string;
    month: string;
    color: UpcomingEvent["color"];
    title: string;
    time: string;
    venue: string;
    category: string;
    ctaLink: string;
  }>({
    day: "15",
    month: "JUN",
    color: "blue",
    title: "",
    time: "10:00 AM - 01:00 PM",
    venue: "Main Auditorium",
    category: "Workshop",
    ctaLink: "https://mitsmediaclub.com/events",
  });

  // Form states for Achievements
  const [isEditingAchievement, setIsEditingAchievement] = useState<boolean>(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [achievementForm, setAchievementForm] = useState<{
    badgeType: AchievementItem["badgeType"];
    title: string;
    description: string;
    date: string;
    image: string;
  }>({
    badgeType: "trophy",
    title: "",
    description: "",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
  });

  const [heroSlidesList, setHeroSlidesList] = useState<HeroSlide[]>([]);
  const [isEditingHero, setIsEditingHero] = useState<boolean>(false);
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);

  // Form states for Welcome Section (Hero Slides)
  const [heroForm, setHeroForm] = useState<{
    welcomeText: string;
    titleHighlight: string;
    tagline: string;
    image: string;
    orderIndex: number;
  }>({
    welcomeText: "Welcome to",
    titleHighlight: "InfoGrid",
    tagline: "Stay informed. Stay inspired.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    orderIndex: 0,
  });

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [maxFinishedEvents, setMaxFinishedEvents] = useState<number>(2);

  // Load settings on mount
  useEffect(() => {
    const settings = localStorage.getItem("infogrid_portal_settings");
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        if (typeof parsed.maxFinishedEvents === "number") {
          setMaxFinishedEvents(parsed.maxFinishedEvents);
        }
      } catch (e) {}
    }
  }, []);

  const handleUpdateMaxFinishedEvents = (val: number) => {
    const cleanVal = Math.max(0, val);
    setMaxFinishedEvents(cleanVal);
    localStorage.setItem("infogrid_portal_settings", JSON.stringify({ maxFinishedEvents: cleanVal }));
    showNotify(`Display filter updated: Showing all open events + ${cleanVal} finished event(s).`, "info");
  };

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/login");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchInitialData();
          autoFetchExternalNews("technology");
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchInitialData();
        autoFetchExternalNews("technology");
      } else {
        setAuthError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
      setUsernameInput("");
      setPasswordInput("");
      showNotify("Logged out successfully!", "info");
    } catch (e) {
      showNotify("Failed to log out", "error");
    }
  };

  const deduplicateEventsList = (list: UpcomingEvent[]): UpcomingEvent[] => {
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const result: UpcomingEvent[] = [];

    for (const item of list) {
      if (!item) continue;
      const keyId = item.externalId || item.id;
      const cleanTitle = (item.title || "").trim().toLowerCase();

      if (keyId && seenIds.has(keyId)) continue;
      if (cleanTitle && seenTitles.has(cleanTitle)) continue;

      if (keyId) seenIds.add(keyId);
      if (cleanTitle) seenTitles.add(cleanTitle);

      result.push(item);
    }

    return result;
  };

  const fetchInitialData = async () => {
    try {
      const [newsRes, genNewsRes, eventsRes, achRes, slidesRes] = await Promise.all([
        fetch("/api/news"),
        fetch("/api/general-news"),
        fetch("/api/events"),
        fetch("/api/achievements"),
        fetch("/api/hero-slides"),
      ]);

      let dbWorking = false;

      if (newsRes.ok && genNewsRes.ok && achRes.ok && slidesRes.ok) {
        const newsData = await newsRes.json();
        const genNewsData = await genNewsRes.json();
        const achData = await achRes.json();
        const slidesData = await slidesRes.json();

        if (Array.isArray(newsData) && Array.isArray(genNewsData) && Array.isArray(achData)) {
          setNewsList(newsData.length > 0 ? newsData : defaultSkeletonData.news);
          setGeneralNewsList(genNewsData.length > 0 ? genNewsData : defaultSkeletonData.generalNews);
          setAchievementsList(achData.length > 0 ? achData : defaultSkeletonData.achievements);
          if (Array.isArray(slidesData)) setHeroSlidesList(slidesData);
          dbWorking = true;
        }
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          setEventsList(deduplicateEventsList(eventsData));
        } else {
          setEventsList(deduplicateEventsList(defaultSkeletonData.upcomingEvents));
        }
      } else {
        setEventsList(deduplicateEventsList(defaultSkeletonData.upcomingEvents));
      }

      // -------------------------------------------------------------
      // AUTOMATIC MIGRATION: Migrate localStorage Hero Slides to DB
      // -------------------------------------------------------------
      if (dbWorking) {
        const local = localStorage.getItem("infogrid_portal_data");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.heroSlides && Array.isArray(parsed.heroSlides) && parsed.heroSlides.length > 0) {
              console.log("Migrating local hero slides to DB...");
              for (const slide of parsed.heroSlides) {
                // Post each slide to the database
                await fetch("/api/hero-slides", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(slide),
                });
              }
              // Delete from local storage so it doesn't migrate again
              delete parsed.heroSlides;
              localStorage.setItem("infogrid_portal_data", JSON.stringify(parsed));
              
              // Refetch slides from DB now that they are migrated
              const freshSlidesRes = await fetch("/api/hero-slides");
              if (freshSlidesRes.ok) {
                const freshSlidesData = await freshSlidesRes.json();
                if (Array.isArray(freshSlidesData)) setHeroSlidesList(freshSlidesData);
              }
              showNotify("Migrated previous Hero Slides to Database!", "info");
            }
          } catch (e) {
            console.error("Migration error", e);
          }
        }
      }
      // -------------------------------------------------------------

      if (dbWorking) {
        setIsDbConnected(true);
        return;
      }
    } catch (err) {
      console.warn("DB connection attempt failed, falling back to local storage", err);
    }

    setIsDbConnected(false);
    // Fallback: Read from LocalStorage or Default Skeleton Data
    const local = localStorage.getItem("infogrid_portal_data");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setNewsList(parsed.news || defaultSkeletonData.news);
        setGeneralNewsList(parsed.generalNews || defaultSkeletonData.generalNews);
        setEventsList(deduplicateEventsList(parsed.upcomingEvents || defaultSkeletonData.upcomingEvents));
        setAchievementsList(parsed.achievements || defaultSkeletonData.achievements);
      } catch (e) {
        setNewsList(defaultSkeletonData.news);
        setGeneralNewsList(defaultSkeletonData.generalNews);
        setEventsList(deduplicateEventsList(defaultSkeletonData.upcomingEvents));
        setAchievementsList(defaultSkeletonData.achievements);
      }
    } else {
      setNewsList(defaultSkeletonData.news);
      setGeneralNewsList(defaultSkeletonData.generalNews);
      setEventsList(deduplicateEventsList(defaultSkeletonData.upcomingEvents));
      setAchievementsList(defaultSkeletonData.achievements);
    }
  };

  // Convex Events Sync Function with Redundancy Protection
  const handleFetchConvexEvents = async () => {
    setFetchingEvents(true);
    try {
      const res = await fetch("/api/fetch-events?sync=true");
      const data = await res.json();

      if (res.ok && data.success) {
        setFetchEventsStats({
          totalRemote: data.totalRemoteEvents,
          newEventsCount: data.newEventsCount,
          alreadyExistedCount: data.alreadyExistedCount,
        });

        // Re-fetch clean list from DB if possible, or deduplicate against current state
        let updatedList: UpcomingEvent[] = [];
        try {
          const freshRes = await fetch("/api/events");
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (Array.isArray(freshData) && freshData.length > 0) {
              updatedList = freshData;
            }
          }
        } catch (e) {
          // Ignore fallback
        }

        if (updatedList.length === 0) {
          updatedList = [...data.events, ...eventsList];
        }

        const cleanEvents = deduplicateEventsList(updatedList);
        setEventsList(cleanEvents);
        syncToLocalStorage(newsList, generalNewsList, achievementsList, cleanEvents);

        if (data.newEventsCount > 0) {
          showNotify(
            `Successfully fetched ${data.totalRemoteEvents} remote events! Added ${data.newEventsCount} new non-redundant event(s) (${data.alreadyExistedCount} already existed).`,
            "success"
          );
        } else {
          showNotify(
            `Checked Convex Events API (${data.totalRemoteEvents} remote events). All events are already in display! Zero duplicate items added.`,
            "info"
          );
        }
      } else {
        throw new Error(data.error || "Failed to fetch events from Convex API");
      }
    } catch (err: any) {
      showNotify(err.message || "Failed to sync Convex Events", "error");
    } finally {
      setFetchingEvents(false);
    }
  };

  // Auto-Fetch External News
  const autoFetchExternalNews = async (query: string) => {
    setFetchingNews(true);
    try {
      const res = await fetch(`/api/fetch-news?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.articles) {
        setFetchedNews(data.articles);
      }
    } catch (err) {
      console.error("Auto fetch news error:", err);
    } finally {
      setFetchingNews(false);
    }
  };

  // Add fetched news item directly to General News
  const handleAddFetchedItemToGenNews = async (article: any) => {
    const exists = generalNewsList.some(
      (item) => item.title.trim().toLowerCase() === article.title.trim().toLowerCase()
    );
    if (exists) {
      showNotify(`"${article.title.substring(0, 30)}..." is already in General News!`, "info");
      return;
    }

    const newItem: GeneralNewsItem = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tag: article.tag || "GLOBAL",
      tagColor: article.tagColor || "purple",
      title: article.title,
      description: article.description,
      date: article.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: article.image || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      source: article.source || "External News",
      url: article.url || "#",
    };

    const updatedList = [newItem, ...generalNewsList];
    setGeneralNewsList(updatedList);

    if (isDbConnected) {
      try {
        const res = await fetch("/api/general-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        const created = await res.json();
        if (created.id) newItem.id = created.id;
      } catch (e) {
        console.error("Prisma create error:", e);
      }
    }

    syncToLocalStorage(newsList, updatedList, achievementsList, eventsList);
    showNotify(`Published "${article.title.substring(0, 35)}..." directly into General News!`, "success");
  };

  // Add fetched news item directly to Campus News
  const handleAddFetchedItemToCampusNews = async (article: any) => {
    const exists = newsList.some(
      (item) => item.title.trim().toLowerCase() === article.title.trim().toLowerCase()
    );
    if (exists) {
      showNotify(`"${article.title.substring(0, 30)}..." is already in Campus News!`, "info");
      return;
    }

    const newItem: NewsItem = {
      id: `news-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tag: article.tag || "NEWS",
      tagColor: article.tagColor || "blue",
      title: article.title,
      description: article.description,
      date: article.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: article.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    };

    const updatedList = [newItem, ...newsList];
    setNewsList(updatedList);

    if (isDbConnected) {
      try {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        const created = await res.json();
        if (created.id) newItem.id = created.id;
      } catch (e) {
        console.error("Prisma create error:", e);
      }
    }

    syncToLocalStorage(updatedList, generalNewsList, achievementsList, eventsList);
    showNotify(`Published "${article.title.substring(0, 35)}..." directly into Campus News!`, "success");
  };

  // Auto-import top fetched news into General News
  const handleAutoAddTopNews = async () => {
    if (!fetchedNews || fetchedNews.length === 0) {
      showNotify("No fetched news available to auto-import.", "error");
      return;
    }

    let addedCount = 0;
    let currentList = [...generalNewsList];

    for (const article of fetchedNews.slice(0, 5)) {
      const exists = currentList.some(
        (item) => item.title.trim().toLowerCase() === article.title.trim().toLowerCase()
      );
      if (!exists) {
        const newItem: GeneralNewsItem = {
          id: `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          tag: article.tag || "GLOBAL",
          tagColor: article.tagColor || "purple",
          title: article.title,
          description: article.description,
          date: article.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          image: article.image || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
          source: article.source || "External News",
          url: article.url || "#",
        };

        currentList = [newItem, ...currentList];
        addedCount++;

        if (isDbConnected) {
          try {
            await fetch("/api/general-news", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newItem),
            });
          } catch (e) {
            console.error("Prisma bulk create error:", e);
          }
        }
      }
    }

    setGeneralNewsList(currentList);
    syncToLocalStorage(newsList, currentList, achievementsList, eventsList);

    if (addedCount > 0) {
      showNotify(`Successfully auto-imported ${addedCount} trending news articles into General News!`, "success");
    } else {
      showNotify("All top fetched news articles already exist in General News!", "info");
    }
  };

  // Sync state changes to LocalStorage for instant preview sync
  const syncToLocalStorage = (
    updatedNews: NewsItem[],
    updatedGenNews: GeneralNewsItem[],
    updatedAch: AchievementItem[],
    updatedEvents?: UpcomingEvent[]
  ) => {
    try {
      const existing = localStorage.getItem("infogrid_portal_data");
      const dataObj = existing ? JSON.parse(existing) : defaultSkeletonData;
      dataObj.news = updatedNews;
      dataObj.generalNews = updatedGenNews;
      dataObj.achievements = updatedAch;
      if (updatedEvents) {
        dataObj.upcomingEvents = updatedEvents;
      }
      localStorage.setItem("infogrid_portal_data", JSON.stringify(dataObj));
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }
  };

  const showNotify = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Upload image handler via Cloudflare R2 API
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "news" | "generalNews" | "achievement" | "hero"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "news") {
          setNewsForm((prev) => ({ ...prev, image: data.url }));
        } else if (target === "generalNews") {
          setGenNewsForm((prev) => ({ ...prev, image: data.url }));
        } else if (target === "hero") {
          setHeroForm((prev) => ({ ...prev, image: data.url }));
        } else {
          setAchievementForm((prev) => ({ ...prev, image: data.url }));
        }
        showNotify(
          data.isFallback
            ? "Image uploaded as preview URL. (Configure Cloudflare R2 env variables for R2 bucket storage)."
            : "Image successfully uploaded to Cloudflare R2 bucket!",
          data.isFallback ? "info" : "success"
        );
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      showNotify(err.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  // CAMPUS NEWS HANDLERS
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description) {
      showNotify("Please fill in title and description", "error");
      return;
    }

    let updatedList: NewsItem[] = [];

    if (isEditingNews && editingNewsId) {
      updatedList = newsList.map((item) =>
        item.id === editingNewsId ? { ...item, ...newsForm } : item
      );

      if (isDbConnected) {
        try {
          await fetch("/api/news", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingNewsId, ...newsForm }),
          });
        } catch (e) {
          console.error("Prisma update error:", e);
        }
      }
      showNotify("Campus News item updated successfully!");
    } else {
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        ...newsForm,
      };
      updatedList = [newItem, ...newsList];

      if (isDbConnected) {
        try {
          const res = await fetch("/api/news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newsForm),
          });
          const created = await res.json();
          if (created.id) newItem.id = created.id;
        } catch (e) {
          console.error("Prisma create error:", e);
        }
      }
      showNotify("New Campus News item added!");
    }

    setNewsList(updatedList);
    syncToLocalStorage(updatedList, generalNewsList, achievementsList, eventsList);
    resetNewsForm();
  };

  const handleEditNews = (item: NewsItem) => {
    setIsEditingNews(true);
    setEditingNewsId(item.id);
    setNewsForm({
      tag: item.tag,
      tagColor: item.tagColor,
      title: item.title,
      description: item.description,
      date: item.date,
      image: item.image,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campus news item?")) return;
    const updatedList = newsList.filter((item) => item.id !== id);
    setNewsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    syncToLocalStorage(updatedList, generalNewsList, achievementsList, eventsList);
    showNotify("Campus news item deleted", "info");
  };

  const resetNewsForm = () => {
    setIsEditingNews(false);
    setEditingNewsId(null);
    setNewsForm({
      tag: "NEW",
      tagColor: "blue",
      title: "",
      description: "",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    });
  };

  // GENERAL NEWS HANDLERS
  const handleSaveGenNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genNewsForm.title || !genNewsForm.description) {
      showNotify("Please fill in title and description", "error");
      return;
    }

    let updatedList: GeneralNewsItem[] = [];

    if (isEditingGenNews && editingGenNewsId) {
      updatedList = generalNewsList.map((item) =>
        item.id === editingGenNewsId ? { ...item, ...genNewsForm } : item
      );

      if (isDbConnected) {
        try {
          await fetch("/api/general-news", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingGenNewsId, ...genNewsForm }),
          });
        } catch (e) {
          console.error("Prisma update error:", e);
        }
      }
      showNotify("General News item updated!");
    } else {
      const newItem: GeneralNewsItem = {
        id: `gen-${Date.now()}`,
        ...genNewsForm,
      };
      updatedList = [newItem, ...generalNewsList];

      if (isDbConnected) {
        try {
          const res = await fetch("/api/general-news", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(genNewsForm),
          });
          const created = await res.json();
          if (created.id) newItem.id = created.id;
        } catch (e) {
          console.error("Prisma create error:", e);
        }
      }
      showNotify("New General News item added!");
    }

    setGeneralNewsList(updatedList);
    syncToLocalStorage(newsList, updatedList, achievementsList, eventsList);
    resetGenNewsForm();
  };

  const handleImportFetchedArticle = async (article: any) => {
    const newItem: GeneralNewsItem = {
      id: `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tag: article.tag || "GLOBAL",
      tagColor: article.tagColor || "purple",
      title: article.title,
      description: article.description,
      date: article.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: article.image,
      source: article.source || "News API",
    };

    const updatedList = [newItem, ...generalNewsList];
    setGeneralNewsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch("/api/general-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
      } catch (e) {
        console.error("Import create error:", e);
      }
    }

    syncToLocalStorage(newsList, updatedList, achievementsList, eventsList);
    showNotify(`Imported "${article.title.substring(0, 30)}..." into General News!`);
  };

  const handleEditGenNews = (item: GeneralNewsItem) => {
    setIsEditingGenNews(true);
    setEditingGenNewsId(item.id);
    setGenNewsForm({
      tag: item.tag,
      tagColor: item.tagColor,
      title: item.title,
      description: item.description,
      date: item.date,
      image: item.image,
      source: item.source || "Global News",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteGenNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this general news item?")) return;
    const updatedList = generalNewsList.filter((item) => item.id !== id);
    setGeneralNewsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch(`/api/general-news?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    syncToLocalStorage(newsList, updatedList, achievementsList, eventsList);
    showNotify("General news item deleted", "info");
  };

  const resetGenNewsForm = () => {
    setIsEditingGenNews(false);
    setEditingGenNewsId(null);
    setGenNewsForm({
      tag: "GLOBAL",
      tagColor: "purple",
      title: "",
      description: "",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      source: "Global News",
    });
  };

  // EVENTS HANDLERS
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.venue) {
      showNotify("Please fill in event title and venue", "error");
      return;
    }

    const badgeBgMap = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-emerald-50 text-emerald-700 border-emerald-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const updatedEventObj: UpcomingEvent = {
      id: isEditingEvent && editingEventId ? editingEventId : `evt-${Date.now()}`,
      day: eventForm.day || "15",
      month: (eventForm.month || "JUN").toUpperCase(),
      color: eventForm.color,
      title: eventForm.title,
      time: eventForm.time,
      venue: eventForm.venue,
      category: eventForm.category,
      categoryBadgeBg: badgeBgMap[eventForm.color],
      ctaLink: eventForm.ctaLink,
    };

    let updatedList: UpcomingEvent[] = [];

    if (isEditingEvent && editingEventId) {
      updatedList = eventsList.map((item) =>
        item.id === editingEventId ? updatedEventObj : item
      );

      if (isDbConnected) {
        try {
          await fetch("/api/events", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEventObj),
          });
        } catch (e) {
          console.error("Prisma update error:", e);
        }
      }
      showNotify("Event updated successfully!");
    } else {
      updatedList = [updatedEventObj, ...eventsList];

      if (isDbConnected) {
        try {
          const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEventObj),
          });
          const created = await res.json();
          if (created.id) updatedEventObj.id = created.id;
        } catch (e) {
          console.error("Prisma create error:", e);
        }
      }
      showNotify("New event added to display!");
    }

    setEventsList(updatedList);
    syncToLocalStorage(newsList, generalNewsList, achievementsList, updatedList);
    resetEventForm();
  };

  const handleEditEvent = (item: UpcomingEvent) => {
    setIsEditingEvent(true);
    setEditingEventId(item.id);
    setEventForm({
      day: item.day,
      month: item.month,
      color: item.color,
      title: item.title,
      time: item.time,
      venue: item.venue,
      category: item.category,
      ctaLink: item.ctaLink || "#",
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const updatedList = eventsList.filter((item) => item.id !== id);
    setEventsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    syncToLocalStorage(newsList, generalNewsList, achievementsList, updatedList);
    showNotify("Event deleted", "info");
  };

  const resetEventForm = () => {
    setIsEditingEvent(false);
    setEditingEventId(null);
    setEventForm({
      day: "15",
      month: "JUN",
      color: "blue",
      title: "",
      time: "10:00 AM - 01:00 PM",
      venue: "Main Auditorium",
      category: "Workshop",
      ctaLink: "https://mitsmediaclub.com/events",
    });
  };

  // ACHIEVEMENTS HANDLERS
  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title || !achievementForm.description) {
      showNotify("Please fill in title and description", "error");
      return;
    }

    let updatedList: AchievementItem[] = [];

    if (isEditingAchievement && editingAchievementId) {
      updatedList = achievementsList.map((item) =>
        item.id === editingAchievementId ? { ...item, ...achievementForm } : item
      );

      if (isDbConnected) {
        try {
          await fetch("/api/achievements", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingAchievementId, ...achievementForm }),
          });
        } catch (e) {
          console.error("Prisma update error:", e);
        }
      }
      showNotify("Achievement showcase item updated!");
    } else {
      const newItem: AchievementItem = {
        id: `ach-${Date.now()}`,
        ...achievementForm,
      };
      updatedList = [newItem, ...achievementsList];

      if (isDbConnected) {
        try {
          const res = await fetch("/api/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(achievementForm),
          });
          const created = await res.json();
          if (created.id) newItem.id = created.id;
        } catch (e) {
          console.error("Prisma create error:", e);
        }
      }
      showNotify("New Achievement showcase item added!");
    }

    setAchievementsList(updatedList);
    syncToLocalStorage(newsList, generalNewsList, updatedList, eventsList);
    resetAchievementForm();
  };

  const handleEditAchievement = (item: AchievementItem) => {
    setIsEditingAchievement(true);
    setEditingAchievementId(item.id);
    setAchievementForm({
      badgeType: item.badgeType,
      title: item.title,
      description: item.description,
      date: item.date,
      image: item.image,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement item?")) return;
    const updatedList = achievementsList.filter((item) => item.id !== id);
    setAchievementsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch(`/api/achievements?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    syncToLocalStorage(newsList, generalNewsList, updatedList, eventsList);
    showNotify("Achievement item deleted", "info");
  };

  const resetAchievementForm = () => {
    setIsEditingAchievement(false);
    setEditingAchievementId(null);
    setAchievementForm({
      badgeType: "trophy",
      title: "",
      description: "",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    });
  };

  const resetHeroForm = () => {
    setIsEditingHero(false);
    setEditingHeroId(null);
    setHeroForm({
      welcomeText: "Welcome to",
      titleHighlight: "InfoGrid",
      tagline: "Stay informed. Stay inspired.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
      orderIndex: 0,
    });
  };

  const handleEditHero = (item: HeroSlide) => {
    setIsEditingHero(true);
    setEditingHeroId(item.id);
    setHeroForm({
      welcomeText: item.welcomeText,
      titleHighlight: item.titleHighlight,
      tagline: item.tagline,
      image: item.image,
      orderIndex: item.orderIndex || 0,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDeleteHero = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Hero Slide?")) return;
    const updatedList = heroSlidesList.filter((item) => item.id !== id);
    setHeroSlidesList(updatedList);

    if (editingHeroId === id) {
      resetHeroForm();
    }

    if (isDbConnected) {
      try {
        await fetch(`/api/hero-slides?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    showNotify("Hero Slide deleted", "info");
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroForm.welcomeText || !heroForm.titleHighlight || !heroForm.image) {
      showNotify("Please fill in welcome text, title highlight and image", "error");
      return;
    }

    let updatedList: HeroSlide[] = [];

    if (isEditingHero && editingHeroId) {
      updatedList = heroSlidesList.map((item) =>
        item.id === editingHeroId ? { ...item, ...heroForm } : item
      );

      if (isDbConnected) {
        try {
          await fetch("/api/hero-slides", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingHeroId, ...heroForm }),
          });
        } catch (e) {
          console.error("Prisma update error:", e);
        }
      }
      showNotify("Hero Slide updated successfully!");
    } else {
      const newItem: HeroSlide = {
        id: `hero-${Date.now()}`,
        ...heroForm,
      };
      updatedList = [...heroSlidesList, newItem];

      if (isDbConnected) {
        try {
          const res = await fetch("/api/hero-slides", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(heroForm),
          });
          const created = await res.json();
          if (created.id) newItem.id = created.id;
        } catch (e) {
          console.error("Prisma create error:", e);
        }
      }
      showNotify("New Hero Slide added!");
    }

    setHeroSlidesList(updatedList.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    resetHeroForm();
  };

  const handleResetAllDefaults = () => {
    if (confirm("Reset all news, events, and achievements to default initial dataset?")) {
      setNewsList(defaultSkeletonData.news);
      setGeneralNewsList(defaultSkeletonData.generalNews);
      setEventsList(defaultSkeletonData.upcomingEvents);
      setAchievementsList(defaultSkeletonData.achievements);
      syncToLocalStorage(
        defaultSkeletonData.news,
        defaultSkeletonData.generalNews,
        defaultSkeletonData.achievements,
        defaultSkeletonData.upcomingEvents
      );
      showNotify("Reset to default dataset successfully!");
    }
  };

  // 1. Loading check State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
        <span>Loading Admin Console...</span>
      </div>
    );
  }

  // 2. Authentication Login Page Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Admin Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">Access infogrid media dashboard</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
            <Link href="/display" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Campus Display Screen</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Authenticated Admin Dashboard UI
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      {/* Top Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top ${
            notification.type === "error"
              ? "bg-rose-950/90 border-rose-600 text-rose-200"
              : notification.type === "info"
              ? "bg-sky-950/90 border-sky-600 text-sky-200"
              : "bg-emerald-950/90 border-emerald-600 text-emerald-200"
          }`}
        >
          {notification.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Campus Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Portal Media Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetAllDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/20 border border-rose-900/60 hover:border-rose-800 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Logout</span>
          </button>
          <Link
            href="/display"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Campus Display</span>
          </Link>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Campus News Count</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{newsList.length} Items</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">General News Count</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{generalNewsList.length} Items</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Campus Events</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{eventsList.length} Items</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Achievements Count</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{achievementsList.length} Items</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "news"
              ? "border-blue-500 text-blue-400 bg-blue-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Campus News ({newsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("generalNews")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "generalNews"
              ? "border-purple-500 text-purple-400 bg-purple-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>General News ({generalNewsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "events"
              ? "border-sky-500 text-sky-400 bg-sky-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Convex Sync ({eventsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "achievements"
              ? "border-amber-500 text-amber-400 bg-amber-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Achievements ({achievementsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "hero"
              ? "border-blue-500 text-blue-400 bg-blue-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Welcome Hero</span>
        </button>
      </div>

      {/* MAIN TAB CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Add / Edit Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          {activeTab === "news" ? (
            /* CAMPUS NEWS FORM */
            <form onSubmit={handleSaveNews} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingNews ? <Edit className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-blue-400" />}
                  <span>{isEditingNews ? "Edit Campus News Item" : "Add New Campus News Item"}</span>
                </h3>
                {isEditingNews && (
                  <button
                    type="button"
                    onClick={resetNewsForm}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New AI & DS Lab Inaugurated"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEW, PLACEMENT"
                    value={newsForm.tag}
                    onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tag Color</label>
                  <select
                    value={newsForm.tagColor}
                    onChange={(e) => setNewsForm({ ...newsForm, tagColor: e.target.value as any })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="darkgreen">Dark Green</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 28 May 2025"
                  value={newsForm.date}
                  onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary description of the news item..."
                  value={newsForm.description}
                  onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL or Cloudflare R2 Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <label className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "news")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isEditingNews ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditingNews ? "Update News Item" : "Publish Campus News"}</span>
              </button>
            </form>
          ) : activeTab === "generalNews" ? (
            /* GENERAL NEWS FORM */
            <form onSubmit={handleSaveGenNews} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingGenNews ? <Edit className="w-4 h-4 text-purple-400" /> : <Plus className="w-4 h-4 text-purple-400" />}
                  <span>{isEditingGenNews ? "Edit General News Item" : "Add New General News Item"}</span>
                </h3>
                {isEditingGenNews && (
                  <button
                    type="button"
                    onClick={resetGenNewsForm}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breakthrough in Quantum Computing"
                  value={genNewsForm.title}
                  onChange={(e) => setGenNewsForm({ ...genNewsForm, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GLOBAL TECH"
                    value={genNewsForm.tag}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, tag: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Source Outlet</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Insights"
                    value={genNewsForm.source}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, source: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of the global/tech article..."
                  value={genNewsForm.description}
                  onChange={(e) => setGenNewsForm({ ...genNewsForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={genNewsForm.image}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, image: e.target.value })}
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <label className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "generalNews")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isEditingGenNews ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditingGenNews ? "Update General News" : "Publish General News"}</span>
              </button>
            </form>
          ) : activeTab === "events" ? (
            /* EVENTS FORM */
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingEvent ? <Edit className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-sky-400" />}
                  <span>{isEditingEvent ? "Edit Campus Event" : "Add New Campus Event"}</span>
                </h3>
                {isEditingEvent && (
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build a Search Engine"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Day (e.g. 24)</label>
                  <input
                    type="text"
                    required
                    placeholder="24"
                    value={eventForm.day}
                    onChange={(e) => setEventForm({ ...eventForm, day: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Month (e.g. MAR)</label>
                  <input
                    type="text"
                    required
                    placeholder="MAR"
                    value={eventForm.month}
                    onChange={(e) => setEventForm({ ...eventForm, month: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Color Theme</label>
                  <select
                    value={eventForm.color}
                    onChange={(e) => setEventForm({ ...eventForm, color: e.target.value as any })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="orange">Orange</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="02:00 PM - 03:15 PM"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    placeholder="FOSS Lab / Seminar Hall"
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Badge</label>
                  <input
                    type="text"
                    required
                    placeholder="Workshop, Competition..."
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Registration Link</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={eventForm.ctaLink}
                    onChange={(e) => setEventForm({ ...eventForm, ctaLink: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isEditingEvent ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditingEvent ? "Update Campus Event" : "Add Campus Event"}</span>
              </button>
            </form>
          ) : activeTab === "achievements" ? (
            /* ACHIEVEMENTS FORM */
            <form onSubmit={handleSaveAchievement} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingAchievement ? <Edit className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                  <span>{isEditingAchievement ? "Edit Achievement Item" : "Add New Achievement Showcase"}</span>
                </h3>
                {isEditingAchievement && (
                  <button
                    type="button"
                    onClick={resetAchievementForm}
                    className="text-xs text-rose-400 hover:underline font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Winners 2025"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Badge Icon Type</label>
                  <select
                    value={achievementForm.badgeType}
                    onChange={(e) => setAchievementForm({ ...achievementForm, badgeType: e.target.value as any })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="trophy">Trophy 🏆</option>
                    <option value="medal">Medal 🥇</option>
                    <option value="ribbon">Ribbon 🎗️</option>
                    <option value="star">Star 🌟</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22 May 2025"
                    value={achievementForm.date}
                    onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Short description of award, ranking or accolade..."
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={achievementForm.image}
                    onChange={(e) => setAchievementForm({ ...achievementForm, image: e.target.value })}
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <label className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer flex items-center justify-center transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "achievement")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isEditingAchievement ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isEditingAchievement ? "Update Achievement" : "Publish Achievement"}</span>
              </button>
            </form>
          ) : (
            /* ══════════════ HERO FORM ══════════════ */
            <div className="space-y-5">

              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingHero
                    ? <><Edit className="w-4 h-4 text-blue-400" /><span>Edit Hero Slide</span></>
                    : <><Sparkles className="w-4 h-4 text-blue-400" /><span>Add New Hero Slide</span></>}
                </h3>
                {isEditingHero && (
                  <button
                    type="button"
                    onClick={resetHeroForm}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold border border-rose-900/50 px-2.5 py-1 rounded-lg hover:bg-rose-950/40 transition-all"
                  >
                    ✕ Cancel Edit
                  </button>
                )}
              </div>

              {/* Live Preview Banner */}
              <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0 group">
                {heroForm.image ? (
                  <NextImage
                    src={heroForm.image}
                    alt="Preview"
                    fill
                    sizes="100%"
                    className="object-cover opacity-50"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Live Preview</p>
                  <p className="text-white text-sm font-black leading-tight truncate">
                    {heroForm.welcomeText || "Welcome to"}{" "}
                    <span className="text-blue-400">{heroForm.titleHighlight || "InfoGrid"}</span>
                  </p>
                  {heroForm.tagline && (
                    <p className="text-slate-300 text-[11px] truncate mt-0.5">{heroForm.tagline}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[9px] font-bold text-blue-300 border border-blue-800/50">
                  SLIDE #{heroForm.orderIndex}
                </div>
              </div>

              <form onSubmit={handleSaveHero} className="space-y-4">

                {/* Welcome Text + Title Highlight */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Hero Title *
                    <span className="ml-1.5 text-slate-500 font-normal">— displays as two parts</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Welcome to"
                        value={heroForm.welcomeText}
                        onChange={(e) => setHeroForm({ ...heroForm, welcomeText: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 transition-all"
                      />
                      <p className="text-[10px] text-slate-600 mt-1 ml-0.5">Prefix text</p>
                    </div>
                    <div className="w-8 flex items-start justify-center pt-2.5 text-slate-600 font-bold text-sm">+</div>
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="InfoGrid"
                        value={heroForm.titleHighlight}
                        onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
                        className="w-full text-xs p-2.5 bg-slate-950 border border-blue-800/60 rounded-xl text-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 transition-all"
                      />
                      <p className="text-[10px] text-blue-700 mt-1 ml-0.5">Highlighted text (blue)</p>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Tagline / Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Stay informed. Stay inspired."
                    value={heroForm.tagline}
                    onChange={(e) => setHeroForm({ ...heroForm, tagline: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 transition-all"
                  />
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Display Order
                    <span className="ml-1.5 text-slate-500 font-normal">— lower number shows first</span>
                  </label>
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setHeroForm({ ...heroForm, orderIndex: Math.max(0, heroForm.orderIndex - 1) })}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors text-sm"
                    >−</button>
                    <span className="flex-1 text-center font-black text-blue-400 text-base">{heroForm.orderIndex}</span>
                    <button
                      type="button"
                      onClick={() => setHeroForm({ ...heroForm, orderIndex: heroForm.orderIndex + 1 })}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors text-sm"
                    >+</button>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Background Image *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={heroForm.image}
                      onChange={(e) => setHeroForm({ ...heroForm, image: e.target.value })}
                      className="flex-1 text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-600 transition-all"
                    />
                    <label className="px-3 py-2.5 bg-slate-800 hover:bg-blue-900/60 border border-slate-700 hover:border-blue-700 text-slate-300 hover:text-blue-300 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all whitespace-nowrap text-[11px] font-bold">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "hero")}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">Paste a URL or upload from your device. Recommended: 1920×1080 landscape.</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`w-full py-3 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${
                    isEditingHero
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                  }`}
                >
                  {isEditingHero ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEditingHero ? "Save Changes" : "Add Hero Slide"}
                </button>
              </form>

              {/* ── Active Slides List ── */}
              <div className="border-t border-slate-800 pt-5 mt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Active Slides ({heroSlidesList.length})
                  </h4>
                  {heroSlidesList.length > 1 && (
                    <span className="text-[10px] text-slate-600 italic">Sorted by display order</span>
                  )}
                </div>

                {heroSlidesList.length === 0 ? (
                  <div className="py-8 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
                    <Sparkles className="w-6 h-6 text-slate-700" />
                    <p className="text-xs text-slate-500 text-center">No hero slides yet.<br />Add your first slide above.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
                    {heroSlidesList.map((item) => {
                      const isActive = editingHeroId === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`relative rounded-2xl overflow-hidden border transition-all group ${
                            isActive
                              ? "border-blue-500 ring-2 ring-blue-500/30"
                              : "border-slate-800 hover:border-slate-600"
                          }`}
                        >
                          {/* Background image strip */}
                          <div className="relative w-full h-20">
                            <NextImage
                              src={item.image}
                              alt={item.titleHighlight}
                              fill
                              sizes="400px"
                              className="object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30" />

                            <div className="absolute inset-0 flex items-center gap-3 px-3">
                              {/* Order badge */}
                              <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center flex-shrink-0">
                                <span className="text-[11px] font-black text-blue-400">#{item.orderIndex ?? 0}</span>
                              </div>

                              {/* Text content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-[12px] font-extrabold leading-tight truncate">
                                  {item.welcomeText}{" "}
                                  <span className="text-blue-400">{item.titleHighlight}</span>
                                </p>
                                <p className="text-slate-400 text-[10px] truncate mt-0.5">{item.tagline || "—"}</p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => handleEditHero(item)}
                                  className="p-1.5 bg-slate-800/80 hover:bg-blue-900/60 text-slate-400 hover:text-blue-400 rounded-lg transition-all border border-slate-700 hover:border-blue-700"
                                  title="Edit slide"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHero(item.id.toString())}
                                  className="p-1.5 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg transition-all border border-slate-700 hover:border-rose-800"
                                  title="Delete slide"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Editing indicator */}
                            {isActive && (
                              <div className="absolute top-1.5 right-12 px-2 py-0.5 rounded-full bg-blue-600 text-[9px] font-black text-white uppercase tracking-widest">
                                Editing
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


        {/* RIGHT COLUMN: Items List & Convex / External Fetcher Tools */}
        <div className="lg:col-span-7 space-y-6">
          {/* LIVE NEWS FETCHER TOOL — NEWS & GENERAL NEWS TABS */}
          {(activeTab === "generalNews" || activeTab === "news") && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              {/* Tool Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-700/40 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white leading-tight">Live News Fetcher</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Search & publish global headlines directly</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAddTopNews}
                  disabled={fetchingNews || fetchedNews.length === 0}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-xl shadow transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Import Top
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-5 pt-4 pb-3 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search topic — e.g. AI, space, education, robotics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          autoFetchExternalNews(searchQuery);
                        }
                      }}
                      className="w-full text-xs p-2.5 pl-8 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-slate-500 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  </div>
                  <button
                    type="button"
                    onClick={() => autoFetchExternalNews(searchQuery)}
                    disabled={fetchingNews}
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    {fetchingNews ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    Search
                  </button>
                </div>

                {/* Quick Topic Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {["Technology", "AI & Tech", "Education", "Science", "Robotics", "Cybersecurity"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip);
                        autoFetchExternalNews(chip);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        searchQuery.toLowerCase() === chip.toLowerCase()
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-purple-700/60 hover:text-purple-300"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Header */}
              <div className="px-5 pb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Results ({fetchedNews.length})
                </span>
                {fetchingNews && (
                  <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Fetching...
                  </span>
                )}
              </div>

              {/* News Cards */}
              <div className="px-5 pb-5">
                {fetchedNews.length === 0 ? (
                  <div className="py-8 border border-dashed border-slate-800 rounded-2xl text-center">
                    <Globe className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No articles yet. Search a topic or pick a quick filter above.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {fetchedNews.map((article: any, idx: number) => {
                      const isGenNewsAdded = generalNewsList.some(
                        (item) => item.title.trim().toLowerCase() === article.title.trim().toLowerCase()
                      );

                      return (
                        <div
                          key={article.id || `fetched-${idx}`}
                          className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-2xl hover:border-purple-800/50 transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                            <NextImage
                              src={article.image}
                              alt={article.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-purple-950/80 text-purple-400 border border-purple-900 uppercase tracking-wide">
                                {article.tag || "NEWS"}
                              </span>
                              <span className="text-[10px] text-slate-500">{article.source}</span>
                              <span className="text-[10px] text-slate-600">·</span>
                              <span className="text-[10px] text-slate-500">{article.date}</span>
                            </div>
                            <h4 className="font-bold text-white text-[12px] leading-snug line-clamp-2 mb-1.5">
                              {article.title}
                            </h4>
                            <p className="text-slate-500 text-[11px] line-clamp-1">{article.description}</p>
                          </div>

                          {/* Action */}
                          <div className="flex-shrink-0 self-center">
                            <button
                              type="button"
                              onClick={() => handleAddFetchedItemToGenNews(article)}
                              disabled={isGenNewsAdded}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                isGenNewsAdded
                                  ? "bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700"
                                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/40"
                              }`}
                            >
                              {isGenNewsAdded ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  Published
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  Publish
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SPECIAL TOOL BANNER FOR CONVEX EVENTS SYNC IN EVENTS TAB */}
          {activeTab === "events" && (
            <div className="bg-gradient-to-br from-sky-950/90 via-slate-900 to-blue-950/90 border border-sky-800/80 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Convex MITS Media Club Events API</span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Auto-Fetch & Sync Convex Events
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Endpoint: <code className="text-sky-300 font-mono">https://convexapi.mitsmediaclub.com/api/events</code>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Uses Bearer token authentication & unique ID checks to guarantee <strong className="text-emerald-400">ZERO REDUNDANCY</strong>.
                  </p>
                </div>

                <button
                  onClick={handleFetchConvexEvents}
                  disabled={fetchingEvents}
                  className="px-5 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider flex-shrink-0"
                >
                  {fetchingEvents ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing Convex API...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Fetch & Sync Events</span>
                    </>
                  )}
                </button>
              </div>

              {fetchEventsStats && (
                <div className="mt-4 pt-3 border-t border-sky-900/60 flex flex-wrap gap-4 text-xs font-semibold">
                  <span className="text-slate-300">
                    Remote Events: <strong className="text-white">{fetchEventsStats.totalRemote}</strong>
                  </span>
                  <span className="text-emerald-400">
                    New Non-Redundant Added: <strong>{fetchEventsStats.newEventsCount}</strong>
                  </span>
                  <span className="text-amber-400">
                    Already Existed (Skipped): <strong>{fetchEventsStats.alreadyExistedCount}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* DISPLAY FILTER CONTROL BOX */}
          {activeTab === "events" && (
            <div className="mb-4 p-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Finished Events Limit on Display</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Controls how many recently completed/closed events appear alongside all open registration events.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleUpdateMaxFinishedEvents(maxFinishedEvents - 1)}
                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center text-sm"
                  title="Decrease limit"
                >
                  -
                </button>

                <span className="w-8 text-center font-black text-sky-400 text-sm">
                  {maxFinishedEvents}
                </span>

                <button
                  type="button"
                  onClick={() => handleUpdateMaxFinishedEvents(maxFinishedEvents + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-colors flex items-center justify-center text-sm"
                  title="Increase limit"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* LIST CONTAINER */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-extrabold text-base text-white">
                {activeTab === "news"
                  ? `Published Campus News (${newsList.length})`
                  : activeTab === "generalNews"
                  ? `Published General News (${generalNewsList.length})`
                  : activeTab === "events"
                  ? `Campus Events in Display (${eventsList.length})`
                  : `Published Achievements (${achievementsList.length})`}
              </h3>
            </div>

            {/* CAMPUS NEWS LIST */}
            {activeTab === "news" && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {newsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No campus news items published yet.</p>
                ) : (
                  newsList.map((item, idx) => (
                    <div
                      key={item.id ? `${item.id}-${idx}` : `news-${idx}`}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900">
                          <NextImage
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded bg-blue-950 text-blue-400 border border-blue-800 uppercase">
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-slate-400 text-xs line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditNews(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* GENERAL NEWS LIST */}
            {activeTab === "generalNews" && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {generalNewsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No general news items published yet.</p>
                ) : (
                  generalNewsList.map((item, idx) => (
                    <div
                      key={item.id ? `${item.id}-${idx}` : `gennews-${idx}`}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900">
                          <NextImage
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded bg-purple-950 text-purple-400 border border-purple-800 uppercase">
                              {item.tag}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-slate-400 text-xs line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditGenNews(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGenNews(item.id)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EVENTS LIST */}
            {activeTab === "events" && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {eventsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No campus events in display.</p>
                ) : (
                  eventsList.map((item, idx) => (
                    <div
                      key={item.id ? `${item.id}-${idx}` : item.externalId ? `${item.externalId}-${idx}` : `evt-${idx}`}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-base font-black leading-none">{item.day}</span>
                          <span className="text-[9px] font-bold uppercase mt-0.5">{item.month}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {item.category}
                            </span>
                            {item.externalId && (
                              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                                Convex Synced
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                          <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {item.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              {item.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.ctaLink && item.ctaLink !== "#" && (
                          <a
                            href={item.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-sky-400 rounded-lg transition-colors"
                            title="Registration Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditEvent(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(item.id)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ACHIEVEMENTS LIST */}
            {activeTab === "achievements" && (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {achievementsList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">No achievements items published yet.</p>
                ) : (
                  achievementsList.map((item, idx) => (
                    <div
                      key={item.id ? `${item.id}-${idx}` : `ach-${idx}`}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900">
                          <NextImage
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded bg-amber-950 text-amber-400 border border-amber-800 uppercase">
                              {item.badgeType}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-slate-400 text-xs line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAchievement(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAchievement(item.id)}
                          className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* HERO PREVIEW */}
            {activeTab === "hero" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Live Preview Representation</h4>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800/80">
                    <div className="space-y-2">
                      <span className="text-slate-400 font-semibold text-xs">{heroForm.welcomeText}</span>
                      <h2 className="text-lg font-extrabold text-white leading-tight">{heroForm.titleHighlight}</h2>
                      <p className="text-slate-400 font-medium text-xs">{heroForm.tagline}</p>
                    </div>
                    {heroForm.image && (
                      <div className="relative mt-4 rounded-lg overflow-hidden border border-slate-700 h-32 bg-slate-950">
                        <NextImage src={heroForm.image} alt="Hero image" fill sizes="100vw" className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
