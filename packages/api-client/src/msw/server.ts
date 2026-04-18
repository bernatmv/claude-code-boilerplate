import { setupServer } from "msw/node";

import { handlers } from "./handlers.js";

export function createMockServer() {
  return setupServer(...handlers);
}

export { handlers };
