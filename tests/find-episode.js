var Machine = require('machine');
var _ = require('lodash');
var findEpisode = Machine.build(require('../machines/find-episode'));

findEpisode({
  query: 'Marvels Agents of SHIELD S02'
}).exec({
  error: function(error) {
    console.log('error', error);
  },
  success: function(torrents) {
    console.log('torrents', _.slice(torrents,0,5));
  }
});