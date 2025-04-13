const fs = require("fs");

const env = process.env;
const path = require("path");

console.log("🔍 Environment keys loaded:");
console.log("charactersKey:", env.CHARACTERS_KEY ? "✅" : "❌ Missing");
console.log("draftsKey:", env.DRAFTS_KEY ? "✅" : "❌ Missing");
console.log("images:", env.IMAGES ? "✅" : "❌ Missing");
console.log("openAiApi:", env.OPENAI_API_KEY ? "✅" : "❌ Missing");

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

const targetPath = path.join(envDir, "environment.prod.ts");

const envFileContent = `
export const environment = {
  production: true,
  charactersKey: '${env.CHARACTERS_KEY}',
  draftsKey: '${env.DRAFTS_KEY}',
  images: '${env.IMAGES}',
  openAiApiKey: '${env.OPENAI_API_KEY}'
};
`;

fs.writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error("❌ Could not write environment file:", err);
    process.exit(1);
  } else {
    console.log("✅ Environment file generated successfully");
  }
});
