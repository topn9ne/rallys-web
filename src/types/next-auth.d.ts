import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      userType: string;
    };
  }

  interface User {
    role?: string;
    userType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    userType?: string;
    userId?: string;
  }
}
