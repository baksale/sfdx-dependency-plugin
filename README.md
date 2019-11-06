sfdx-dependency-plugin
======================

To work with DX Package Dependcies

[![Version](https://img.shields.io/npm/v/sfdx-dependency-plugin.svg)](https://npmjs.org/package/sfdx-dependency-plugin)
[![CircleCI](https://circleci.com/gh/baksale/sfdx-dependency-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/baksale/sfdx-dependency-plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/baksale/sfdx-dependency-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-dependency-plugin/branch/master)
[![Codecov](https://codecov.io/gh/baksale/sfdx-dependency-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/baksale/sfdx-dependency-plugin)
[![Greenkeeper](https://badges.greenkeeper.io/baksale/sfdx-dependency-plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/baksale/sfdx-dependency-plugin/badge.svg)](https://snyk.io/test/github/baksale/sfdx-dependency-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-dependency-plugin.svg)](https://npmjs.org/package/sfdx-dependency-plugin)
[![License](https://img.shields.io/npm/l/sfdx-dependency-plugin.svg)](https://github.com/baksale/sfdx-dependency-plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-dependency-plugin
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-dependency-plugin/1.0.0 win32-x64 node-v12.13.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx dependency:tree [-p <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-dependencytree--p-string--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx dependency:tree [-p <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

view dependency tree for a package

```
USAGE
  $ sfdx dependency:tree [-p <string>] [-v <string>] [--apiversion <string>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -p, --package=package                                                             package id to view dependencies for

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx sdlc:dependency:tree --targetdevhubusername devhub@org.com --package '04t0..'
     Main Package:0
     +- 1st Level Pacakge 1:A
     |  +- 2nd Level Package 1:C
     |  +- 2nd Level Package 2:D
     |  |  \- 3rd Level Package only:F
     |  \- 2nd Level Package last:E
     \- 1st Level Pacakge 2:B
  
  $ sfdx sdlc:dependency:tree -p '04tA..'
     1st Level Pacakge 1:A
     +- 2nd Level Package 1:C
     +- 2nd Level Package 2:D
     |  \- 3rd Level Package only:F
     \- 2nd Level Package last:E
```
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
