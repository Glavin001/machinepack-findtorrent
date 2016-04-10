var defaultCategory = 'all';

module.exports = {


  friendlyName: 'Query all',


  description: 'Query for torrents from all torrent providers',


  cacheable: false,


  sync: false,


  inputs: {
    query: {
      description: 'The torrent query',
      required: true,
      example: ''
    }
  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
      returns: []
    },

  },


  fn: function(inputs, exits) {
    // Default input values
    inputs.category = inputs.category || defaultCategory;
    inputs.query = inputs.query || '';

    var Machine = require('machine');
    var queryEZTV = Machine.build(require('./query-eztv'));
    var queryKickass = Machine.build(require('./query-kickass'));
    var queryYTS = Machine.build(require('./query-yts'));
    var async = require('async');
    var _ = require('lodash');

    function query(fn) {
      return function(callback) {
        fn({
          query: inputs.query,
          category: inputs.category
        }).exec({
          error: function(error) {
            // return callback(error, []);
            return callback(null, []);
          },
          success: function(torrents) {
            return callback(null, torrents || []);
          }
        });
      };
    }
    var providers = [];
    providers.push(query(queryKickass));
    if (inputs.category === 'all' || inputs.category === 'tv') {
      providers.push(query(queryEZTV));
    }
    if (inputs.category === 'all' || inputs.category === 'movies') {
      providers.push(query(queryYTS));
    }
    async.parallel(providers, function(error, results) {
      if (error) {
        return exits.error(error);
      }
      var torrents = _.flatten(results);
      torrents = _.reverse(_.sortBy(torrents, ['verified', 'seeders', 'peers']));
      return exits.success(torrents);
    })
  },



};