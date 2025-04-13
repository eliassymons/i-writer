const fs = require("fs");
const dotenv = require("dotenv");

const charactersKey = process.env.CHARACTERS_KEY;
const draftsKey = process.env.DRAFTS_KEY;
const imageKey = process.env.OPENAI_IMAGE_KEY;

if (!charactersKey || !draftsKey || !imageKey) {
  console.error("❌ Missing one or more required environment variables.");
  process.exit(1);
}

const env = result.parsed;

const targetPath = "./src/environments/environment.prod.ts";

const envFileContent = `
export const environment = {
  production: true,
  charactersKey: '${env["CHARACTERS_KEY"]}',
  draftsKey: '${env["DRAFTS_KEY"]}',
  images: '${env["OPENAI_IMAGE_KEY"]}',
  openAiApiKey: '${env["OPENAI_API_KEY"]}'
};
`;
console.log("🔍 Environment variables loaded:");
console.log("CHARACTERS_KEY:", env.CHARACTERS_KEY ? "✅" : "❌ Missing");
console.log("DRAFTS_KEY:", env.DRAFTS_KEY ? "✅" : "❌ Missing");
console.log("OPENAI_IMAGE_KEY:", env.OPENAI_IMAGE_KEY ? "✅" : "❌ Missing");
fs.writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error("❌ Could not write environment file:", err);
  } else {
    console.log("✅ Environment file generated successfully");
  }
});
