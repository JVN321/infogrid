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
  id: number;
  welcomeText: string;
  titleHighlight: string;
  tagline: string;
  image: string;
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
  day: string;
  month: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  title: string;
  time: string;
  venue: string;
  category: string;
  categoryBadgeBg: string;
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
  heroSlides: [
    {
      id: 1,
      welcomeText: "Welcome to",
      titleHighlight: "Muthoot Community",
      tagline: "Stay informed. Stay inspired.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 2,
      welcomeText: "Discover Future Tech at",
      titleHighlight: "MITS Innovation Hub",
      tagline: "Empowering research, robotics & artificial intelligence.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: 3,
      welcomeText: "Excellence in Education",
      titleHighlight: "Global Placements & Growth",
      tagline: "Building tomorrow's technology leaders today.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  news: [
    {
      id: "news-1",
      tag: "NEW",
      tagColor: "blue",
      title: "New AI & DS Lab Inaugurated",
      description: "The state-of-the-art AI & DS laboratory was inaugurated to empower innovation and research.",
      date: "28 May 2025",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-2",
      tag: "PLACEMENT",
      tagColor: "green",
      title: "Placement Drive 2025",
      description: "Over 40+ companies participated in the placement drive for the Batch of 2025.",
      date: "27 May 2025",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-3",
      tag: "INITIATIVE",
      tagColor: "darkgreen",
      title: "Green Campus Initiative",
      description: "Tree plantation drive held across the campus to promote a sustainable future.",
      date: "26 May 2025",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "news-4",
      tag: "TALK",
      tagColor: "orange",
      title: "Expert Talk on Cybersecurity",
      description: "An insightful session on emerging cybersecurity trends and career opportunities.",
      date: "24 May 2025",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    },
  ],
  featuredEvent: {
    badge: "TechFest 2.0",
    title: "IGNITE INNOVATION",
    tagline: "Code. Create. Conquer.",
    dateRange: "31 May - 02 June 2025",
    venue: "Main Auditorium & Various Venues",
    ctaText: "Register Now",
    ctaLink: "#",
    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80",
  },
  upcomingEvents: [
    {
      id: "event-1",
      day: "05",
      month: "JUN",
      color: "blue",
      title: "Workshop on Machine Learning",
      time: "10:00 AM - 01:00 PM",
      venue: "AI Lab",
      category: "Workshop",
      categoryBadgeBg: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      id: "event-2",
      day: "07",
      month: "JUN",
      color: "green",
      title: "Alumni Meet 2025",
      time: "10:00 AM - 04:00 PM",
      venue: "Seminar Hall",
      category: "Alumni",
      categoryBadgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      id: "event-3",
      day: "10",
      month: "JUN",
      color: "purple",
      title: "Startup Idea Pitching",
      time: "09:30 AM - 12:30 PM",
      venue: "Innovation Hub",
      category: "Competition",
      categoryBadgeBg: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      id: "event-4",
      day: "14",
      month: "JUN",
      color: "orange",
      title: "Industry Expert Session",
      time: "02:00 PM - 04:00 PM",
      venue: "Main Auditorium",
      category: "Session",
      categoryBadgeBg: "bg-amber-50 text-amber-600 border-amber-200",
    },
  ],
  achievements: [
    {
      id: "ach-1",
      badgeType: "trophy",
      title: "Hackathon Winners",
      description: "Secured 1st Place at CodeCrafters Hackathon 2025 among 120+ teams.",
      date: "22 May 2025",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "ach-2",
      badgeType: "medal",
      title: "Robotics Championship",
      description: "Our team won the Runners-up title at the National Robotics Championship.",
      date: "18 May 2025",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "ach-3",
      badgeType: "ribbon",
      title: "Academic Excellence",
      description: "Secured University 2nd Rank in B.Tech CSE (AI) Final Year Examinations.",
      date: "15 May 2025",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "ach-4",
      badgeType: "star",
      title: "Sports Achievement",
      description: "Champions of the Inter-College Football Tournament 2025.",
      date: "10 May 2025",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    },
  ],
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
