import { NextRequest, NextResponse } from "next/server";

// Curated high-quality fallbacks when NEWS_API_KEY is not configured
const sampleNewsDatabase: Record<string, Array<{
  tag: string;
  tagColor: "blue" | "green" | "darkgreen" | "orange" | "purple";
  title: string;
  description: string;
  date: string;
  image: string;
  source: string;
}>> = {
  technology: [
    {
      tag: "AI & TECH",
      tagColor: "purple",
      title: "Generative AI Accelerates Autonomous Code Generation",
      description: "New AI benchmarks reveal unprecedented speeds in automated software synthesis and bug resolution.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      source: "TechCrunch",
    },
    {
      tag: "SEMICONDUCTOR",
      tagColor: "blue",
      title: "2nm Chip Fabrication Begins Commercial Production",
      description: "Foundries start mass fabrication of next-generation 2nm silicon chips for ultra-efficient computing.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      source: "Verge Tech",
    },
    {
      tag: "ROBOTICS",
      tagColor: "orange",
      title: "Humanoid Robots Deployed in Modern Warehouses",
      description: "Logistics companies deploy autonomous humanoid assistants for high-precision sorting and packing.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      source: "Robotics Weekly",
    },
    {
      tag: "CYBERSECURITY",
      tagColor: "green",
      title: "Post-Quantum Cryptography Encryption Standard Adopted",
      description: "Global security consortium publishes standardized algorithms resistant to quantum computer decrypts.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      source: "Wired Security",
    },
  ],
  education: [
    {
      tag: "EDU TECH",
      tagColor: "blue",
      title: "VR Classrooms Transform Global Science Curriculum",
      description: "Immersive virtual reality labs allow students worldwide to conduct chemistry and physics experiments.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
      source: "EdTech Magazine",
    },
    {
      tag: "RESEARCH",
      tagColor: "green",
      title: "Global Higher Ed Research Grant Announced for Clean Energy",
      description: "Multinational consortium allocates $50M in research funding for green hydrogen and battery tech.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      source: "Academic World",
    },
    {
      tag: "INNOVATION",
      tagColor: "purple",
      title: "Inter-College Hackathons Driving Student Startups",
      description: "Student-led software startups receive seed investment right out of annual university hackathons.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      source: "Campus Venture",
    },
  ],
  science: [
    {
      tag: "SPACE",
      tagColor: "orange",
      title: "Lunar Base Module Completes Vacuum Testing",
      description: "Engineers successfully test the primary habitat module intended for permanent lunar research base.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
      source: "Space Exploration",
    },
    {
      tag: "BIOTECH",
      tagColor: "green",
      title: "CRISPR Gene Editing Cures Genetic Disorder in Trials",
      description: "Clinical trials report 100% remission rates for rare blood conditions using targeted gene therapy.",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80",
      source: "Bio Science Daily",
    },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "technology").toLowerCase().trim();
  const apiKey = process.env.NEWS_API_KEY;

  // 1. If NEWS_API_KEY is configured in env, attempt live NewsAPI.org fetch
  if (apiKey) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        q
      )}&sortBy=publishedAt&pageSize=6&language=en&apiKey=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "ok" && Array.isArray(data.articles) && data.articles.length > 0) {
        const liveArticles = data.articles.map((art: any, idx: number) => ({
          id: `newsapi-${Date.now()}-${idx}`,
          tag: q.toUpperCase().substring(0, 10),
          tagColor: idx % 2 === 0 ? "purple" : "blue",
          title: art.title || "Latest Headline",
          description: art.description || art.content || "No description provided.",
          date: new Date(art.publishedAt || Date.now()).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          image:
            art.urlToImage ||
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
          source: art.source?.name || "News API",
          url: art.url || "#",
        }));

        return NextResponse.json({
          provider: "NewsAPI.org (Live)",
          query: q,
          count: liveArticles.length,
          articles: liveArticles,
        });
      }
    } catch (err: any) {
      console.warn("Live NewsAPI fetch failed, using fallback database:", err.message);
    }
  }

  // 2. Fallback Engine when NEWS_API_KEY is omitted or during offline testing
  let categoryKey = "technology";
  if (q.includes("edu") || q.includes("college") || q.includes("study") || q.includes("learning")) {
    categoryKey = "education";
  } else if (q.includes("space") || q.includes("bio") || q.includes("science") || q.includes("physics")) {
    categoryKey = "science";
  }

  const baseItems = sampleNewsDatabase[categoryKey] || sampleNewsDatabase.technology;

  const results = baseItems.map((item, idx) => ({
    id: `fetched-${Date.now()}-${idx}`,
    tag: q ? q.substring(0, 10).toUpperCase() : item.tag,
    tagColor: item.tagColor,
    title:
      q !== "technology" && q !== "education" && q !== "science"
        ? `${q.charAt(0).toUpperCase() + q.slice(1)} Update: ${item.title}`
        : item.title,
    description: item.description,
    date: item.date,
    image: item.image,
    source: item.source,
  }));

  return NextResponse.json({
    provider: "Built-in Curated News Engine (Add NEWS_API_KEY in .env for live NewsAPI.org feed)",
    query: q,
    count: results.length,
    articles: results,
  });
}
