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

## build

```
bin/api-monitor.js --target=brandapi-user
```

## cron setup
Easiest way to run this ... via cron, crontab -e

```
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --evironment="prod" --target=brandapi-user >/dev/null
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --environment="prod" --target=brandapi-support >/dev/null
* * * * * /data/servers/monitor-agent/bin/api-monitor.js --environment="prod" --target=brandapi-migration >/dev/null
```