# monitoring agent
Written in node mainly to take advantage of loading newman as a library to get a callback when it's finished with a test run.

## dependencies
Install NodeJs / npm

## local setup
Clone this repo and cd into it.
Install dependencies... you will need to have node and npm installed first

```
npm install -g gulp
npm install
```

## run locally

```
bin/api-monitor.js --target=brandapi-user
```

## local task runner

### run tests

```
gulp test
```

This will run all the tests in test directory.

### setup new version

```
gulp prepare-release [ver=major|minor|patch|prerelease]

```

This will bump the version in the package.json using semver... so no getting weird versions. Default if no `ver` arg is passed in is `patch`

### bundle up for distribution

```
gulp dist
```

This will run the tests and bundle the core app and dependencies for distribution.


## getting ready to bunlde for a release
When you feel you have something ready to roll (tests look good).  Run this:

```
npm shrinkwrap
```

Then delete the `node_modules` directory, then run

```
npm install
```
This will pick up your shrinkwrapped versions.

```
gulp test
```

If the tests look good then run with whatever version that is appropriate.

```
gulp pre-release ver=prerelease
```

Use git to commit these changes and push them to the remote branch, then bundle it...

```
gulp dist
```

Later I will figure out how to bundle that all into one task.

## cron setup
You can run each monitor individually

```
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --evironment=prod --target=brandapi-user >/dev/null
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --environment=prod --target=brandapi-support >/dev/null
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --environment=prod --target=brandapi-migration >/dev/null
```

## start all supported monitors
You can start all the supported monitors using the start-all script...

```
bin/start-all-monitors.js
``

This will use the configuration from the YAML config supported_api_monitors and supported_ui_monitors.  It will look for the schedule for that monitor specifically in monitor_schedule or if not there use the 'default'.  The schedule is cron format.

