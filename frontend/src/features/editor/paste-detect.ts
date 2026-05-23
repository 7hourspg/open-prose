// Conservative heuristic: only auto-wrap pasted plaintext as a code block
// when it has at least two newlines AND the first non-empty line looks like
// code. Misfires on prose are far worse than missing on a code paste, so we
// keep the trigger narrow.

const CODE_FIRST_LINE_PATTERNS: RegExp[] = [
  /^\s*(import|export|from|require)\b/,
  /^\s*(function|class|interface|type|enum|struct|trait|impl|namespace|module|package)\b/,
  /^\s*(const|let|var|public|private|protected|static|async|await|return)\b/,
  /^\s*(def|fn|func|sub|proc)\b/,
  /^\s*(if|for|while|switch|case|try|catch|finally|throw|do|else|elif|foreach|loop)\b/,
  /^\s*#(include|define|pragma|ifdef|ifndef|endif|if|else)\b/,
  /^\s*<\?(php|=)/,
  /^\s*(@\w+|<\w+[\s>/])/,                          // decorators or HTML/JSX
  /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i,
  /^\s*\$\s+\w+/,                                    // shell prompt
  /^\s*\w+\s*[:=]\s*function\b/,                     // foo = function() / foo: function
  /^\s*\}\s*$/,                                      // standalone closing brace
];

const CODE_BODY_HINTS: RegExp[] = [
  /\{\s*$/m,            // opening brace at line end
  /;\s*$/m,             // semicolon line endings
  /=>\s*\{?/,           // arrow fns
  /^\s{2,}\S/m,         // indented continuation lines
];

export function looksLikeCode(text: string): boolean {
  if (!text) return false;
  const normalised = text.replace(/\r\n?/g, "\n");
  if ((normalised.match(/\n/g)?.length ?? 0) < 2) return false;

  const lines = normalised.split("\n");
  const firstLine = lines.find((l) => l.trim().length > 0);
  if (!firstLine) return false;

  if (CODE_FIRST_LINE_PATTERNS.some((re) => re.test(firstLine))) return true;

  // Fallback: many body-shape hints + leading indentation on most lines.
  const bodyHits = CODE_BODY_HINTS.reduce(
    (n, re) => n + (re.test(normalised) ? 1 : 0),
    0
  );
  const indentedLines = lines.filter((l) => /^\s{2,}\S/.test(l)).length;
  return bodyHits >= 2 && indentedLines >= 2;
}
