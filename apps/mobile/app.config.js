const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });

const config = require("./app.json");
config.expo.extra = {
  ...config.expo.extra,
  eas: {
    projectId: "99711075-e694-4f36-bcc5-137ec1fc91d9",
  },
};
module.exports = config;
