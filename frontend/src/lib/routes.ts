export const routes = {
  home: "/main/rankings",
  users: "/main/users",
  pokedex: "/pokedex",
  contribute: "/main/contribute",
  design: "/main/design",
  signin: "/main/signin",
  signup: "/main/signup",
  verifyEmail: "/main/verify-email",
  forgotPassword: "/main/forgot-password",
  resetPassword: "/main/reset-password",
  settings: "/main/settings",
  account: "/main/account",
  rankings: "/main/rankings",
  ranking: (id: string) => `/main/rankings/${id}` as const,
  rankingEdit: (id: string) => `/main/rankings/${id}/edit` as const,
  rankingRank: (id: string) => `/main/rankings/${id}/rank` as const,
  rankingNew: "/main/rankings/new",
  userRankings: (username: string) => `/main/rankings/user/${username}` as const,
  support: "/main/support",
  // Admin routes
  adminPokemon: "/main/pokemon",
  adminPokemonNew: "/main/pokemon/new",
  adminPokemonBulk: "/main/pokemon/bulk",
  adminPokemonEdit: (id: string) => `/main/pokemon/${id}/edit` as const,
} as const;

export const publicPaths = [
  '/main',
  routes.home,
  routes.users,
  routes.contribute,
  routes.design,
  "/main/rankings/user",
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

export const adminPaths = ["/main/pokemon"];
