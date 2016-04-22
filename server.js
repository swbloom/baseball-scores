var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var utils       = require('./utils');
var games = [];
var router = express.Router();   

app.use('/', router);
 
app.scrapeData = function() {
  var url = 'http://www.sportsnet.ca/baseball/mlb/scores/';

  request(url, function(error, response, html){

    if(!error) {
      var $ = cheerio.load(html);

      var homeTeamName, homeTeamScore, homeTeamLogo, awayTeamName, awayTeamScore, awayTeamLogo;

      var $scoreBoxes = $('.score-box-container');

      $scoreBoxes.each(function(i, game){
        var gameStatus = $(game).find('.game-status').text();

        var homeTeamName = ($(game).find('.team-container-1 .scores-team-city').text().trim()) + " " + ($(game).find('.team-container-1 .scores-team-name').text().trim());
        var homeTeamScore = $(game).find('.team-container-1 .scores-team-score').text().trim();

        var homeTeamLogo = $(game).find('.team-container-1 .scores-team-logo img').attr('src');

        var awayTeamName = ($(game).find('.team-container-2 .scores-team-city').text().trim()) + " " + ($(game).find('.team-container-2 .scores-team-name').text().trim());
        var awayTeamScore = $(game).find('.team-container-2 .scores-team-score').text().trim();
        var awayTeamLogo = $(game).find('.team-container-2 .scores-team-logo img').attr('src');



        var gameModel = {
          status: gameStatus,
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

        games.push(gameModel);
      });

      fs.writeFile('scores.json', JSON.stringify(games, null, 4), function(err){

          console.log('File successfully written! - Check your project directory for the scores.json file');

      });

    }
  })
}

app.get('/scrape', function(req, res){
  app.scrapeData();
});

router.get('/', function(req, res){
  var scores = fs.readFile('scores.json', 'utf-8', (err, data) => {
    var content = JSON.parse(data);
    res.json({content});
  });
});

router.route('/scores')
  .post(function(req, res){
    fs.readFile('scores.json', 'utf-8', (err, data) => {
      var scores = JSON.parse(data);
      
      var attachments = scores.map(function(game, i){
        return {
          "title": `${game.home.name} (${game.home.score}) vs ${game.away.name} (${game.away.score}) -- ${game.status}`,
          "img_url": game.home.url,
          "color": "#F35A00"
        };
      });

      res.json({"attachments": attachments});
    })
  });

app.listen('8081');
utils.request();

console.log('Magic happens on 8081');

exports = module.exports = app;