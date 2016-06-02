'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
var config = require('../config/load');

//localhost:33688/one

server.connection({ port: 33688 });

server.route({
    method: 'POST',
    path: '/one',
    handler: function (request, reply) {
        reply('');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});