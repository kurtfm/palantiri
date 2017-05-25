#! /usr/bin/env node
 'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

const util = require('util')

//localhost:33688/demo

server.connection({
    port: 33688
});

server.route({
    method: 'GET',
    path: '/demo/{id}',
    handler: function(request, reply) {
        reply({
            status: "success",
            data: "get: " + request.params.id
        });
    }
});
server.route({
    method: 'PUT',
    path: '/demo/',
    handler: function(request, reply) {
        reply({
            status: "success",
            data: util.inspect(request.payload, {showHidden: false, depth: null})
        });
    }
});
server.route({
    method: 'POST',
    path: '/demo/',
    handler: function(request, reply) {
        reply({
            status: "success",
            data: util.inspect(request.payload, {showHidden: false, depth: null})
        });
    }
});
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});