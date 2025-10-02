const fs = require("fs");
const path = require("path");

const env = process.env;

if (
  !env.CHARACTERS_KEY ||
  !env.DRAFTS_KEY ||
  !env.IMAGES ||
  !env.OPENAI_API_KEY
) {
  console.error("❌ Missing one or more required environment variables.");
  process.exit(1);
}

const envDir = "./src/environments";
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const sharedContent = `
export const environment = {
  production: true,
  charactersKey: '${env.CHARACTERS_KEY}',
  draftsKey: '${env.DRAFTS_KEY}',
  images: '${env.IMAGES}',
  openAiApiKey: '${env.OPENAI_API_KEY}'
};
`;

const prodPath = path.join(envDir, "environment.prod.ts");
const basePath = path.join(envDir, "environment.ts");

// Write both files
fs.writeFileSync(prodPath, sharedContent);
fs.writeFileSync(basePath, sharedContent);
