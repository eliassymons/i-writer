const fs = require("fs");

const env = process.env;

console.log("🔍 Environment keys loaded:");
console.log("charactersKey:", env.CHARACTERS_KEY ? "✅" : "❌ Missing");
console.log("draftsKey:", env.DRAFTS_KEY ? "✅" : "❌ Missing");
console.log("images:", env.OPENAI_IMAGE_KEY ? "✅" : "❌ Missing");
console.log("openAiApi:", env.OPENAI_API_KEY ? "✅" : "❌ Missing");

if (
  !env.CHARACTERS_KEY ||
  !env.DRAFTS_KEY ||
  !env.OPENAI_IMAGE_KEY ||
  !env.OPENAI_API_KEY
) {
  console.error("❌ Missing one or more required environment variables.");
  process.exit(1);
}

const targetPath = "./src/environments/environment.prod.ts";

const envFileContent = `
export const environment = {
  production: true,
  charactersKey: '${env.CHARACTERS_KEY}',
  draftsKey: '${env.DRAFTS_KEY}',
  images: '${env.OPENAI_IMAGE_KEY}',
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
