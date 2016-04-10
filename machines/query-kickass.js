var defaultAPIURL = 'https://kickass.to';
var defaultSortByKey = 'seeders';
var defaultSortOrder = 'desc';
var defaultPage = 1;
var defaultCategory = 'all';

module.exports = {


  friendlyName: 'Query Kickass',


  description: 'Query Kickass Torrents.',


  cacheable: false,


  sync: false,


  inputs: {
    apiUrl: {
      description: 'The URL of the API',
      required: false,
      example: defaultAPIURL
    },
    sortByKey: {
      description: 'The key to sort the torrents by.',
      required: false,
      example: defaultSortByKey,
    },
    sortOrder: {
      description: 'The sort order for the given sort key.',
      required: false,
      example: defaultSortOrder
    },
    query: {
      description: 'The torrent query',
      required: true,
      example: ''
    },
    page: {
      description: 'The page number',
      required: false,
      example: defaultPage
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
      example: [],
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
    var _ = require('lodash');

    // Default input values
    inputs.apiUrl = inputs.apiUrl || defaultAPIURL;
    inputs.sortByKey = inputs.sortByKey || defaultSortByKey;
    inputs.sortOrder = inputs.sortOrder || defaultSortOrder;
    inputs.page = inputs.page || defaultPage;
    inputs.category = inputs.category || defaultCategory;
    inputs.query = inputs.query || '';

    var query = inputs.query + 'category:'+inputs.category;

    // Send request to Kickass Torrents
    var Http = require('machinepack-http');
    Http.sendHttpRequest({
      baseUrl: inputs.apiUrl,
      url: '/json.php',
      method: 'get',
      params: {
        q: query,
        field: inputs.sortByKey,
        sorter: inputs.sortOrder,
      }
    }).exec({
      // OK.
      success: function(result) {
        try {
          var responseBody = JSON.parse(result.body);
        } catch (e) {
          return exits.error('An error occurred while parsing the body.');
        }
        var torrents = responseBody.list;
        var count = torrents.length;
        torrents = _.map(torrents, function(torrent) {
          return {
            title: torrent.title,
            category: torrent.category.toLowerCase(),
            url: torrent.torrentLink,
            verified: !!torrent.verified,
            votes: torrent.votes,
            seeders: torrent.seeds,
            leechers: torrent.leechs,
            peers: torrent.peers,
            hash: torrent.hash,
            size: torrent.size,
            dateCreated: new Date(torrent.pubDate),
            provider: 'Kickass',
            meta: torrent,
          };
        });
        // var response = {
        //   page: {
        //     number: inputs.page,
        //     size: count,
        //     total: parseInt(responseBody.total_results),
        //   },
        //   torrents: torrents,
        // };
        // return exits.success(response);
        return exits.success(torrents);
      },
      // An unexpected error occurred.
      error: function(err) {
        return exits.error(err);
      },
    });

  },



};