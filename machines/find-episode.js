module.exports = {


  friendlyName: 'Find Episode',


  description: 'Find a torrent for a given show episode',


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
      category: 'tv'
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