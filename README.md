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

<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-dependency-plugin
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-dependency-plugin/1.1.1 win32-x64 node-v12.13.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx dependency:order [-p <string>] [-j] [-r] [-h] [-b] [-n] [-l] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-dependencyorder--p-string--j--r--h--b--n--l--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx dependency:tree [-p <string>] [-j] [-r] [-h] [-b] [-n] [-i] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-dependencytree--p-string--j--r--h--b--n--i--v-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx dependency:order [-p <string>] [-j] [-r] [-h] [-b] [-n] [-l] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

view dependency tree for a package

```
USAGE
  $ sfdx dependency:order [-p <string>] [-j] [-r] [-h] [-b] [-n] [-l] [-v <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --build                                                                       displays package build number
  -h, --patch                                                                       displays package patch version
  -j, --major                                                                       displays package major version
  -l, --level                                                                       displays level
  -n, --name                                                                        displays package name
  -p, --package=package                                                             package id to view dependencies for
  -r, --minor                                                                       displays package minor version

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx dependency:order --package '04t0..'
    04t01..
    04t02..
    04t03..
    04t04..
```

_See code: [lib\commands\dependency\order.js](https://github.com/baksale/sfdx-dependency-plugin/blob/v1.1.1/lib\commands\dependency\order.js)_

## `sfdx dependency:tree [-p <string>] [-j] [-r] [-h] [-b] [-n] [-i] [-v <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

view dependency tree for a package

```
USAGE
  $ sfdx dependency:tree [-p <string>] [-j] [-r] [-h] [-b] [-n] [-i] [-v <string>] [--apiversion <string>] [--json] 
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -b, --build                                                                       displays package build number
  -h, --patch                                                                       displays package patch version
  -i, --version                                                                     displays package id
  -j, --major                                                                       displays package major version
  -n, --name                                                                        displays package name
  -p, --package=package                                                             package id to view dependencies for
  -r, --minor                                                                       displays package minor version

  -v, --targetdevhubusername=targetdevhubusername                                   username or alias for the dev hub
                                                                                    org; overrides default dev hub org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx dependency:tree --targetdevhubusername devhub@org.com --package '04t0..'
     Main Package:0
     +- 1st Level Pacakge 1:A
     |  +- 2nd Level Package 1:C
     |  +- 2nd Level Package 2:D
     |  |  \- 3rd Level Package only:F
     |  \- 2nd Level Package last:E
     \- 1st Level Pacakge 2:B
  
  $ sfdx dependency:tree -p '04tA..'
     1st Level Pacakge 1:A
     +- 2nd Level Package 1:C
     +- 2nd Level Package 2:D
     |  \- 3rd Level Package only:F
     \- 2nd Level Package last:E
```

_See code: [lib\commands\dependency\tree.js](https://github.com/baksale/sfdx-dependency-plugin/blob/v1.1.1/lib\commands\dependency\tree.js)_
<!-- commandsstop -->
