import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const runtimeFiles = [
  "src/components/lab/lab-labels.ts",
  "src/components/vault/vault-labels.ts",
  "src/components/mine/mine-labels.ts",
  "src/components/landing/landing-labels.ts",
  "src/lib/experience-data.ts",
  "src/components/admin/admin-fab.tsx",
  "src/components/admin/admin-sidebar.tsx",
  "src/app/(admin)/admin/costs/page.tsx",
];

const hangulPattern = /[가-힣]/;
const failures = [];

for (const relativePath of runtimeFiles) {
  const fullPath = resolve(process.cwd(), relativePath);
  const contents = readFileSync(fullPath, "utf8");
  const lines = contents.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (hangulPattern.test(line)) {
      failures.push(`${relativePath}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (failures.length > 0) {
  console.error("Found non-English runtime copy:");
  failures.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log("Runtime copy check passed.");
