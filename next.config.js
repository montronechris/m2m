/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurazione base per Next.js 15
  reactStrictMode: true,
  
  // Se usi immagini esterne (es. da Supabase o Unsplash), aggiungile qui
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ylzuyhmtzfqnoyqkwiqx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;