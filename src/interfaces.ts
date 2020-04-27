export interface IMiddleware {
  handler: string;
  path?: string;
  member?: string;
  watch?: string | string[];
}

export interface INormalizedMiddleware {
  handler: string;
  path: string;
  member: string;
  watch: string[];
}
