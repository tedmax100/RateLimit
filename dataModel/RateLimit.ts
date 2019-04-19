export class RateLimitContext {
    public limit: number = 0;
    public cnt?: number;
    public reset?: number;
}