import { UserSession, AuthQuery } from "./auth";
import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: UserSession;
    tempUser?: AuthQuery;
  }
}
