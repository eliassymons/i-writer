const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env or .env.production
const result = dotenv.config();

if (result.error) {
  console.error('❌ Failed to load .env file');
  process.exit(1);
}

const env = result.parsed;

const targetPath = './src/environments/environment.prod.ts';

const envFileContent = `export const environment = {
  production: true,
  charactersKey: '${env.CHARACTERS_KEY}',
  draftsKey: '${env.DRAFTS_KEY}',
  images: '${env.OPENAI_IMAGE_KEY}'
};
`;

fs.writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error('❌ Could not write environment file:', err);
    process.exit(1);
  } else {
    console.log('✅ Environment file generated successfully');
  }
});
