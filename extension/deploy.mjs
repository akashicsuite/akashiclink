import zipFolder from 'zip-folder';
import fs from 'fs';
import path from 'path';
import https from 'https';
import chromeWebstoreUpload from 'chrome-webstore-upload';

const REFRESH_TOKEN = process.env.EXTENSION_REFRESH_TOKEN;
const EXTENSION_NAME = process.env.EXTENSION_NAME;
const EXTENSION_ID = process.env.EXTENSION_ID;
const CLIENT_SECRET = process.env.EXTENSION_CLIENT_SECRET;
const CLIENT_ID = process.env.EXTENSION_CLIENT_ID;
const SLACK_URL = process.env.SLACK_URL;
const FLAVORS = process.env.FLAVORS;

const MAJOR_VERSION = process.env.MAJOR_VERSION;
const MINOR_VERSION = process.env.MINOR_VERSION;
const PATCH_VERSION = process.env.PATCH_VERSION;
const BUILD_VERSION = process.env.BUILD_VERSION;

const webStore = chromeWebstoreUpload({
  extensionId: EXTENSION_ID,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

const versionName = `${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}.${BUILD_VERSION}`;
const buildDir = path.resolve('../build');
const outputDir = path.resolve(`./outputs/${FLAVORS}/`);
const zipName = path.resolve(`${outputDir}/${FLAVORS}-${versionName}.zip`);
const manifestJson = path.resolve('../build/manifest.json');

const zipFailMsg = `:large_red_circle: :chrome_dynosaur: [Extension] [${FLAVORS}] Failed to zip the build folder!`;
const buildingMsg = `:large_yellow_circle: :google: [Extension] [${FLAVORS}] New build deployment in progress. Attempting to deploy version ${versionName}`;
const buildSuccessMsg = `:large_green_circle: :chrome: [Extension] [${FLAVORS}] New Zip uploaded successfully!`;
const buildFailMsg = `:large_red_circle: :chrome_dynosaur: [Extension] [${FLAVORS}] Failed to upload the Zip!`;
const slackFields = [
  {
    title: 'Environment',
    value: FLAVORS,
    short: true,
  },
  {
    title: 'Version',
    value: versionName,
    short: true,
  },
  {
    title: 'Build Date',
    value: new Date().toISOString(),
    short: false,
  },
];

const slack = (msgObj) => {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
      },
    };

    // actual request
    const req = https.request(SLACK_URL, requestOptions, (res) => {
      let response = '';

      res.on('data', (d) => {
        response += d;
      });

      // response finished, resolve the promise with data
      res.on('end', () => {
        resolve(response);
      });
    });

    // there was an error, reject the promise
    req.on('error', (e) => {
      reject(e);
    });

    // send our message body (was parsed to JSON beforehand)
    req.write(JSON.stringify(msgObj));
    req.end();
  });
};

const zipExtension = async () => {
  slack({
    text: buildingMsg,
  });

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Update version in build/manifest.json
  const manifest = JSON.parse(fs.readFileSync(manifestJson, 'utf8'));

  manifest.name = EXTENSION_NAME;
  manifest.action.default_title = EXTENSION_NAME;
  manifest.version = versionName;

  fs.writeFile(manifestJson, JSON.stringify(manifest), function writeJSON(err) {
    if (err) return console.log(err);

    zipFolder(buildDir, zipName, function (err) {
      if (err) {
        slack({
          attachments: [
            {
              title: zipFailMsg,
              color: '#a40100',
              fields: [
                {
                  title: 'Error Message',
                  value: err,
                  short: false,
                },
              ],
            },
          ],
        });
      } else {
        upload();
      }
    });
  });
};

const upload = () => {
  const zipFile = fs.createReadStream(zipName);
  webStore
    .uploadExisting(zipFile)
    .then((res) => {
      slack({
        attachments: [
          {
            color: '#2fb886',
            title: buildSuccessMsg,
            fields: slackFields,
          },
        ],
      });
    })
    .catch((err) => {
      slack({
        attachments: [
          {
            title: buildFailMsg,
            color: '#a40100',
            fields: [
              {
                title: 'Error Message',
                value: err,
                short: false,
              },
            ],
          },
        ],
      });
      process.exit(1);
    });
};

zipExtension();
