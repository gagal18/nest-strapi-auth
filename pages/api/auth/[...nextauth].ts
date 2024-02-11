import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { Account, AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google"

const options: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token, user }) {
        session.user = user
        return session
    },
    async jwt({ token, user, account }: { token: JWT; user: User; account: Account | null}) : Promise<JWT>{
        const isSignIn = user ? true : false;
        if (isSignIn && account) {
          try {
              const public_url = process.env.NEXT_PUBLIC_API_URL;
              const response = await fetch(
                  `${public_url}/api/auth/${account.provider}/callback?access_token=${account?.access_token}`
              );
              const data = await response.json();
              token.jwt = data.jwt;
              token.id = data.user.id;
          } catch (error) {
              console.error('Fetch failed:', error);
          }
      }
        return token;
      },
  },
};

const Auth = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);

export default Auth;
