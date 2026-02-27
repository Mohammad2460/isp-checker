export interface Service {
  name: string;
  url: string;
  icon: string;
}

export const SERVICES: Service[] = [
  { name: 'Supabase', url: 'https://supabase.co', icon: '⚡' },
  { name: 'Firebase', url: 'https://firebase.googleapis.com', icon: '🔥' },
  { name: 'MongoDB Atlas', url: 'https://cloud.mongodb.com', icon: '🍃' },
  { name: 'AWS', url: 'https://s3.amazonaws.com', icon: '☁️' },
  { name: 'Neon', url: 'https://neon.tech', icon: '🐘' },
  { name: 'PlanetScale', url: 'https://planetscale.com', icon: '🪐' },
  { name: 'Railway', url: 'https://railway.app', icon: '🚂' },
  { name: 'Render', url: 'https://render.com', icon: '🎨' },
  { name: 'Cloudflare', url: 'https://cloudflare.com', icon: '🌐' },
  { name: 'GitHub', url: 'https://github.com', icon: '🐙' },
];
