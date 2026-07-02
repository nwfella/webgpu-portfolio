/** Portfolio content data */
export interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  link: string;
  color: string;
}

export interface Skill {
  name: string;
  level: number; // 0-1
  category: string;
  color: string;
}

export const PROJECTS: Project[] = [
  {
    id: 0,
    title: 'Bikini Bottom Breakout',
    subtitle: 'Canvas Game',
    description: 'Faithful arcade homage — SpongeBob-themed breakout with progressive difficulty, particle effects, and touch controls. Built as standalone HTML/JS, deployed on GitHub Pages.',
    tags: ['Canvas 2D', 'Game Dev', 'HTML5', 'Touch UI'],
    link: 'https://nwfella.github.io/bikini-bottom-breakout/',
    color: '#6c5ce7',
  },
  {
    id: 1,
    title: 'Zaxxon Prime',
    subtitle: '3D Isometric Shooter',
    description: 'Isometric corridor shooter with WebGL-style 3D projection, enemy AI, weapon system, and mobile touch controls. Full PWA with offline support. MIT licensed.',
    tags: ['WebGL', '3D Graphics', 'Game Dev', 'PWA'],
    link: 'https://nwfella.github.io/zaxxon-prime/',
    color: '#e74c3c',
  },
  {
    id: 2,
    title: 'LP Manager',
    subtitle: 'DeFi Dashboard',
    description: 'Multi-chain liquidity position manager for Uniswap V2/V3, Aerodrome, PancakeSwap. Encrypted keystore, real-time P&L tracking, V3 rebalancing across Ethereum, Base, BSC, Arbitrum, HyperEVM.',
    tags: ['Web3', 'DeFi', 'Python', 'Smart Contracts'],
    link: '#',
    color: '#2ecc71',
  },
  {
    id: 3,
    title: 'Daily Cryptograph',
    subtitle: 'Automated Newsletter',
    description: 'Daily AI-generated crypto newspaper in Victorian-era style. Pulls from Cointelegraph, renders as HTML, auto-deploys to GitHub Pages via cron. Runs at 9AM PT daily.',
    tags: ['Automation', 'AI', 'Cron', 'HTML'],
    link: 'https://nwfella.github.io/Bitcoin-and-Crypto-news-06-05-2026/',
    color: '#f39c12',
  },
  {
    id: 4,
    title: 'Polymarket Monitor',
    subtitle: 'Prediction Markets',
    description: 'Real-time Polymarket data queries — market prices, orderbooks, historical trends. Integrated into automated agent workflows for crypto-native research.',
    tags: ['Prediction Markets', 'API', 'Data Viz'],
    link: '#',
    color: '#3498db',
  },
  {
    id: 5,
    title: 'WebGPU Portfolio',
    subtitle: 'This Site',
    description: 'Raw WebGPU + WGSL compute shader engine. 65K GPU-driven particles, bloom post-processing, procedural sky, interactive 3D scene. Zero frameworks — pure GPU programming showcase.',
    tags: ['WebGPU', 'WGSL', 'Compute Shaders', 'TypeScript'],
    link: '#',
    color: '#9b59b6',
  },
];

export const SKILLS: Skill[] = [
  { name: 'WebGPU', level: 0.9, category: 'Graphics', color: '#6c5ce7' },
  { name: 'TypeScript', level: 0.95, category: 'Language', color: '#3178c6' },
  { name: 'Python', level: 0.9, category: 'Language', color: '#3776ab' },
  { name: 'Canvas 2D', level: 0.95, category: 'Graphics', color: '#e74c3c' },
  { name: 'Web3 / DeFi', level: 0.85, category: 'Blockchain', color: '#2ecc71' },
  { name: 'Solidity', level: 0.7, category: 'Blockchain', color: '#363636' },
  { name: 'WGSL', level: 0.8, category: 'Graphics', color: '#a29bfe' },
  { name: 'HTML/CSS', level: 0.9, category: 'Web', color: '#e34f26' },
  { name: 'Node.js', level: 0.85, category: 'Backend', color: '#339933' },
  { name: 'React', level: 0.7, category: 'Frontend', color: '#61dafb' },
  { name: 'Vite', level: 0.85, category: 'Build', color: '#646cff' },
  { name: 'Git', level: 0.9, category: 'Tooling', color: '#f05032' },
  { name: 'CI/CD', level: 0.8, category: 'DevOps', color: '#2088ff' },
  { name: 'Automation', level: 0.85, category: 'DevOps', color: '#00bcd4' },
  { name: 'Jellyfin', level: 0.8, category: 'Media', color: '#00b4ff' },
  { name: 'Linux', level: 0.85, category: 'Systems', color: '#fcc624' },
];

export const PROFILE = {
  name: 'nwfella',
  subtitle: 'GPU Programmer · Web3 Developer · Canvas Craftsman',
  bio: 'Crypto-native developer building GPU-accelerated web experiences, DeFi dashboards, and arcade game homages. Raw WebGPU, compute shaders, and zero-framework engineering.',
  email: '',
  github: 'https://github.com/nwfella',
  linkedin: '',
};
