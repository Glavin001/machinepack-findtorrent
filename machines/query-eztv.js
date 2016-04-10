var defaultBaseUrl = 'https://eztv.ag';
var defaultCategory = 'all';

module.exports = {


  friendlyName: 'Query EZTV',


  description: 'Query EZTV Torrents.',


  cacheable: false,


  sync: false,


  inputs: {
    baseUrl: {
      description: 'The base URL',
      required: false,
      example: defaultBaseUrl
    },
    query: {
      description: 'The torrent query',
      required: true,
      example: ''
    },
    category: {
      description: 'The category',
      required: false,
      example: defaultCategory
    }
  },

  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
      torrents: []
      // example: {
      //   page: {
      //     number: 1,
      //     size: 25,
      //     total: 100
      //   },
      //   torrents: []
      // }
    },

  },


  fn: function(inputs, exits) {
    // Default input values
    inputs.baseUrl = inputs.baseUrl || defaultBaseUrl;

    // Parse query
    var episodeMatcher = require('episode');
    function parseTitle(title) {
      var showName = title;
      var foundMatches = episodeMatcher(showName);
      var season = foundMatches.season;
      var episode = foundMatches.episode;
      foundMatches.matches.forEach(function (match) {
          showName = showName.replace(match, '');
      });
      showName = showName.replace(/ +/, ' ').trim();
      return {
        name: showName,
        season: season,
        episode: episode
      };
    }
    var parsed = parseTitle(inputs.query);
    var showName = parsed.name;
    var season = parsed.season;
    var episode = parsed.episode;

    // Get all shows
    var async = require('async');
    var Machine = require('machine');
    var getEZTVShowlist = Machine.build(require('./get-eztv-showlist'));
    var getEZTVShowEpisodes = Machine.build(require('./get-eztv-show-episodes'));
    getEZTVShowlist({
      baseUrl: inputs.baseUrl
    }).exec({
      error: function(error) {
        return exits.error(error);
      },
      success: function(shows) {
        var _ = require('lodash');
        // Filter shows by query
        shows = _.filter(shows, function(show) {
          // return show.title.toLowerCase() === showName.toLowerCase();
          return parseTitle(show.title).name.toLowerCase() === showName;
        });
        // Get episodes for all shows
        async.map(shows, function(show, callback) {
          getEZTVShowEpisodes({
            baseUrl: inputs.baseUrl,
            showId: show.id
          }).exec({
            error: function(error) {
              return exits.error(error);
            },
            success: function(torrents) {
              return callback(null, torrents);
            }
          });
        }, function(error, results) {
          var torrents = _.flatten(results);
          // Filter episodes by query
          torrents = _.filter(torrents, function(torrent) {
            // console.log(showName, season, episode, torrent);
            if (season && torrent.season !== season) {
              return false;
            }
            if (episode && torrent.episode !== episode) {
              return false;
            }
            return true;
          });
          // console.log(torrents);
          return exits.success(torrents);
        });
      }
    });

  },

};