import { RateLimitContext } from "../dataModel/RateLimit";

declare global{
    namespace Express {
        export interface Request {
            limit?: number;
            conext: RateLimitContext;
        }
      }
}
  