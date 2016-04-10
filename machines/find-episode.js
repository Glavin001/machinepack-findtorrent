module.exports = {


  friendlyName: 'Find Episode',


  description: 'Find a torrent for a given show episode',


  cacheable: false,


  sync: false,


  inputs: {

  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },


  fn: function(inputs, exits
    /**/
  ) {
    return exits.success();
  },



};