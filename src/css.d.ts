declare module "*.css";

// Vite `?url` asset imports (used in _root.tsx to preload the font files
// with their content-hashed build filenames).
declare module "*.woff2?url" {
  const url: string;
  export default url;
}
