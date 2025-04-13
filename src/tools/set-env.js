const fs = require("fs");
const dotenv = require("dotenv");

const result = dotenv.config();

if (result.error || !result.parsed) {
  console.error(
    "❌ Failed to load .env file or no environment variables found."
  );
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

fs.writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error("❌ Could not write environment file:", err);
  } else {
    console.log("✅ Environment file generated successfully");
  }
});
