var myVersion = "1.4.1", myProductName = "noderunner2";

const fs = require ("fs"); 
const utils = require ("daveutils");
const requireFromString = require ("require-from-string");
const filesystem = require ("davefilesystem"); 
var shell = require ("shelljs");

var config = { 
	secondToRunEveryMinuteScripts: 0,
	minuteToRunHourlyScripts: 0,
	hourToRunOvernightScripts: 0, 
	nameScriptsFolder: "scripts",
	localStoragePath: "data/localStorage.json"
	};

var localStorage = {
	};

function readJsonFile (path, callback) {
	filesystem.sureFilePath (path, function () {
		fs.readFile (path, function (err, data) {
			var theObject = undefined;
			if (err) {
				}
			else {
				try {
					theObject = JSON.parse (data);
					}
				catch (err) {
					console.log ("readJsonFile: err.message == " + err.message);
					}
				}
			callback (theObject);
			});
		});
	}
function writeJsonFile (path, data) {
	filesystem.sureFilePath (path, function () {
		fs.writeFile (path, utils.jsonStringify (data), function (err) {
			});
		});
	}
function runScript (f) {
	var noderunner = {
		unixShellCommand: function (theCommand) {
			return (shell.exec (theCommand, {silent: true}).stdout);
			}
		};
	var leftcode = "module.exports = function (localStorage, noderunner) {", rightcode = "}";
	fs.readFile (f, function (err, moduletext) {
		var code = leftcode + moduletext.toString () + rightcode;
		requireFromString (code) (localStorage, noderunner);
		});
	}
function loopOverFolder (nameSubFolder, fileCallback, completionCallback) {
	var folder = config.nameScriptsFolder + "/" + nameSubFolder + "/";
	filesystem.sureFilePath (folder + "x", function () {
		filesystem.recursivelyVisitFiles (folder, function visit (f) {
			if (f !== undefined) {
				if (utils.endsWith (f, ".js")) {
					runScript (f);
					if (fileCallback !== undefined) {
						fileCallback (f);
						}
					}
				}
			}, completionCallback);
		});
	}
function everySecond () {
	loopOverFolder ("everySecond", undefined, function () {
		writeJsonFile (config.localStoragePath, localStorage);
		});
	}
function everyMinute () {
	var now = new Date ();
	if (now.getMinutes () == config.minuteToRunHourlyScripts) {
		everyHour ();
		}
	loopOverFolder ("everyMinute");
	}
function everyHour () {
	var now = new Date ();
	if (now.getHours () == config.hourToRunOvernightScripts) {
		loopOverFolder ("overnight");
		}
	loopOverFolder ("everyHour");
	}
function startup () {
	console.log ("\n" + myProductName + " v" + myVersion);
	readJsonFile (config.localStoragePath, function (theData) {
		if (theData !== undefined) {
			for (var x in theData) {
				localStorage [x] = theData [x];
				}
			}
		setInterval (everySecond, 1000); 
		utils.runEveryMinute (everyMinute);
		});
	}
startup ();
