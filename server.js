var express     = require('express');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var app         = express();
var utils       = require('./utils');
var bodyParser  = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

router.get('/', function(req, res){
  var scores = fs.readFile('scores.json', 'utf-8', (err, data) => {
    var content = JSON.parse(data);
    res.json({content});
  });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

router.route('/scores')
  .post(function(req,res) {
    var scores = fs.readFile('scores.json', 'utf-8', (err, data) => {
      var content = JSON.parse(data);
      res.json({content});
    });
  }
);

router.get('/scrape', function(req,res){
  app.bs = {}; // box scores
  app.games = [] // final array
  url = 'http://www.cbssports.com/mlb/scoreboard';

  request(url, function(error, response, html){
    if(!error)
      var $ = cheerio.load(html);

      var $boxScore = $('.mlbBoxScore').contents();

      var homeTeams = $boxScore.find('.homeTeam .teamName').toArray();
      var awayTeams = $boxScore.find('.awayTeam .teamName').toArray();
      var homeTeamsScores = $boxScore.find('.homeTeam .runsScore').toArray();
      var awayTeamsScores = $boxScore.find('.awayTeam .runsScore').toArray(); 
 
      app.bs = homeTeams.map(function(result, i) {
        return {
          homeTeam: {
                        name: result,
                        score: homeTeamsScores[i]
                    },
          awayTeam: {
                        name: awayTeams[i],
                        score: awayTeamsScores[i]
                    }
        }
      });
    
      app.bs.map(function(game, i){
        var pattern = /\(.*?\)/g;
        var awayTeamName = $(game.awayTeam.name).text().replace(pattern, "").trim().toString();
        var awayTeamScore = $(game.awayTeam.score).text().toString();
        var homeTeamName = $(game.homeTeam.name).text().replace(pattern, "").trim().toString();
        var homeTeamScore = $(game.homeTeam.score).text().toString();

        var game = {
          homeTeam: {
            name: homeTeamName,
            score: homeTeamScore
          },
          awayTeam: {
            name: awayTeamName,
            score: awayTeamScore
          }
        }
        app.games.push(game);
      });
        // console.log(`${awayTeamName} (${awayTeamScore}) vs ${homeTeamName} (${homeTeamScore})`);  
        // console.log(app.bs[0].homeTeam.name);
        console.log(app.games);
        fs.writeFile('scores.json', JSON.stringify(app.games, null, 4), function(err){

            console.log('File successfully written! - Check your project directory for the output.json file');

        })
      });
  });

var port = process.env.PORT || 8080;
// utils.request();
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
console.log(`Listening on ${port}`);

experts = module.exports = app;