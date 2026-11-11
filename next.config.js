/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Served from GitHub Pages at akashramsankar.github.io/pathword, like the other games.
  basePath: '/pathword',
  images: { unoptimized: true },
  trailingSlash: true,
}

module.exports = nextConfig