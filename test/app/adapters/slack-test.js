const sinon = require('sinon');
require('mocha-generators').install();
const chai = require('chai');
const expect = chai.expect; // jshint ignore:line
const should = chai.should();

const Slack = require('../../adapters/slack');

