var myVersion = "1.4.3", myProductName = "noderunner2";

const fs = require ("fs"); 
const utils = require ("daveutils");
const requireFromString = require ("require-from-string");
const filesystem = require ("davefilesystem"); 
const shell = require ("shelljs");

const nameEverySecondFolder = "everySecond";
const nameEveryMinuteFolder = "everyMinute";
const nameEveryHourFolder = "everyHour";
const nameOvernightFolder = "overnight";

var config = { 
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
	var noderunner = { //functions called-scripts can use to access functionality within noderunner
		utils, //scripts have access to all of utils
		unixShellCommand: function (theCommand) {
			return (shell.exec (theCommand, {silent: true}).stdout);
			}
		};
	var leftcode = "module.exports = function (localStorage, noderunner) {", rightcode = "}";
	fs.readFile (f, function (err, moduletext) {
		if (err) {
			console.log ("runScript: err.message == " + err.message);
			}
		else {
			var code = leftcode + moduletext.toString () + rightcode;
			requireFromString (code) (localStorage, noderunner);
			}
		});
	}
function loopOverFolder (nameSubFolder, fileCallback) {
	var folder = config.nameScriptsFolder + "/" + nameSubFolder + "/";
	filesystem.sureFilePath (folder + "x", function () {
		fs.readdir (folder, function (err, theListOfFiles) {
			theListOfFiles.forEach (function (f) {
				if (utils.endsWith (f, ".js")) {
					runScript (folder + f);
					if (fileCallback !== undefined) {
						fileCallback (f);
						}
					}
				});
			});
		});
	}
function everySecond () {
	loopOverFolder (nameEverySecondFolder);
	writeJsonFile (config.localStoragePath, localStorage);
	}
function everyMinute () {
	var now = new Date ();
	if (now.getMinutes () == config.minuteToRunHourlyScripts) {
		everyHour ();
		}
	loopOverFolder (nameEveryMinuteFolder);
	}
function everyHour () {
	var now = new Date ();
	if (now.getHours () == config.hourToRunOvernightScripts) {
		loopOverFolder (nameOvernightFolder);
		}
	loopOverFolder (nameEveryHourFolder);
	}
function initFolders () {
	filesystem.sureFilePath (nameEverySecondFolder + "x");
	filesystem.sureFilePath (nameEveryMinuteFolder + "x");
	filesystem.sureFilePath (nameEveryHourFolder + "x");
	filesystem.sureFilePath (nameOvernightFolder + "x");
	}
function startup () {
	console.log ("\n" + myProductName + " v" + myVersion);
	readJsonFile (config.localStoragePath, function (theData) {
		if (theData !== undefined) {
			for (var x in theData) {
				localStorage [x] = theData [x];
				}
			}
		initFolders ();
		setInterval (everySecond, 1000); 
		utils.runEveryMinute (everyMinute);
		});
	}
startup ();
