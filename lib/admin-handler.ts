import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type AppRouteHandler = (
  request: Request
) => Promise<Response> | Response;

export function withAdminAuth(handler: AppRouteHandler): AppRouteHandler {
  return async (req: Request) => {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      console.warn(
        `[SECURITY] Unauthorized admin API attempt by: ${session.user.email}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      return await handler(req);
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
