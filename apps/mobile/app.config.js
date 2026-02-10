const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });

module.exports = require("./app.json");
