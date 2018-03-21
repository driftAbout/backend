## TOURNAMENT BACK-END






### LOAD TESTING

The load tests were conducted using Artillery from https://artillery.io/.   The load tests are contained in the __test__/loadtest folder.  Requests were made to the locally to test out code and to the Heroku backend (https://tournament-back-end.herokuapp.com/) to test the deployment.  
- Post requests were made to sign up users (user-model), receive a token and use the token to create a tournament (tournament-model) using the loadtest.json file.
- Get requests were made to view tournaments were made using the getloadtest.json.

Tests were conducted to find a level that could be sustained and an upper level that would cause failures is an effort to gauge the breaking point.

#### Localhost Testing
Post test - with a server started on a localhost port and a mongo db running, start the test on a localhost port from the command line entering *artillery run -e development __test__/loadtest/loadtest.json*.

Running a high load, but passing was achieved with the following set-up
```
"development": {
  "target": "http://localhost:3000",
  "phases": [
    {
      "duration": 2,
      "arrivalRate": 10
    },
    {
      "duration": 10,
      "arrivalRate": 400
    }
   ]
}
}
},
```
The results were:
```
All virtual users finished
Summary report @ 20:08:46(-0700) 2018-03-20
  Scenarios launched:  4020
  Scenarios completed: 4020
  Requests completed:  8040
  RPS sent: 86.27
  Request latency:
    min: 1.5
    max: 81092.6
    median: 69.2
    p95: 73574.9
    p99: 79628.3
  Scenario counts:
    Create users get token and create tournament: 4020 (100%)
  Codes:
    201: 8040
```

Increasing the arrival rate to 500 crashes the mongo database.

Get test - using *artillery run -e development __test__/loadtest/getloadtest.json*
gave the following results
```
All virtual users finished
Summary report @ 20:17:41(-0700) 2018-03-20
  Scenarios launched:  10050
  Scenarios completed: 10050
  Requests completed:  10050
  RPS sent: 638.5
  Request latency:
    min: 1.6
    max: 160.9
    median: 4.4
    p95: 43.9
    p99: 96.4
  Scenario counts:
    0: 10050 (100%)
  Codes:
    200: 10050
```


#### Production Testing
Post test - hitting a deployed backend with the command *artillery run -e production __test__/loadtest/loadtest.json* are the following settings
```
"production": {
  "target": "https://tournament-back-end.herokuapp.com",
  "phases": [
    {
      "duration": 2,
      "arrivalRate": 5
    },
    {
      "duration": 10,
      "arrivalRate": 50
    }
  ]
}
```
resulted in a few issues with accessing the data base
```
All virtual users finished
Summary report @ 19:58:26(-0700) 2018-03-20
  Scenarios launched:  510
  Scenarios completed: 510
  Requests completed:  1020
  RPS sent: 31.52
  Request latency:
    min: 67.8
    max: 20372.8
    median: 408.4
    p95: 18916.4
    p99: 20057.2
  Scenario counts:
    Create users get token and create tournament: 510 (100%)
  Codes:
    201: 878
    401: 71
    409: 71
```

Increasing the arrivalRate to 100 resulted in the following
```
All virtual users finished
Summary report @ 19:55:49(-0700) 2018-03-20
  Scenarios launched:  1010
  Scenarios completed: 999
  Requests completed:  2009
  RPS sent: 46.84
  Request latency:
    min: 69.4
    max: 30937.5
    median: 513.4
    p95: 28141.4
    p99: 30099.7
  Scenario counts:
    Create users get token and create tournament: 1010 (100%)
  Codes:
    201: 1784
    401: 107
    409: 107
    503: 11
  Errors:
    ERR_INVALID_CHAR: 11
```

Get test - using *artillery run -e production __test__/loadtest/getloadtest.json*
gave the following results
```
All virtual users finished
Summary report @ 20:18:44(-0700) 2018-03-20
  Scenarios launched:  510
  Scenarios completed: 510
  Requests completed:  510
  RPS sent: 34
  Request latency:
    min: 262.9
    max: 547.8
    median: 275.7
    p95: 291.1
    p99: 326.3
  Scenario counts:
    0: 510 (100%)
  Codes:
    401: 510
```
