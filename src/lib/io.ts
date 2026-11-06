/** Versioned export/import with validation and useful errors. */

import type { AppState } from "../types/state";
import { sanitizeState } from "./storage";

export const EXPORT_APP = "qa-lab";
export const EXPORT_VERSION = 1;

export interface ExportEnvelope {
  app: typeof EXPORT_APP;
  version: number;
  exportedAt: string;
  data: AppState;
}

export function makeExport(state: AppState): ExportEnvelope {
  return { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data: state };
}

export function exportToString(state: AppState): string {
  return JSON.stringify(makeExport(state), null, 2);
}

export interface ImportResult {
  ok: boolean;
  errors: string[];
  data?: AppState;
}

export function validateImport(text: string): ImportResult {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: [`Not valid JSON: ${(e as Error).message}`] };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, errors: ["Expected a JSON object exported from QABrew."] };
  }
  const env = parsed as Partial<ExportEnvelope>;
  if (env.app !== EXPORT_APP) {
    errors.push(`Field "app" must be "${EXPORT_APP}" (found ${JSON.stringify(env.app)}). This does not look like a QABrew export.`);
  }
  if (typeof env.version !== "number") {
    errors.push('Field "version" is missing or not a number.');
  } else if (env.version > EXPORT_VERSION) {
    errors.push(`Export version ${env.version} is newer than this app supports (${EXPORT_VERSION}). Update QABrew first.`);
  }
  if (typeof env.data !== "object" || env.data === null || Array.isArray(env.data)) {
    errors.push('Field "data" must be an object containing your progress.');
    return { ok: false, errors };
  }
  const d = env.data as Partial<AppState>;
  if (d.version !== 1) errors.push('data.version must be 1.');
  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, errors: [], data: sanitizeState(d) };
}

/** Trigger a file download in the browser. */
export function downloadJSON(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
