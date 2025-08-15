import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

function ensureEnv(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    console.error(`[Cloudinary] Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: npm run upload:img -- <path-to-image> [--folder=<folder>]');
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: ensureEnv('CLOUDINARY_CLOUD_NAME'),
    api_key: ensureEnv('CLOUDINARY_API_KEY'),
    api_secret: ensureEnv('CLOUDINARY_API_SECRET'),
  });

  const folderFlag = process.argv.find((arg) => arg.startsWith('--folder='));
  const folder = folderFlag ? folderFlag.split('=')[1] : (process.env.CLOUDINARY_UPLOAD_FOLDER || 'blog');

  const absolutePath = path.resolve(filePath);
  console.log(`[Cloudinary] Uploading: ${absolutePath}`);
  console.log(`[Cloudinary] Folder: ${folder}`);

  try {
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    });

    console.log('\nUploaded successfully!');
    console.log(result);
    console.log(`\nDirect URL: ${result.secure_url}`);
    console.log('\nMarkdown:');
    console.log(`![${path.basename(filePath)}](${result.secure_url})`);
  } catch (error) {
    console.error('\nUpload failed:', error.message || error);
    process.exit(1);
  }
}

await main();
