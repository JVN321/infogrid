export interface HeaderInfo {
  logoUrl: string;
  collegeName: string;
  collegeSub: string;
  motto: string;
  established: string;
  accreditations: {
    id: string;
    title: string;
    subtitle: string;
    badgeText?: string;
  }[];
  liveTime: string;
  liveDay: string;
  liveDate: string;
}

export interface HeroSlide {
  id: string;
  welcomeText: string;
  titleHighlight: string;
  tagline: string;
  image: string;
  orderIndex?: number;
}

export interface NewsItem {
  id: string;
  tag: string;
  tagColor: 'blue' | 'green' | 'darkgreen' | 'orange' | 'purple';
  title: string;
  description: string;
  date: string;
  image: string;
}

export interface GeneralNewsItem {
  id: string;
  tag: string;
  tagColor: 'blue' | 'green' | 'darkgreen' | 'orange' | 'purple';
  title: string;
  description: string;
  date: string;
  image: string;
  source?: string;
  url?: string;
}

export interface FeaturedEvent {
  badge: string;
  title: string;
  tagline: string;
  dateRange: string;
  venue: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

export interface UpcomingEvent {
  id: string;
  externalId?: string;
  day: string;
  month: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  title: string;
  time: string;
  venue: string;
  category: string;
  categoryBadgeBg: string;
  ctaLink?: string;
  tagline?: string;
  description?: string;
  dateRange?: string;
  date?: string;
  image?: string;
  badge?: string;
  ctaText?: string;
}

export interface AchievementItem {
  id: string;
  badgeType: 'trophy' | 'medal' | 'ribbon' | 'star';
  title: string;
  description: string;
  date: string;
  image: string;
}

export interface PortalData {
  header: HeaderInfo;
  heroSlides: HeroSlide[];
  news: NewsItem[];
  generalNews: GeneralNewsItem[];
  featuredEvent: FeaturedEvent;
  upcomingEvents: UpcomingEvent[];
  achievements: AchievementItem[];
  footer: {
    quote: string;
    quoteAuthor: string;
    stayConnectedTitle: string;
    stayConnectedSubtitle: string;
    handle: string;
    socialLinks: { platform: string; url: string }[];
    bottomBannerText: string;
  };
}

export const defaultSkeletonData: PortalData = {
  header: {
    logoUrl: "/logo-placeholder.svg",
    collegeName: "MUTHOOT",
    collegeSub: "INSTITUTE OF TECHNOLOGY & SCIENCE",
    motto: "Learn. Innovate. Excel.",
    established: "Estd. 2000",
    accreditations: [
      {
        id: "naac",
        title: "NAAC",
        subtitle: "A GRADE ACCREDITED",
        badgeText: "A",
      },
      {
        id: "nba",
        title: "NBA",
        subtitle: "NATIONAL BOARD OF ACCREDITATION",
      },
      {
        id: "iic",
        title: "INSTITUTION'S INNOVATION COUNCIL",
        subtitle: "(Ministry of Education Initiative)",
      },
    ],
    liveTime: "10:42 AM",
    liveDay: "Wednesday",
    liveDate: "28 May 2025",
  },
  heroSlides: [],
  news: [],
  generalNews: [],
  featuredEvent: {
    badge: "Stay Tuned",
    title: "MORE EVENTS COMING SOON",
    tagline: "Watch this space for upcoming activities.",
    dateRange: "",
    venue: "Campus",
    ctaText: "Check Back Later",
    ctaLink: "#",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
  },
  upcomingEvents: [],
  achievements: [],
  footer: {
    quote: "Education is the most powerful weapon which you can use to change the world.",
    quoteAuthor: "Nelson Mandela",
    stayConnectedTitle: "STAY CONNECTED",
    stayConnectedSubtitle: "Scan to explore more",
    handle: "@muthootgroup",
    socialLinks: [
      { platform: "Instagram", url: "#" },
      { platform: "LinkedIn", url: "#" },
      { platform: "Facebook", url: "#" },
    ],
    bottomBannerText: "Stay Informed. Stay Inspired. Be a Part of Our Journey. 💙",
  },
};
