'use strict';

const superagent = require('superagent');
const mock = require('../lib/mocks');
const server = require('../../lib/server');
const debug = require('debug')('http:kevin-game-route-test');

//const thisYear = new Date().getFullYear();

debug('kevin-game-route-scorecard-test');
const __API_URL__ = `${process.env.API_URL}/api/v1`;

debug('__API_URL__', __API_URL__);

describe('Game route scorecard test', function(){
  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeAll(() => mock.removeUsers());
  beforeAll(() => mock.removeTournaments());
  beforeAll(() => mock.removeDivisions());

  //create user
  beforeAll(() => {
    return mock.user.create()
      .then(userData => {
        debug('userData', userData);
        return this.userData = userData;
      })
      .catch(err => console.error(err));
  });

  //create tournament data
  beforeAll(() => {
    this.divisionsData = mock.new_division(`U11`, 'boys');
    this.tournamentData = mock.new_tournament();
  });

  describe('Valid input', () => {

    beforeAll(() => {
      debug('userData token', this.userData.token);
      debug('this.TournamentData', this.tournamentData);
      return superagent.post(`${__API_URL__}/tournament/create`)
        .set('Authorization', `Bearer ${this.userData.token}`)
        .send(this.tournamentData)
        .then(res => {
          this.tournamentPost = res.body;
          this.tournamentId = res.body._id;
          debug('Tournament post', res.body);
        })
        .catch(err => console.error('tournament', err));
    });

    beforeAll(() => {
      
      mock.division.create(this.tournamentId, this.divisionsData)
        .then(division => {
          this.division = division;
          debug('division', division);
        })
        .catch(console.error);
    });

    beforeAll(() => {
      
      //create data for 16 teams
      let teams = [...Array(16)].map(() => mock.new_team(2007, 'boys'));

      return Promise.all(teams.map(team => 
        mock.team.create(team)
      ))
        .then(teams => {
          debug('teams', teams);
          this.teams = teams;
          let team_bulkUpdate = teams.reduce((acc, cur) => {
            acc.push(
              { 
                updateOne: {
                  filter: {_id: cur._id},
                  update: {tournaments: [...cur.tournaments, this.tournamentId]},
                },
              });
            return acc;
          },[]);
          debug('bulkUpdate', team_bulkUpdate[0].updateOne.update.tournaments);
          return mock.team.bulk_write(team_bulkUpdate);
        })
        .catch(console.error);
    });

  
    //add games
    beforeAll(() => {
      return mock.division.populate(this.teams, this.division._id)
        .then(games => {
          this.games = games;
          debug('games', games);
        });
    });

    //add teamPoints schema for each team
    beforeAll(() => {
      return mock.teamPoints.createAll({[this.division._id]: this.teams})
        .then(teamPoints => {
          debug('team points', teamPoints);
        });
    });

    beforeAll(() => {
      let gamesArray = ['groupA', 'groupB', 'groupC', 'groupD', 'consolidation', 'semiFinal', 'final'].reduce((gamesList, round) => gamesList.concat(this.games[round]),[]);
      return mock.game.scorecard(gamesArray);
    });

    beforeAll(() => {
      return Promise.all(
        [6, 12, 18, 24].map(gameNumber  => mock.game.advanceTeams({division: this.division._id, gamenumber: gameNumber}))
      );
    });


    it('should create a new tournament', () => {
      expect(this.TournamentData).not.toBeNull();
    });

  });
});