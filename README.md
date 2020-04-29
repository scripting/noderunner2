# noderunner2

Next generation of NodeRunner, based on knowing what I now know.

### How it works

It runs JavaScript code in a <i>scripts</i> folder contained within the noderunner2 folder.

There can be four sub-folders of the scripts folder: everySecond, everyMinute, everyHour and overnight. 

It runs the scripts in everySecond once a second, and so on. You can configure the minute it runs everyHour scripts, and the hour it runs overnight scripts in config.json. They default to 0. 

Each script has automatic access to two structs -- localStorage and noderunner. 

1. localStorage behaves like the equivalent object in browser-based JavaScript. You can save values there that are available to every other bit of code, and persist across runs of your script and noderunner2. 

2. the noderunner object contains routines that your code can call. To start there's a single callback which you refer to as noderunner.unixShellCommand. It takes one parameter, a string containing the shell command you want to execute. It returns whatever the script sends to stdout. Obvious candidates for addition are file system operations. 

### Notes

If you want to see how it works, the interesting bit of code is runScript. 

As I was putting it together I wanted the ability to run shell scripts this way, and it seems I have all the code working to do that. 

