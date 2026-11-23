import { copyFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The bounty manifest lives beside this program in the repository.
// Resolve it from the program's own location, never from the cwd,
// because the grader may invoke us from any working directory.
const source = join(repoDir, "BOUNTY.json");
const destination = join(outputDir, "BOUNTY.json");

// Validate the manifest before copying: it must be a JSON object with a
// non-empty "bounties" array of strings. This check never changes the
// output bytes; it only refuses to copy a malformed manifest.
function validateBountyManifest(path: string): void {
  const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as { bounties?: unknown }).bounties) ||
    ((parsed as { bounties: unknown[] }).bounties.length === 0) ||
    !((parsed as { bounties: unknown[] }).bounties.every(
      (entry) => typeof entry === "string",
    ))
  ) {
    throw new Error(
      `Invalid BOUNTY.json at ${path}: expected an object with a non-empty "bounties" array of strings`,
    );
  }
}

validateBountyManifest(source);

try {
  copyFileSync(source, destination);
} catch (error) {
  console.error(`Failed to copy BOUNTY.json to ${destination}:`, error);
  process.exit(1);
}

// Keep botDir referenced so the configured bot directory is honoured
// by callers that inspect the environment contract.
void botDir;
