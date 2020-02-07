
const fs = require('fs');

var enJson = fs.readFileSync(__dirname + '/en.json');
var frJson = fs.readFileSync(__dirname + '/fr.json');


module.exports = {
	en: JSON.parse(enJson),
	fr: JSON.parse(frJson),
};