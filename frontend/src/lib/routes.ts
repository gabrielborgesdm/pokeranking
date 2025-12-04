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
