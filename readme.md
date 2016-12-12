# monitoring app
Loads Postman's Newman as a library to run tests against your API endpoints and
send results to datadog and debug data to an aws s3 bucket.  Written in nodejs
to be able to load newman as a library and send test results as they happen with
better process control then just running command line.

## dependencies
node, npm, gulp, newman v3, datadog, aws

## local setup
Clone this repo and cd into it.
Install dependencies... you will need to have node and npm installed first

```
npm install -g gulp
npm install
```

## run locally

```
bin/start-api-monitor.js --target=brandapi-user
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

This will bump the version in the package.json using semver... so no getting weird
versions. Default if no `ver` arg is passed in is `patch`

### bundle up for distribution

```
gulp dist
```

This will run the tests and bundle the core app and dependencies for distribution.


## getting ready to bundle for a release
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
gulp test-xunit
```

This will run unit tests outputting xunit.xml in the main app directory which
can be used for passing/failing a build during pipelining.

```
gulp pre-release ver=prerelease
```

Use git to commit these changes and push them to the remote branch, then bundle it...

```
gulp dist
```

Use this to test and build app into 'dist' directory in preparation for deployment.

## cron setup
You can run each monitor individually

```
* * * * * docker run --rm=true --network="host" -v ~/.aws:/root/.aws monitoring-app:latest --target=myapi --environment=dev --metricsagent=dockerhost >/dev/null
```
