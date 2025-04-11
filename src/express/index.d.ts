import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // o tu tipo personalizado
    }
  }
}
