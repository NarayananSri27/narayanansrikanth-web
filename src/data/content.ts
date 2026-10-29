export interface Project {
  title: string;
  description: string;
  year: string;
  tags: string[];
  link?: string;
  github?: string;
  featured?: boolean;
}

export interface SocialLink {
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  category: "primary" | "social" | "code" | "reading";
}

export interface SiteContent {
  author: {
    name: string;
    headline: string;
    university: string;
    department: string;
    location: string;
    bio: string[];
    avatarUrl: string;
    status: string;
  };
  interests: {
    technical: string[];
    creative: string[];
  };
  currently: {
    exploring: string[];
    reading: string[];
    goals: string[];
  };
  featuredProjects: Project[];
  allProjects: Project[];
  links: SocialLink[];
  contact: {
    email: string;
    note: string;
    responseTime: string;
  };
}

export const siteContent: SiteContent = {
  author: {
    name: "Narayanan Srikanth",
    headline: "Engineering student at McGill University",
    university: "McGill University",
    department: "Engineering",
    location: "Montréal, Canada",
    bio: [
      "I am an engineering student at McGill University interested in building reliable software systems, exploring quantitative models in finance, and understanding high-consequence engineering across defence and aerospace.",
      "Outside the lab and the terminal, I spend my time watching cinema, listening to and analyzing music, writing, and practicing photography.",
      "This website serves as my quiet corner of the internet — an archive of what I build, study, and capture over time.",
    ],
    avatarUrl: "/images/portrait-placeholder.svg",
    status: "Currently studying at McGill & building projects.",
  },

  interests: {
    technical: [
      "Software Engineering",
      "Finance & Fintech",
      "Risk Research",
      "Defence & Aerospace Systems",
      "Automation & Tooling",
      "Data & Computational Modeling",
    ],
    creative: [
      "Cinema & Film Analysis",
      "Music Production & Sound",
      "Writing & Research Notes",
      "Photography",
    ],
  },

  currently: {
    exploring: [
      "Low-latency systems & concurrency patterns",
      "Statistical risk metrics & algorithmic execution",
      "Autonomous guidance principles & real-time embedded logic",
    ],
    reading: [
      "Systems engineering literature & control theory",
      "Modern quantitative finance papers",
      "Film theory & visual storytelling",
    ],
    goals: [
      "Deepen foundational engineering coursework at McGill",
      "Ship open-source software tools with zero fluff",
      "Curate a disciplined research notebook on risk and aerospace",
    ],
  },

  featuredProjects: [
    {
      title: "Risk Research & Quantitative Modeling Notebook",
      description:
        "An analytical framework exploring tail-risk metrics, stress-testing simulations, and historical drawdown dynamics for modern portfolios.",
      year: "2026",
      tags: ["Python", "Financial Modeling", "Risk Analysis"],
      link: "#",
      github: "https://github.com/placeholder-narayanan/risk-research",
      featured: true,
    },
    {
      title: "Embedded Guidance & Telemetry Simulator",
      description:
        "Prototyping state estimation, sensor filtering (Kalman filter), and telemetry logging for aerospace trajectory simulations.",
      year: "2025",
      tags: ["C++", "Aerospace Systems", "Simulation"],
      link: "#",
      github: "https://github.com/placeholder-narayanan/telemetry-sim",
      featured: true,
    },
    {
      title: "Automation & Audio Signal Analysis Tool",
      description:
        "Signal processing scripts and automated frequency response profiling for vocal enhancement and acoustic evaluation.",
      year: "2025",
      tags: ["Python", "DSP", "Automation"],
      link: "#",
      github: "https://github.com/placeholder-narayanan/audio-enhancer",
      featured: true,
    },
  ],

  allProjects: [
    {
      title: "Risk Research & Quantitative Modeling Notebook",
      description:
        "An analytical framework exploring tail-risk metrics, stress-testing simulations, and historical drawdown dynamics for modern portfolios.",
      year: "2026",
      tags: ["Python", "Financial Modeling", "Risk Analysis"],
      github: "https://github.com/placeholder-narayanan/risk-research",
      featured: true,
    },
    {
      title: "Embedded Guidance & Telemetry Simulator",
      description:
        "Prototyping state estimation, sensor filtering (Kalman filter), and telemetry logging for aerospace trajectory simulations.",
      year: "2025",
      tags: ["C++", "Aerospace Systems", "Simulation"],
      github: "https://github.com/placeholder-narayanan/telemetry-sim",
      featured: true,
    },
    {
      title: "Automation & Audio Signal Analysis Tool",
      description:
        "Signal processing scripts and automated frequency response profiling for vocal enhancement and acoustic evaluation.",
      year: "2025",
      tags: ["Python", "DSP", "Automation"],
      github: "https://github.com/placeholder-narayanan/audio-enhancer",
      featured: true,
    },
    {
      title: "Personal Budget & Ledger Engine",
      description:
        "A double-entry accounting CLI and personal ledger engine designed for transparent budgeting and spending tracking.",
      year: "2024",
      tags: ["TypeScript", "CLI", "Personal Finance"],
      github: "https://github.com/placeholder-narayanan/personal-budget",
      featured: false,
    },
  ],

  links: [
    {
      title: "GitHub",
      subtitle: "Code, open-source repositories, and experiments",
      url: "https://github.com/NarayananSri27",
      icon: "github",
      category: "code",
    },
    {
      title: "LinkedIn",
      subtitle: "Professional background and academic updates",
      url: "https://www.linkedin.com/in/narayanan-srikanth/",
      icon: "linkedin",
      category: "primary",
    },
    {
      title: "Email",
      subtitle: "Direct correspondence for research or collaboration",
      url: "mailto:narayanansri2007@gmail.com",
      icon: "mail",
      category: "primary",
    },
    {
      title: "Letterboxd",
      subtitle: "Films I have watched and reviewed",
      url: "https://letterboxd.com/narayanansri27/",
      icon: "external-link",
      category: "social",
    },
  ],

  contact: {
    email: "narayanansri2007@gmail.com",
    note: "I welcome thoughtful emails regarding engineering projects, research collaborations, book recommendations, or cinema.",
    responseTime: "Usually responds within 2-3 business days.",
  },
};


