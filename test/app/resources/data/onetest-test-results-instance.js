module.exports = {
  cursor: {
    position: 0,
    iteration: 0,
    length: 1,
    cycles: 1,
    empty: false,
    eof: false,
    bof: true,
    cr: false,
    ref: "995fb0f2-bdeb-4103-b3b2-31b6221db1a7"
  },
  executions: [{
    event: {
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "tests[\"Status code is 200\"] = responseCode.code === 200;"
        ]
      }
    },
    script: {
      type: "text/javascript",
      exec: ["tests[\"Status code is 200\"] = responseCode.code === 200;"]
    },
    result: {
      masked: {
        scriptType: "test",
        cursor: {
          position: 0,
          iteration: 0,
          length: 1,
          cycles: 1,
          empty: false,
          eof: false,
          bof: true,
          cr: false,
          ref: "995fb0f2-bdeb-4103-b3b2-31b6221db1a7"
        }
      },
      globals: {
        data: {},
        iteration: 0,
        request: {
          uri: {
            href: "http://localhost:33688/one"
          },
          method: "POST",
          headers: {
            "User-Agent": "PostmanRuntime/3.0.2",
            Accept: "*/*",
            Host: "localhost:33688",
            "accept-encoding": "gzip, deflate",
            "content-length": 0
          },
          data: {},
          url: "http://localhost:33688/one",
          id: "b118b6cf-b92e-4723-9f60-059a66274b83",
          name: "one test",
          description: "tags: [one_test,tester]"
        },
        responseCookies: [],
        responseBody: "",
        responseCode: {
          code: 200,
          name: "OK",
          detail: "Standard response for successful HTTP requests. The actual response will depend on the request method used. In a GET request, the response will contain an entity corresponding to the requested resource. In a POST request the response will contain an entity describing or containing the result of the action.",
          fromServer: true
        },
        responseHeaders: {
          "cache-control": "no-cache",
          "content-length": "0",
          vary: "accept-encoding",
          Date: "Fri, 18 Nov 2016 21:41:31 GMT",
          Connection: "keep-alive"
        },
        responseTime: 25,
        tests: {
          "Status code is 200": true
        },
        globals: {},
        environment: {}
      },
      start: 1479505291297
    }
  }],
  item: {
    id: "b118b6cf-b92e-4723-9f60-059a66274b83",
    name: "one test",
    request: {
      url: "http://localhost:33688/one",
      method: "POST",
      body: {
        mode: "formdata",
        formdata: []
      },
      description: {
        content: "tags: [one_test,tester]",
        type: "text/plain"
      }
    },
    response: [],
    event: [{
      listen: "test",
      script: {
        type: "text/javascript",
        exec: [
          "tests[\"Status code is 200\"] = responseCode.code === 200;"
        ]
      }
    }]
  }
};
