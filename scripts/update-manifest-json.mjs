import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const manifestJson = path.resolve(
  path.resolve(__dirname, '../public/manifest.json')
);

const APP_NAME = process.argv[2];
const APP_VERSION = process.argv[3];

const updateManifest = () => {
  const manifest = JSON.parse(fs.readFileSync(manifestJson, 'utf8'));

  let today = new Date();
  const offset = today.getTimezoneOffset();
  today = new Date(today.getTime() - offset * 60 * 1000);

  manifest.name = APP_NAME;
  manifest.action.default_title = APP_NAME;
  manifest.version = APP_VERSION;
  manifest.releaseDate = today.toISOString().split('T')[0];

  fs.writeFileSync(
    manifestJson,
    JSON.stringify(manifest),
    function writeJSON(err) {
      if (err) return console.log(err);
    }
  );
};

updateManifest();
