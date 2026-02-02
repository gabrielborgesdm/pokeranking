import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  authControllerLogin,
  authControllerGetProfile,
  isApiError,
  type UserResponseDtoRole,
  type CustomFetchOptions,
} from "@pokeranking/api-client";
import { getConfig } from "./config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: UserResponseDtoRole;
      profilePic?: string;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    username: string;
    role: UserResponseDtoRole;
    profilePic?: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username: string;
    role: UserResponseDtoRole;
    profilePic?: string;
    accessToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
        token: { type: "text" },
      },
      async authorize(credentials) {
        const config = getConfig();
        let accessToken: string;

        // If token is provided directly (e.g., after email verification), use it
        if (credentials?.token) {
          accessToken = credentials.token;
        } else if (credentials?.email && credentials?.password) {
          // Standard login flow
          try {
            const loginResponse = await authControllerLogin(
              {
                identifier: credentials.email,
                password: credentials.password,
              },
              { baseUrl: config.apiUrl } as CustomFetchOptions
            );

            if (loginResponse.status !== 200) {
              return null;
            }

            accessToken = loginResponse.data.access_token;
          } catch (error) {
            // Pass the API error key to the client for translation
            if (isApiError(error) && error.data?.key) {
              throw new Error(error.data.key);
            }
            return null;
          }
        } else {
          return null;
        }

        try {

          const profileResponse = await authControllerGetProfile({
            baseUrl: config.apiUrl,
            token: accessToken,
          } as CustomFetchOptions);

          if (profileResponse.status !== 200) {
            return null;
          }

          const user = profileResponse.data;

          return {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            profilePic: user.profilePic,
            accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.profilePic = user.profilePic;
        token.accessToken = user.accessToken;
      }
      // Handle session updates from updateSession() calls
      if (trigger === "update" && session?.user) {
        if (session.user.username) {
          token.username = session.user.username;
        }
        if (session.user.profilePic !== undefined) {
          token.profilePic = session.user.profilePic;
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
        role: token.role,
        profilePic: token.profilePic,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/main/signin",
  },
  session: {
    strategy: "jwt",
  },
};
