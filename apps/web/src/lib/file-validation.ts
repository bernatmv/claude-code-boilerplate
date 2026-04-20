export type FileValidationRule = {
  maxBytes?: number;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
};

export type FileValidationResult =
  | { ok: true }
  | { ok: false; error: string; code: "TOO_LARGE" | "BAD_MIME" | "BAD_EXTENSION" | "EMPTY" };

export const imageRules = {
  avatar: {
    maxBytes: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  },
  banner: {
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
  },
} as const satisfies Record<string, FileValidationRule>;

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(
  file: { name: string; type: string; size: number },
  rule: FileValidationRule,
): FileValidationResult {
  if (file.size === 0) return { ok: false, error: "File is empty", code: "EMPTY" };

  if (rule.maxBytes != null && file.size > rule.maxBytes) {
    return {
      ok: false,
      error: `File exceeds max size of ${formatBytes(rule.maxBytes)}`,
      code: "TOO_LARGE",
    };
  }

  if (rule.allowedMimeTypes && !rule.allowedMimeTypes.includes(file.type)) {
    return {
      ok: false,
      error: `Unsupported file type: ${file.type || "unknown"}`,
      code: "BAD_MIME",
    };
  }

  if (rule.allowedExtensions) {
    const ext = extensionOf(file.name);
    if (!rule.allowedExtensions.includes(ext)) {
      return {
        ok: false,
        error: `Unsupported file extension: .${ext || "none"}`,
        code: "BAD_EXTENSION",
      };
    }
  }

  return { ok: true };
}
