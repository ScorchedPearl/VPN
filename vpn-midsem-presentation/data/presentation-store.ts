export type PresenterName = 'Vishwas' | 'Vichanshu' | 'Saumya';

export type PresentationSlide = {
  title: string;
  brief: string;
  imageSlots: number;
};

export type PresenterSection = {
  presenter: PresenterName;
  slides: PresentationSlide[];
};

export const presentationStore: PresenterSection[] = [
  {
    presenter: 'Vishwas',
    slides: [
      {
        title: 'Introduction and Motivation',
        brief:
          'Introduce VPNs, their uses, and why detecting VPN or proxy usage is important.',
        imageSlots: 2,
      },
      {
        title: 'Research Problem and Objectives',
        brief:
          'Explain the limitations of IP-based detection and state the main objectives of the project.',
        imageSlots: 2,
      },
    ],
  },
  {
    presenter: 'Vichanshu',
    slides: [
      {
        title: 'Literature Review Overview',
        brief:
          'Introduce the selected research papers and explain their connection to the project.',
        imageSlots: 2,
      },
      {
        title: 'Paper 1: Browser Fingerprinting',
        brief:
          'Present the paper’s approach, collected browser attributes, key results, and limitations.',
        imageSlots: 2,
      },
      {
        title: 'Paper 2: Cross-Browser Device Identification',
        brief:
          'Explain how hardware and operating-system characteristics can identify the same device across different browsers.',
        imageSlots: 2,
      },
      {
        title: 'Paper 3: Server-Side VPN Detection',
        brief:
          'Explain how server-visible information such as IP location, network provider, routing, and latency can indicate VPN usage.',
        imageSlots: 2,
      },
      {
        title: 'Literature Review Synthesis',
        brief:
          'Compare the three papers and summarize the techniques adopted for the proposed project.',
        imageSlots: 2,
      },
      {
        title: 'Research Gap',
        brief:
          'Explain the lack of systems that combine browser fingerprints, device similarity, and network signals for explainable VPN detection.',
        imageSlots: 2,
      },
      {
        title: 'Limits of Absolute Device Uniqueness',
        brief:
          'Explain why browser and hardware signals cannot guarantee universal device uniqueness, particularly under privacy protections and active evasion.',
        imageSlots: 0,
      },
    ],
  },
  {
    presenter: 'Saumya',
    slides: [
      {
        title: 'Problem Statement',
        brief:
          'Clearly state the problem of identifying VPN-like sessions using browser and network information.',
        imageSlots: 2,
      },
      {
        title: 'Proposed Framework',
        brief:
          'Show the main stages: data collection, fingerprint generation, session comparison, network analysis, and risk assessment.',
        imageSlots: 2,
      },
      {
        title: 'System Architecture',
        brief:
          'Present the interaction between the browser, server, fingerprinting engine, risk-analysis module, database, and dashboard.',
        imageSlots: 2,
      },
      {
        title: 'Preliminary Findings',
        brief:
          'Present early observations, such as IP changes, stable device characteristics, and location or timezone inconsistencies.',
        imageSlots: 2,
      },
      {
        title: 'Feature Collection and Preprocessing',
        brief:
          'Explain which browser, hardware, environment, and network parameters are collected and how they are standardized.',
        imageSlots: 2,
      },
      {
        title: 'Browser Fingerprint Generation',
        brief:
          'Explain how canvas, WebGL, fonts, screen details, hardware information, and browser properties form a fingerprint.',
        imageSlots: 2,
      },
      {
        title: 'Individual Fingerprint Comparison',
        brief:
          'Explain how fingerprints from different individuals or sessions are compared using parameter matches and similarity scores.',
        imageSlots: 2,
      },
    ],
  },
  {
    presenter: 'Vishwas',
    slides: [
      {
        title: 'Current System Flaws and Limitations',
        brief:
          'Discuss false detections, unstable or unavailable parameters, spoofing, browser privacy protections, and the limited dataset.',
        imageSlots: 2,
      },
      {
        title: 'Future Improvements',
        brief:
          'Present plans for improved network intelligence, more reliable fingerprint matching, a larger labelled dataset, and better risk assessment.',
        imageSlots: 2,
      },
      {
        title: 'Statistical Parameter-Importance Analysis',
        brief:
          'Explain how statistical methods will measure and rank the effect of each browser and network parameter.',
        imageSlots: 2,
      },
      {
        title: 'Redundancy Analysis and Feature Selection',
        brief:
          'Identify correlated or unnecessary parameters and select the most useful non-redundant feature set.',
        imageSlots: 2,
      },
      {
        title: 'Conclusion',
        brief:
          'Summarize the proposed approach, prototype contribution, current limitations, and next research steps.',
        imageSlots: 2,
      },
    ],
  },
];

export const presentationSlides = presentationStore.flatMap((section) =>
  section.slides.map((slide) => ({ ...slide, presenter: section.presenter })),
);
