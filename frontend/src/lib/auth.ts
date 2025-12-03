import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  authControllerLogin,
  authControllerGetProfile,
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const config = getConfig();

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

          const accessToken = loginResponse.data.access_token;

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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        token.profilePic = user.profilePic;
        token.accessToken = user.accessToken;
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
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
};
