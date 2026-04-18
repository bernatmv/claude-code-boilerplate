export type EventProps = Record<string, string | number | boolean | null>;

export interface AnalyticsProvider {
  name: string;
  track(event: string, props?: EventProps): void;
  identify(userId: string, traits?: EventProps): void;
  page(name: string, props?: EventProps): void;
}
