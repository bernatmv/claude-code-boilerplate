import { createNoopProvider } from "./noop.js";
import type { AnalyticsProvider, EventProps } from "./types.js";

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
}

export interface Analytics {
  track(event: string, props?: EventProps): void;
  identify(userId: string, traits?: EventProps): void;
  page(name: string, props?: EventProps): void;
}

function safeInvoke(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(`[analytics] provider "${name}" threw`, err);
  }
}

export function createAnalytics(config: AnalyticsConfig): Analytics {
  const providers = config.providers.length === 0 ? [createNoopProvider()] : config.providers;

  return {
    track(event, props) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.track(event, props);
        });
      }
    },
    identify(userId, traits) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.identify(userId, traits);
        });
      }
    },
    page(name, props) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.page(name, props);
        });
      }
    },
  };
}
