import * as fs from 'fs';
import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;

const targetPath = './src/environments/environment.prod.ts';

const envFileContent = `
export const environment = {
  production: true,
  charactersKey: '${env?.['CHARACTERS_KEY']}',
  draftsKey: '${env?.['DRAFTS_KEY']}',
  images: '${env?.['OPENAI_IMAGE_KEY']}'
};
`;

fs.writeFile(targetPath, envFileContent, (err) => {
  if (err) {
    console.error('❌ Could not write environment file:', err);
  } else {
    console.log('✅ Environment file generated successfully');
  }
});
