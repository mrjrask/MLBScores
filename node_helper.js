const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_MLB_SCORES") {
            this.getMLBScores();
        }
    },

    getMLBScores: function () {
        const url = "http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard";
        axios.get(url)
            .then((response) => {
                const games = response.data.events.map((event) => {
                    return {
                        team1: {
                            name: event.competitions[0].competitors[0].team.shortDisplayName,
                            logo: event.competitions[0].competitors[0].team.logo,
                            score: event.competitions[0].competitors[0].score,
                        },
                        team2: {
                            name: event.competitions[0].competitors[1].team.shortDisplayName,
                            logo: event.competitions[0].competitors[1].team.logo,
                            score: event.competitions[0].competitors[1].score,
                        },
                        inning: event.status.period,
                        baserunners: event.competitions[0].situation.baserunners,
                        outs: event.competitions[0].situation.outs,
                    };
                });
                this.sendSocketNotification("MLB_SCORES_RESULT", games);
            })
            .catch((error) => {
                console.log("Error fetching MLB scores: " + error);
            });
    }
});
