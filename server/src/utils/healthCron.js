const cron = require("node-cron");
const http = require("http");
const https = require("https");

const pingHealth = (url) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { timeout: 15000 }, (res) => {
        console.log(`[health-cron] ${url} -> ${res.statusCode}`);
        res.resume();
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", (err) => console.error(`[health-cron] ${url} failed: ${err.message}`));
};

// Hits the (unauthenticated) health check API every 10 minutes.
const startHealthCron = (port) => {
    const url = process.env.HEALTH_CHECK_URL || `http://localhost:${port}/api/health`;
    cron.schedule("*/10 * * * *", () => pingHealth(url));
    console.log(`[health-cron] scheduled every 10 minutes -> ${url}`);
};

module.exports = { startHealthCron };
