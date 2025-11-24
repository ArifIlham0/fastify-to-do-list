require('dotenv').config();
const knex = require('knex');
const knexConfig = require("../knexfile");
const environment = process.env.NODE_ENV;
const db = knex(knexConfig[environment]);

module.exports = db;