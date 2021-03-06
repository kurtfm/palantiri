
# palantiri (API Monitoring Utility)

This utility is designed monitor your application (currently just APIs) as if it was a customer.

In order to monitor APIs it loads Postman's Newman test runner as a nodejs library. 

It can push the results to a Datadog agent as well as save them in AWS S3.

## Table of Contents

- [Dependencies](#dependencies)
- [Demo](#demo)
- [Tests](#tests)
- [Usage](#usage)
- [Configuration](#configuration)
- [Scheduling](#scheduling)
- [Deploying](#deploying)
- [License](#license)

## Dependencies

### Node
Requires node v6 and gulp to be installed globally for certain tasks.

### External
The current design only has two adapters for exporting the results from Newman AWS and Datadog. In the future additional adapters may be added to support other models.

Note: local file system was not used as it was designed to be deployed in the cloud.


## Demo

### Install

```
npm install
npm install -g gulp
```

### Run Demo
For all the demos using the target `monitor-app-demo` you will need to start a local server (hapijs) which has some generic endpoints.

```
bin/start-demo-server.js &
```

Then run

```
bin/start-api-monitor.js --target=monitor-app-demo
```

## Tests
The key to this tool is that you can monitor your API endpionts with postman tests. You will need to write, name, and setup the postman tests in a way that the app can use them.


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
with the default config palantiri will look for target tests like this:

`<app root>/app/resources/newman/<target>-tests.json`

## Usage
Once you have enabled your API tests you can run the monitor locally or via Docker.

### Locally
This can be run much like the example in the demo using.

```
bin/start-api-monitor.js --target=monitor-app-demo
```

You can also use the scheduler config combined with the `bin/start-api-scheduled-monitor.js`

```
bin/start-api-scheduled-monitor.js --target=monitor-app-demo
```
This will use the default schedule from the config or a specific one can be set for target.

### Docker run
Once you have built the Docker image you can run it for each target(getting AWS access to your docker container may be different).

 ```
 * * * * * docker run --rm=true --network="host" -v ~/.aws:/root/.aws palantiri:latest --target=monitor-app-demo --environment=dev --metricsagent=dockerhost >/dev/null
 ```

## configuration
Configuration can be set via a default app config, an environment config or a run time argument (not all config values can be set at runtime... only the ones found useful so far)

| name | default | decryption | 
| -------- | -------- | -------- |
| output_folder | /outputs/ | the folder used for any files written to disk during test runs | 
| newman_folder | /app/resources/newman/ | the source for postman/newman tests and environment files ... relative to app dir|
| api_monitor | /app/monitor/ | the location of the main app relative to app dir |
| test_data | /test/app/resources/data/ | data fixtures for unit tests |
| test_file | tests.json | file ending pattern for postman test files (combined with test target to location files) |
| env_file | env.json | file ending pattern for postman environment files (combined with test target to location files) |
| global_file | globals.json |  | file ending pattern for postman global environment files (combined with test target to location files) |
| report_file_end | -report.json | file ending pattern for newman report combined with a unique string (before loading to aws or used by some other adapter) |
| monitor_schedule| | group name to put specific target schedules in or a default ... only used by bin/start-api-scheduled-* | 
| default | "*/5 * * * *" | the default schedule for all targets unless a target is specfified |
| metrics_prefix | test. | DataDog metrics prefix which will allow you to group all the metrics together |
| metrics_agent_host | localhost | DataDog StatsD agent host location |
| metrics_agent_port | 8125 | DataDog StatsD agent port |
| metrics_default_api_name |  api.monitor | DataDog name for metric being sent |
| metrics_disabled | 0 | disable sending metrics to DataDog |
| datadog_failure_notification_disabled | 0 | disable sending a failure notice to DataDog |
| aws_s3_bucket | monitoring-debug-data | name of aws bucket for storing test reports |
| aws_s3_file_expiration_days | 30 | expiration to set on report file sent to aws |
| aws_s3_disable_push | 1 | disable pushing full report to aws |
| log_level | info | Winston log level.  Currently only info, error and debug used. Note: currently adapters do not pull in config data so they just throw exceptions or console out messages) |

### app defaults

The `config/app.yml` holds the app's default values.

### environment overrides

Examples..

 `config/dev.yml` which overrides the defaults with settings for you dev environment like setting the log level to debug.

`config/test.yml` sets values needed for the unit test runs.

### runtime overrides

Some configuration values can be set/overridden at run time

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
 * * * * * docker run --rm=true --network="host" -v ~/.aws:/root/.aws palantiri:latest --target=monitor-app-demo --environment=dev --metricsagent=dockerhost >/dev/null
 ```

You can also use the scheduler config combined with the `bin/start-api-scheduled-monitor.js`

```
bin/start-api-scheduled-monitor.js --target=monitor-app-demo
```

This will use the default schedule from the config or a specific one can be set for target.

## Deploying
palantiri utlizes gulp for local dev tasks (like unit tests) but has also been setup for CDID deployment.

### run unit tests

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


### getting ready to bundle for a release
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

 ### dockerization

 Building a palantiri docker image...
 ```
 cd docker
 docker build -t palantiri -f Dockerfile.api
 ```
 note: original design plan was to add in UI monitoring capability as well via headlesss browser which is why a specfic docker file name is used

 Running docker container... (getting AWS access to your docker container may be different)
 ```
 docker run --rm=true --network="host" -v ~/.aws:/root/.aws palantiri:latest --target=monitor-app-demo --environment=dev --metricsagent=dockerhost
 ```
 more details in the docker/readme

 ### code coverage

 Uses Instabul for code coverage with the cobertura output to suck into jenkins.

 Config is in .instanbul.yaml

 run:

```
istanbul cover gulp test
```
Report will be in coverage will here: palantiri/coverage/lcov-report/index.html

## License

[MIT LICENSE](../LICENSE)