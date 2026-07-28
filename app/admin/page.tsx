"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NewsItem, AchievementItem, defaultSkeletonData } from "@/data/skeletonData";
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
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"news" | "achievements">("news");

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Data States
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [achievementsList, setAchievementsList] = useState<AchievementItem[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modals & Form states
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
      const [newsRes, achRes] = await Promise.all([
        fetch("/api/news"),
        fetch("/api/achievements"),
      ]);

      if (newsRes.ok && achRes.ok) {
        const newsData = await newsRes.json();
        const achData = await achRes.json();

        if (Array.isArray(newsData) && Array.isArray(achData)) {
          setNewsList(newsData.length > 0 ? newsData : defaultSkeletonData.news);
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
        setAchievementsList(parsed.achievements || defaultSkeletonData.achievements);
      } catch (e) {
        setNewsList(defaultSkeletonData.news);
        setAchievementsList(defaultSkeletonData.achievements);
      }
    } else {
      setNewsList(defaultSkeletonData.news);
      setAchievementsList(defaultSkeletonData.achievements);
    }
  };

  // Sync state changes to LocalStorage for instant preview sync
  const syncToLocalStorage = (updatedNews: NewsItem[], updatedAch: AchievementItem[]) => {
    try {
      const existing = localStorage.getItem("infogrid_portal_data");
      const dataObj = existing ? JSON.parse(existing) : defaultSkeletonData;
      dataObj.news = updatedNews;
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
    target: "news" | "achievement"
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

  // NEWS HANDLERS
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.description) {
      showNotify("Please fill in title and description", "error");
      return;
    }

    let updatedList: NewsItem[] = [];

    if (isEditingNews && editingNewsId) {
      // Update news
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
      // Add new news
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
    syncToLocalStorage(updatedList, achievementsList);
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
    if (!confirm("Are you sure you want to delete this news item?")) return;
    const updatedList = newsList.filter((item) => item.id !== id);
    setNewsList(updatedList);

    if (isDbConnected) {
      try {
        await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      } catch (e) {
        console.error("Prisma delete error:", e);
      }
    }
    syncToLocalStorage(updatedList, achievementsList);
    showNotify("News item deleted", "info");
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

  // ACHIEVEMENTS HANDLERS
  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title || !achievementForm.description) {
      showNotify("Please fill in title and description", "error");
      return;
    }

    let updatedList: AchievementItem[] = [];

    if (isEditingAchievement && editingAchievementId) {
      // Update achievement
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
      // Add new achievement
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
    syncToLocalStorage(newsList, updatedList);
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
    syncToLocalStorage(newsList, updatedList);
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
      setAchievementsList(defaultSkeletonData.achievements);
      syncToLocalStorage(defaultSkeletonData.news, defaultSkeletonData.achievements);
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

      {/* Info Status Banner: Cloudflare R2 & Supabase Prisma Status */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Cloudflare R2 Bucket & Prisma Ready
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Skipped Events Notice */}
      <div className="max-w-7xl mx-auto mb-6 p-4 bg-blue-950/40 border border-blue-800/60 rounded-2xl flex items-center justify-between text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Notice:</strong> Campus Events management is currently skipped for now as requested. Focus is on Campus News & Achievements Showcase media management.
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="max-w-7xl mx-auto mb-6 flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("news")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "news"
              ? "border-blue-500 text-blue-400 bg-blue-500/5 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Campus News Management ({newsList.length})</span>
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
          <span>Achievements Showcase Management ({achievementsList.length})</span>
        </button>
      </div>

      {/* MAIN TAB CONTENT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Add / Edit Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          {activeTab === "news" ? (
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

              {/* Title */}
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

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter news summary or details..."
                  value={newsForm.description}
                  onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Tag & Color Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category Tag</label>
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

              {/* Date */}
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

              {/* Image URL & Upload via Cloudflare R2 */}
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

                {/* Preview Image */}
                {newsForm.image && (
                  <div className="relative rounded-xl overflow-hidden h-28 border border-slate-800 bg-slate-950 mt-2">
                    <img
                      src={newsForm.image}
                      alt="News Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                <span>{isEditingNews ? "Save Changes" : "Add News Item"}</span>
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

              {/* Title */}
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

              {/* Description */}
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

              {/* Badge Type & Date */}
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

              {/* Image URL & Upload via Cloudflare R2 */}
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

                {/* Preview Image */}
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

        {/* RIGHT COLUMN: Items List Table/Cards View */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === "news" ? (
            /* NEWS ITEMS LIST */
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
