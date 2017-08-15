# Palantir
This utility is designed monitor your application (currently just APIs) as if it was a customer.

In order to monitor APIs it loads Postman's Newman test runner as a nodejs library. 

It can push the results to a Datadog agent as well as save them in AWS S3.

## Demo
For all the demos using the target `monitor-app-demo` you will need to start a local server (hapijs) which has some generic endpoints.

```
bin/start-demo-server.js &
```

## Tests setup
You will need to write, name, and setup the postman tests in a way that the app can use them.

### requirements
This monitoring-app requires that you have tests in the postman v3 format.

### custom metrics and tags for datadog
The postman description can be used to pass a custom 'metric_name' or 'tags' in a YAML format which will get sent to datadog.

e.g. in the description of a createUser API you might have the following tags

```
tags: [create_user,social_user,user_flows]
```

This gives you the ability to tag flows together across multiple tests.  I did try to utilize the description of folders to apply to all tests within it but at this point that is not working.

### newman file naming conventions
When the API monitor is started a 'target' value is passed in.  The tests, environment and global files are looked up based on the application defaults
config/app.yaml
particularly related to the newman files...
```
newman_folder: /app/resources/newman/
...
test_file: tests.json
env_file: env.json
global_file: globals.json
```
with the default config the API monitor will look for target tests like this:
 <app root>/app/resources/newman/<target>-tests.json


## running

### dependencies
Run: node, npm, newman v3, datadog, aws sdk (unless you disable aws), gulp

### run locally

```
bin/start-api-monitor.js --target=monitor-app-demo
```


|argument|example|description|values|default|
| -------- | -------- | -------- | -------- | -------- |
| -t, --target (required)| example: 'bin/start-api-monitor.js --target=monitor-app-demo' | the app or service you want to test, note: there is a list of acceptable targets in the app config and each environment config may override |  |  |
| -e, --environment | 'bin/start-api-monitor.js --environment=test'| the environment to use | dev', 'test', 'prod' | dev |
| --disables3 | 'bin/start-api-monitor.js --disables3| disable pushing of run details to s3 |  | false |
| --disablemetrics' | 'bin/start-api-monitor.js --disablemetrics' | disable sending metrics to datadog |  | false |
| --metricsprefix' | 'bin/start-api-monitor.js --metricsprefix=beta' | override the metrics prefix to datadog metrics for testing |  |  |
| --metricsagent' | 'bin/start-api-monitor.js --metricsagent=127.0.0.1' | override metrics agent default of localhost |  |  |
| --disablenotification | 'bin/start-api-monitor.js --disablenotification' | disable notification to datadog when there is a failure' |  | false |


 ## scheduling / cron setup
 You can run each monitor individually (getting AWS access to your docker container may be different)

 ```
 * * * * * docker run --rm=true --network="host" -v ~/.aws:/root/.aws palantir:latest --target=monitor-app-demo --environment=dev --metricsagent=dockerhost >/dev/null
 ```

You can also use the scheduler config combined with the `bin/start-api-scheduled-monitor.js`

```
bin/start-api-scheduled-monitor.js --target=monitor-app-demo
```

This will use the default schedule from the config or a specific one can be set for target.


## local dev setup
Clone this repo and cd into it.
Install dependencies... you will need to have node and npm installed first

```
npm install -g gulp
npm install
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
npm prune
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

 ## dockerization

 Building a Palantir docker image...
 ```
 docker build -t palantir -f Dockerfile.api
 ```
 note: original design plan was to add in UI monitoring capability as well via headlesss browser which is why a specfic docker file name is used

 Running docker container... (getting AWS access to your docker container may be different)
 ```
 docker run --rm=true --network="host" -v ~/.aws:/root/.aws palantir:latest --target=monitor-app-demo --environment=dev --metricsagent=dockerhost
 ```
 more details in the docker/readme