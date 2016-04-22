var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/scrape', function(req, res){

    var url = 'http://www.sportsnet.ca/baseball/mlb/scores/';

    request(url, function(error, response, html){

      if(!error) {
        var $ = cheerio.load(html);

        var homeTeamName, homeTeamScore, homeTeamLogo, awayTeamName, awayTeamScore, awayTeamLogo;

        var $scoreBoxes = $('.score-box-container');

        $scoreBoxes.each(function(i, game){
          var gameStatus = $(game).find('.game-status').text();

          var homeTeamName = $(game).find('.team-container-1 .team-text-container').text().trim();
          var homeTeamScore = $(game).find('.team-container-1 .scores-team-score').text().trim();

          var homeTeamLogo = $(game).find('.team-container-1 .scores-team-logo img').attr('src');

          var awayTeamName = $(game).find('.team-container-2 .team-text-container').text().trim();
          var awayTeamScore = $(game).find('.team-container-2 .scores-team-score').text().trim();
          var awayTeamLogo = $(game).find('.team-container-2 .scores-team-logo img').attr('src');



          var gameModel = {
            gameStatus: gameStatus,
            home: {
              name: homeTeamName,
              score: homeTeamScore,
              logo: homeTeamLogo
            },
            away: {
              name: awayTeamName,
              score: awayTeamScore,
              logo: awayTeamLogo
            }
          }

          console.log(gameModel);
        });

      }
    })
});

app.listen('8081');

console.log('Magic happens on 8081');

exports = module.exports = app;