export const routes = {
  home: "/",
  contribute: "/contribute",
  design: "/design",
  signin: "/signin",
  signup: "/signup",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  settings: "/settings",
  rankings: "/rankings",
  ranking: (id: string) => `/rankings/${id}` as const,
  rankingEdit: (id: string) => `/rankings/${id}/edit` as const,
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
  routes.home,
  routes.signin,
  routes.signup,
  routes.verifyEmail,
  routes.forgotPassword,
  routes.resetPassword,
  routes.contribute,
  routes.design,
  routes.rankings,
  "/rankings/user",
];

export const authPaths = [
  routes.signin,
  routes.signup,
  routes.verifyEmail,
  routes.forgotPassword,
  routes.resetPassword,
];

export const adminPaths = ["/admin"];
