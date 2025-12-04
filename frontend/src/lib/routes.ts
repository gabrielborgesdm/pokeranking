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
  myRankings: "/my-rankings",
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
];

export const authPaths = [
  routes.signin,
  routes.signup,
  routes.verifyEmail,
  routes.forgotPassword,
  routes.resetPassword,
];

export const adminPaths = ["/admin"];
