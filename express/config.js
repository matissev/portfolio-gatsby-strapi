// config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	hostName: process.env.HOST,
	mediashostName: process.env.MEDIASHOST,
	mailUser: process.env.MAIL_USER,
	mailClientId: process.env.MAIL_CLIENT_ID,
	mailClientSecret: process.env.MAIL_CLIENT_SECRET,
	mailRefreshToken: process.env.MAIL_REFRESH_TOKEN,
	websiteName: process.env.WEBSITE_NAME
};