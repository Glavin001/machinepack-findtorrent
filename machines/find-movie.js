module.exports = {


  friendlyName: 'Find Movie',


  description: 'Find a torrent for a given movie',


  cacheable: false,


  sync: false,


  inputs: {
    query: {
      description: 'The torrent query',
      required: true,
      example: ''
    },
  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },

  fn: function(inputs, exits) {
    var Machine = require('machine');
    var queryAll = Machine.build(require('./query-all'));
    queryAll({
      query: inputs.query,
      category: 'movies'
    }).exec({
      error: function(error) {
        return exits.error(error);
      },
      success: function(torrents) {
        return exits.success(torrents);
      }
    })
  },

};