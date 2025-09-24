// Minimal data for train page functionality

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  baselineMood: 'Angry' | 'Upset' | 'Anxious' | 'Confused';
  emoji: string;
  languages: string[];
  industries: string[];
  tags: string[];
}

export interface Scenario {
  id: string;
  title: string;
  personaId: string;
  mood: string;
  objectives: string[];
  policies: string[];
  difficultyDefault: 'Beginner' | 'Standard' | 'Advanced';
  description: string;
  industry: string;
  skills: string[];
  durationMin: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  languages: string[];
  modality: 'Voice' | 'Chat' | 'Multimodal';
  policyKeywords: string[];
  successCriteria: string[];
  image?: string;
}

export interface SessionState {
  id: string;
  status: 'idle' | 'live' | 'paused' | 'ended';
  startedAt?: string;
  timerSec: number;
  difficulty: 'Beginner' | 'Standard' | 'Advanced';
  intensity: 0 | 1 | 2 | 3;
  transcript: Array<{
    who: 'you' | 'persona' | 'coach';
    text: string;
    at: string;
    bookmarked?: boolean;
  }>;
}

// Mock persona data
export const personas: Persona[] = [
  {
    id: '1',
    name: 'Amira',
    role: 'Hotel Guest',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
    description: 'Business traveler dealing with room service delays during an important conference.',
    difficulty: 'Intermediate',
    baselineMood: 'Angry',
    emoji: '👩🏽‍💼',
    languages: ['English'],
    industries: ['Hospitality'],
    tags: ['Business', 'Time-sensitive', 'Professional']
  },
  {
    id: '2',
    name: 'Tom',
    role: 'Retail Customer', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    description: 'Frustrated parent trying to return defective toys without a receipt.',
    difficulty: 'Advanced',
    baselineMood: 'Upset',
    emoji: '👨🏻‍🦱',
    languages: ['English'],
    industries: ['Retail'],
    tags: ['Parent', 'Frustrated', 'Policy-challenged']
  },
  {
    id: '3',
    name: 'Nora',
    role: 'Pharmacy Client',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    description: 'Elderly patient whose regular medication is temporarily unavailable.',
    difficulty: 'Beginner',
    baselineMood: 'Anxious',
    emoji: '👵🏻',
    languages: ['English'],
    industries: ['Healthcare'],
    tags: ['Elderly', 'Health-dependent', 'Vulnerable']
  }
];

// Mock scenarios data  
export const scenarios: Scenario[] = [
  {
    id: '1',
    title: 'De-escalating an Angry Guest',
    personaId: '1',
    mood: 'Angry',
    description: 'Handle a frustrated hotel guest whose room service order has been significantly delayed during an important business conference.',
    industry: 'Hospitality',
    skills: ['De-escalation', 'Empathy', 'Patience'],
    durationMin: 25,
    level: 'Intermediate',
    languages: ['English'],
    modality: 'Multimodal',
    objectives: [
      'Acknowledge the guest\'s frustration',
      'Apologize for the delay',
      'Offer immediate solutions',
      'Provide compensation if appropriate'
    ],
    policies: [
      'Room service should be delivered within 45 minutes',
      'Guests can receive meal vouchers for delays over 1 hour',
      'Manager approval required for room upgrades'
    ],
    difficultyDefault: 'Standard',
    policyKeywords: ['room service', 'delay', 'compensation', 'voucher'],
    successCriteria: [
      'Guest feels heard and understood',
      'Immediate action plan provided',
      'Guest satisfaction restored'
    ]
  },
  {
    id: '2',
    title: 'Refund Request at Retail',
    personaId: '2',
    mood: 'Upset',
    description: 'Navigate complex return policies while maintaining customer relationships and store policies.',
    industry: 'Retail',
    skills: ['Negotiation', 'Compliance', 'Clarity'],
    durationMin: 30,
    level: 'Advanced',
    languages: ['English'],
    modality: 'Multimodal',
    objectives: [
      'Understand the customer\'s situation',
      'Explain return policy clearly',
      'Find alternative solutions',
      'Maintain positive relationship'
    ],
    policies: [
      'Returns accepted within 30 days with receipt',
      'Store credit available without receipt',
      'Manager override for exceptional cases'
    ],
    difficultyDefault: 'Advanced',
    policyKeywords: ['return', 'receipt', 'store credit', 'policy'],
    successCriteria: [
      'Customer understands policy',
      'Alternative solution found',
      'Relationship maintained'
    ]
  },
  {
    id: '3',
    title: 'Out-of-Stock at Pharmacy',
    personaId: '3',
    mood: 'Anxious',
    description: 'Handle medication availability issues with empathy while providing alternative solutions.',
    industry: 'Healthcare',
    skills: ['Empathy', 'Clarity', 'Compliance'],
    durationMin: 20,
    level: 'Beginner',
    languages: ['English'],
    modality: 'Multimodal',
    objectives: [
      'Acknowledge health concerns',
      'Explain availability issues',
      'Provide alternative options',
      'Ensure continuity of care'
    ],
    policies: [
      'Check alternative medications with pharmacist',
      'Contact prescribing physician if needed',
      'Offer delivery from other locations'
    ],
    difficultyDefault: 'Beginner',
    policyKeywords: ['medication', 'availability', 'alternative', 'physician'],
    successCriteria: [
      'Patient feels cared for',
      'Clear next steps provided',
      'Health continuity ensured'
    ]
  }
];