"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NewsItem, GeneralNewsItem, AchievementItem, defaultSkeletonData } from "@/data/skeletonData";
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
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"news" | "generalNews" | "achievements">("news");

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Data States
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [generalNewsList, setGeneralNewsList] = useState<GeneralNewsItem[]>([]);
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-Fetch & Search News Tool States
  const [searchQuery, setSearchQuery] = useState("technology");
  const [fetchedNews, setFetchedNews] = useState<any[]>([]);
  const [fetchingNews, setFetchingNews] = useState(false);

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

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

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

  const fetchInitialData = async () => {
    // 1. Try loading from Supabase Prisma API
    try {
      const [newsRes, genNewsRes, achRes] = await Promise.all([
        fetch("/api/news"),
        fetch("/api/general-news"),
        fetch("/api/achievements"),
      ]);

      if (newsRes.ok && genNewsRes.ok && achRes.ok) {
        const newsData = await newsRes.json();
        const genNewsData = await genNewsRes.json();
        const achData = await achRes.json();

        if (Array.isArray(newsData) && Array.isArray(genNewsData) && Array.isArray(achData)) {
          setNewsList(newsData.length > 0 ? newsData : defaultSkeletonData.news);
          setGeneralNewsList(genNewsData.length > 0 ? genNewsData : defaultSkeletonData.generalNews);
          setAchievementsList(achData.length > 0 ? achData : defaultSkeletonData.achievements);
          setIsDbConnected(true);
          return;
        }
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
        setAchievementsList(parsed.achievements || defaultSkeletonData.achievements);
      } catch (e) {
        setNewsList(defaultSkeletonData.news);
        setGeneralNewsList(defaultSkeletonData.generalNews);
        setAchievementsList(defaultSkeletonData.achievements);
      }
    } else {
      setNewsList(defaultSkeletonData.news);
      setGeneralNewsList(defaultSkeletonData.generalNews);
      setAchievementsList(defaultSkeletonData.achievements);
    }
  };

  // Auto-Fetch External News from News API endpoint
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

  // Sync state changes to LocalStorage for instant preview sync
  const syncToLocalStorage = (
    updatedNews: NewsItem[],
    updatedGenNews: GeneralNewsItem[],
    updatedAch: AchievementItem[]
  ) => {
    try {
      const existing = localStorage.getItem("infogrid_portal_data");
      const dataObj = existing ? JSON.parse(existing) : defaultSkeletonData;
      dataObj.news = updatedNews;
      dataObj.generalNews = updatedGenNews;
      dataObj.achievements = updatedAch;
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
    target: "news" | "generalNews" | "achievement"
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
    syncToLocalStorage(updatedList, generalNewsList, achievementsList);
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
    syncToLocalStorage(updatedList, generalNewsList, achievementsList);
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
    syncToLocalStorage(newsList, updatedList, achievementsList);
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

    syncToLocalStorage(newsList, updatedList, achievementsList);
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
    syncToLocalStorage(newsList, updatedList, achievementsList);
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
    syncToLocalStorage(newsList, generalNewsList, updatedList);
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
    syncToLocalStorage(newsList, generalNewsList, updatedList);
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

  const handleResetAllDefaults = () => {
    if (confirm("Reset all news and achievements to default initial dataset?")) {
      setNewsList(defaultSkeletonData.news);
      setGeneralNewsList(defaultSkeletonData.generalNews);
      setAchievementsList(defaultSkeletonData.achievements);
      syncToLocalStorage(
        defaultSkeletonData.news,
        defaultSkeletonData.generalNews,
        defaultSkeletonData.achievements
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
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Preview</span>
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
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Preview</span>
          </Link>
        </div>
      </div>

      {/* Info Status Banner */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Achievements Count</div>
            <div className="text-xl font-extrabold text-white mt-0.5">{achievementsList.length} Items</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-400 text-xs font-medium">Cloud & DB Integration</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200">
                R2 & News API Enabled
              </span>
            </div>
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
          <span>General News & Auto-Fetch ({generalNewsList.length})</span>
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

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter news summary..."
                  value={newsForm.description}
                  onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, PLACEMENT"
                    value={newsForm.tag}
                    onChange={(e) => setNewsForm({ ...newsForm, tag: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tag Color</label>
                  <select
                    value={newsForm.tagColor}
                    onChange={(e) =>
                      setNewsForm({ ...newsForm, tagColor: e.target.value as NewsItem["tagColor"] })
                    }
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Emerald Green</option>
                    <option value="darkgreen">Dark Green</option>
                    <option value="orange">Orange / Amber</option>
                    <option value="purple">Purple</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                <input
                  type="text"
                  placeholder="e.g. 28 May 2025"
                  value={newsForm.date}
                  onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Image (Cloudflare R2 Bucket / Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newsForm.image}
                    onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "news")}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {newsForm.image && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 bg-slate-950 mt-2">
                    <img src={newsForm.image} alt="News Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{isEditingNews ? "Save Changes" : "Add Campus News Item"}</span>
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Breakthrough in Quantum Computing Architecture"
                  value={genNewsForm.title}
                  onChange={(e) => setGenNewsForm({ ...genNewsForm, title: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter global news details..."
                  value={genNewsForm.description}
                  onChange={(e) => setGenNewsForm({ ...genNewsForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. GLOBAL TECH, AI RESEARCH"
                    value={genNewsForm.tag}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, tag: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tag Color</label>
                  <select
                    value={genNewsForm.tagColor}
                    onChange={(e) =>
                      setGenNewsForm({ ...genNewsForm, tagColor: e.target.value as GeneralNewsItem["tagColor"] })
                    }
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="purple">Purple</option>
                    <option value="blue">Blue</option>
                    <option value="green">Emerald Green</option>
                    <option value="darkgreen">Dark Green</option>
                    <option value="orange">Orange / Amber</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Source / Publication</label>
                  <input
                    type="text"
                    placeholder="e.g. TechCrunch, Nature"
                    value={genNewsForm.source}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, source: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 28 May 2025"
                    value={genNewsForm.date}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, date: e.target.value })}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Image (Cloudflare R2 Bucket / Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={genNewsForm.image}
                    onChange={(e) => setGenNewsForm({ ...genNewsForm, image: e.target.value })}
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "generalNews")}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {genNewsForm.image && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 bg-slate-950 mt-2">
                    <img src={genNewsForm.image} alt="General News Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{isEditingGenNews ? "Save Changes" : "Add General News Item"}</span>
              </button>
            </form>
          ) : (
            /* ACHIEVEMENTS FORM */
            <form onSubmit={handleSaveAchievement} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  {isEditingAchievement ? (
                    <Edit className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {isEditingAchievement ? "Edit Achievement Item" : "Add New Achievement Item"}
                  </span>
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
                <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hackathon Winners 2025"
                  value={achievementForm.title}
                  onChange={(e) =>
                    setAchievementForm({ ...achievementForm, title: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter achievement details..."
                  value={achievementForm.description}
                  onChange={(e) =>
                    setAchievementForm({ ...achievementForm, description: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Badge Type</label>
                  <select
                    value={achievementForm.badgeType}
                    onChange={(e) =>
                      setAchievementForm({
                        ...achievementForm,
                        badgeType: e.target.value as AchievementItem["badgeType"],
                      })
                    }
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="trophy">🏆 Trophy</option>
                    <option value="medal">🥇 Medal</option>
                    <option value="ribbon">🎗️ Ribbon</option>
                    <option value="star">⭐ Star</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 22 May 2025"
                    value={achievementForm.date}
                    onChange={(e) =>
                      setAchievementForm({ ...achievementForm, date: e.target.value })
                    }
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Image (Cloudflare R2 Bucket / Upload)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={achievementForm.image}
                    onChange={(e) =>
                      setAchievementForm({ ...achievementForm, image: e.target.value })
                    }
                    className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex-shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "achievement")}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {achievementForm.image && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 bg-slate-950 mt-2">
                    <img
                      src={achievementForm.image}
                      alt="Achievement Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{isEditingAchievement ? "Save Changes" : "Add Achievement Item"}</span>
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: List Views & Auto-Fetch News Tool */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === "news" ? (
            /* CAMPUS NEWS LIST */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-400" />
                  <span>Existing Campus News ({newsList.length})</span>
                </h3>
              </div>

              {newsList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No news items added yet. Use the form on the left to add one!
                </div>
              ) : (
                <div className="space-y-3">
                  {newsList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                              {item.tag}
                            </span>
                            <span className="text-[11px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditNews(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg border border-slate-800 transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          className="p-2 bg-slate-900 hover:bg-rose-950/50 text-rose-400 rounded-lg border border-slate-800 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "generalNews" ? (
            /* GENERAL NEWS MANAGEMENT & AUTO-FETCH TOOL */
            <div className="space-y-6">
              {/* SEARCH & AUTO-FETCH NEWS API PANEL */}
              <div className="bg-slate-900 border border-purple-900/40 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <div>
                      <h3 className="font-extrabold text-base text-white">Search & Auto-Fetch News</h3>
                      <p className="text-xs text-slate-400">Discover and 1-click import global news articles</p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Topic (e.g. AI, Space, Science)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && autoFetchExternalNews(searchQuery)}
                        className="w-full text-xs pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => autoFetchExternalNews(searchQuery)}
                      disabled={fetchingNews}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingNews ? "animate-spin" : ""}`} />
                      <span>{fetchingNews ? "Fetching..." : "Fetch News"}</span>
                    </button>
                  </div>
                </div>

                {/* Fetched News Results Grid */}
                {fetchedNews.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Fetched Articles for "{searchQuery}" ({fetchedNews.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fetchedNews.map((art) => (
                        <div
                          key={art.id}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between"
                        >
                          <div>
                            <img
                              src={art.image}
                              alt={art.title}
                              className="w-full h-24 object-cover rounded-xl mb-2"
                            />
                            <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold mb-1">
                              <span>{art.tag}</span>
                              <span className="text-slate-500">{art.source}</span>
                            </div>
                            <h5 className="font-bold text-xs text-white leading-snug mb-1 line-clamp-2">
                              {art.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                              {art.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleImportFetchedArticle(art)}
                            className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Import to General News</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* EXISTING GENERAL NEWS LIST */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>Active General News Items ({generalNewsList.length})</span>
                  </h3>
                </div>

                {generalNewsList.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No general news items added yet. Use the form on the left or auto-fetch above to add items!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generalNewsList.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                                {item.tag}
                              </span>
                              <span className="text-[11px] text-slate-400">{item.date}</span>
                              {item.source && (
                                <span className="text-[10px] text-slate-500 font-semibold">• {item.source}</span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-white">{item.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleEditGenNews(item)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-purple-400 rounded-lg border border-slate-800 transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGenNews(item.id)}
                            className="p-2 bg-slate-900 hover:bg-rose-950/50 text-rose-400 rounded-lg border border-slate-800 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ACHIEVEMENTS ITEMS LIST */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Existing Achievements ({achievementsList.length})</span>
                </h3>
              </div>

              {achievementsList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No achievement items added yet. Use the form on the left to add one!
                </div>
              ) : (
                <div className="space-y-3">
                  {achievementsList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                          />
                          <span className="absolute -top-1.5 -left-1.5 text-xs bg-slate-900 p-1 rounded-full border border-slate-700">
                            {item.badgeType === "trophy" && "🏆"}
                            {item.badgeType === "medal" && "🥇"}
                            {item.badgeType === "ribbon" && "🎗️"}
                            {item.badgeType === "star" && "⭐"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                              {item.badgeType}
                            </span>
                            <span className="text-[11px] text-slate-400">{item.date}</span>
                          </div>
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleEditAchievement(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800 transition-colors"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAchievement(item.id)}
                          className="p-2 bg-slate-900 hover:bg-rose-950/50 text-rose-400 rounded-lg border border-slate-800 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
