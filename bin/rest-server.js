'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const fs = require('fs');
const JSON5 = require('json5');
var config = require('../config/load');

server.connection({ port: process.env.SERVER_PORT ? process.env.SERVER_PORT : config.rest_server_port});

//move these into source? separate out handlers
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('');
    }
});

server.route({
    method: 'GET',
    path: '/healthcheck/{target}',
    handler: function (request, reply) {
    	var results = JSON5.parse(fs.readFileSync(config.application_root + config.output_folder + 'healthcheck/' + request.params.target + '.json'));
        reply(results);
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});