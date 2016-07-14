'use strict';
//api
//b7a02fe70ddff721f6ca3a548ea991ec
//app
//bf9199ad0fe8754c333f8dd454426970e039e814

const dogapi = require("dogapi");
//const config = require('../../config/load');
//const request = require('request');

var options = {
    api_key: "e2fece0d6d8693b5135a7779dc3c80fc",
    app_key: "c3c06b3cb7cbc3bc587496b59b9b7a5a4a477967",
};

var now = parseInt(new Date().getTime() / 1000);

dogapi.initialize(options);

//https://app.datadoghq.com/api/v1/series
//[{'metric':'my.series', 'points':15}, {'metric':'my1.series', 'points':16}]
//metrics names
//target.foldername.success
//target.foldername.fail
//Palanteer.brandapis.foldername.success

//UserMigrationAPIs.ApplicationAccess
//tag name
//[target:brandapis,environment:prod]


//dogapi.metric.send("Test.SendSuccess",[now,2],(err,result)=>{
//    console.log("err: ",err," result: ",result);
//});

var metrics = [
    {
        metric: ".SendSuccess",
        points: [[now, 0]],
        tags: ["target:tester","env:prod"]
    },
    {
        metric: "Test.SendFailure",
        points: [now, 8],
        tags: ["target:tester","env:prod"]
    }
];

dogapi.metric.send_all(metrics, (err,result)=>{
    console.log("err: ",err," result: ",result);
});

var properties = {
    tags: ["env:prod","target:tester"],
    alert_type: "error"
};
dogapi.event.create("tester error", "Encountered errors during Application Access details: s3 link?", properties, function(err, res){
    console.dir(res);
});