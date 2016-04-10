var defaultBaseUrl = 'https://eztv.ag';

module.exports = {


  friendlyName: 'Get EZTV Show Episodes',


  description: 'Get Episodes for an EZTV Show',


  cacheable: false,


  sync: false,


  inputs: {
    baseUrl: {
      description: 'The base URL',
      required: false,
      example: defaultBaseUrl
    },
    showId: {
      description: 'The Show ID',
      required: true,
      example: 1
    }
  },


  exits: {

    success: {
      variableName: 'result',
      description: 'Done.',
    },

  },


  fn: function(inputs, exits) {
    // Default input values
    inputs.baseUrl = inputs.baseUrl || defaultBaseUrl;

    var request = require('request');
    var url = inputs.baseUrl + '/shows/'+inputs.showId+'/';

    request(url, function(error, response, html) {
        if (error) {
          return exits.error(error);
        } else {
          var cheerio = require('cheerio');
          var $ = cheerio.load(html);
          var _ = require('lodash');
          var ptn = require('parse-torrent-name');
          var $els = $('table.forum_header_noborder tr.forum_header_border');
          var torrents = [];
          $els.each(function(i,e) {
            var title = $(e).find('a.epinfo').text();
            var sizeMB = parseFloat($(e).find('td:nth-child(4)').text());
            var size = sizeMB * 1000 * 1000;
            var parsed = ptn(title);

            // Magnet Torrent URL
            var magnetURL = $(e).find('td:nth-child(3) a[href].magnet').attr('href');
            // Download URL
            var downloadURL1 = $(e).find('td:nth-child(3) a[href].download_1').attr('href');
            var downloadURL2 = $(e).find('td:nth-child(3) a[href].download_2').attr('href');
            var downloadURL3 = $(e).find('td:nth-child(3) a[href].download_3').attr('href');
            var downloadURL4 = $(e).find('td:nth-child(3) a[href].download_4').attr('href');

            var torrent = {
              title: parsed.title,
              season: parsed.season,
              episode: parsed.episode,
              repack: !!parsed.repack,
              category: 'tv',
              size: size,
              verified: true,
              url: downloadURL1 || downloadURL2 || downloadURL3 || downloadURL4 || magnetURL,
              magnet: magnetURL,
              provider: 'EZTV',
            };
            torrents.push(torrent);
          });
          return exits.success(torrents);
        }
    });

  },



};