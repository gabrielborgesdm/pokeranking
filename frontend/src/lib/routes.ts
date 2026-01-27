export const routes = {
  home: "/rankings",
  users: "/users",
  pokedex: "/pokedex",
  contribute: "/contribute",
  design: "/design",
  signin: "/signin",
  signup: "/signup",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  settings: "/settings",
  account: "/account",
  rankings: "/rankings",
  ranking: (id: string) => `/rankings/${id}` as const,
  rankingEdit: (id: string) => `/rankings/${id}/edit` as const,
  rankingRank: (id: string) => `/rankings/${id}/rank` as const,
  rankingNew: "/rankings/new",
  userRankings: (username: string) => `/rankings/user/${username}` as const,
  support: "/support",
  // Admin routes
  adminPokemon: "/admin/pokemon",
  adminPokemonNew: "/admin/pokemon/new",
  adminPokemonBulk: "/admin/pokemon/bulk",
  adminPokemonEdit: (id: string) => `/admin/pokemon/${id}/edit` as const,
} as const;

export const publicPaths = [
  '/',
  routes.home,
  routes.users,
  routes.contribute,
  routes.design,
  "/rankings/user",
  routes.contribute,
  routes.pokedex,
];

// Paths that are public but should match exactly (not their children)
export const publicExactPaths = [
  routes.rankings,
];

export const authPaths = [
  routes.signin,
  routes.signup,
  routes.verifyEmail,
  routes.forgotPassword,
  routes.resetPassword,
];

export const adminPaths = ["/admin"];
