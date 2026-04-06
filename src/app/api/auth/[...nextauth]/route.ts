import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_DOMAINS = ["inhhair.com", "komboventures.com"];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? "";
      const domain = email.split("@")[1];
      return ALLOWED_DOMAINS.includes(domain);
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
