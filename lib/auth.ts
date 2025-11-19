import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import prisma from "./prisma";
import { sendEmail } from "./mailer";
import { passwordSchema } from "./schemas/auth";
import { env } from "./schemas/env.schema";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      const userInDb = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      if (userInDb?.role !== "CUSTOMER") {
        return;
      }

      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },

  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: "string",
        required: true,
        input: false,
        defaultValue: "CUSTOMER",
      },
    },
    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({ user, newEmail, url }) {
        await sendEmail({
          to: user.email,
          subject: "Approve email change",
          text: `Your email has been changed to ${newEmail}. Click the link to approve the change: ${url}`,
        });
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/signup/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Password does not meet security requirements",
          });
        }
      }
    }),
  },

  csrf: {
    enabled: true,
    secret: process.env.CSRF_SECRET,
  },

  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireLowercase: true,
    requireUppercase: true,
    hash: {
      algorithm: "scrypt",
    },
  },

  account: {
    modelName: "Account",
  },

  verification: {
    modelName: "Verification",
  },

  trustHost: true,

  advanced: {
    generateId: false,
    database: {
      generateId: false,
    },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  rateLimit: {
    enabled: true,
    window: 15 * 60 * 1000,
    max: 10,
    storage: "database",
    modelName: "rateLimit",
  },

  session: {
    storage: "database",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: false,
    },
  },

  trustedOrigins: ["http://localhost:3000", env.NEXT_PUBLIC_APP_URL],

  plugins: [
    nextCookies(),
    admin({
      defaultRole: "CUSTOMER",
      adminRole: "ADMIN",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
