var Machine = require('machine');
var findMovie = Machine.build(require('../machines/find-movie'));
var _ = require('lodash');

findMovie({
  query: 'Iron Man'
}).exec({
  error: function(error) {
    console.log('error', error);
  },
  success: function(torrents) {
    console.log('torrents', _.slice(torrents,0,5));
  }
});