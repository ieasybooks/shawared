import { join } from "node:path";

/** SHAWARED_ROOT selects a fixture tree; otherwise scripts use this checkout. */
export const root = (): string => process.env.SHAWARED_ROOT ?? join(import.meta.dir, "..");
