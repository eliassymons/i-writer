const fs = require("fs");
const dotenv = require("dotenv");

const env = dotenv.config().parsed;

if (!env) {
  console.error(
    "❌ Failed to load .env file or no environment variables found."
  );
  process.exit(1);
}

// ✅ Log the keys
console.log("🔍 Environment keys loaded:");
console.log("charactersKey:", env["CHARACTERS_KEY"] ? "✅" : "❌ Missing");
console.log("draftsKey:", env["DRAFTS_KEY"] ? "✅" : "❌ Missing");
console.log("images:", env["OPENAI_IMAGE_KEY"] ? "✅" : "❌ Missing");
console.log("openAiApi:", env["OPENAI_API_KEY"] ? "✅" : "❌ Missing");

// ✅ Abort if anything is missing
if (
  !env["CHARACTERS_KEY"] ||
  !env["DRAFTS_KEY"] ||
  !env["OPENAI_IMAGE_KEY"] ||
  !env["OPENAI_API_KEY"]
) {
  console.error("❌ Missing one or more required environment variables.");
  process.exit(1);
}

const targetPath = "./src/environments/environment.prod.ts";

const envFileContent = `
export const environment = {
  production: true,
  charactersKey: '${env["CHARACTERS_KEY"]}',
  draftsKey: '${env["DRAFTS_KEY"]}',
  images: '${env["OPENAI_IMAGE_KEY"]}',
  openAiApi: '${env["OPENAI_API_KEY"]}'
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
