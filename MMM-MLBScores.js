
Module.register("MMM-MLBScores", {
    defaults: {
        proxyUrls: [
            "http://192.168.1.207:5000/parsed_mlb_scores",
            "http://mirror.local:5000/parsed_mlb_scores",
            "http://northbrook.rask.in:5000/parsed_mlb_scores"
        ], // List of proxy URLs to try
        updateInterval: 90000,  // 90 seconds
        width: "550px",  // Limit width of the module
        refreshTime: "07:15",  // Refresh at 7:15 AM daily
    },

    start: function () {
        this.scores = [];
        this.currentProxyIndex = 0;  // Start with the first proxy URL
        this.getScores();
        this.scheduleUpdate();
    },

    getStyles: function () {
        return ["MMM-MLBScores.css"];
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        wrapper.style.width = this.config.width;

        if (this.scores.length === 0) {
            wrapper.innerHTML = "Loading scores...";
            return wrapper;
        }

        this.scores.forEach((game) => {
            var gameWrapper = document.createElement("div");
            gameWrapper.className = "game";

            // Team logos and scores
            var teamLogoWrapper = document.createElement("div");
            teamLogoWrapper.className = "team-logo";
            teamLogoWrapper.innerHTML = `
                <img src="\${game.team1.logo}" alt="\${game.team1.name}" />
                <span class="team-name">\${game.team1.name}</span>
                <span class="score">\${game.team1.score}</span>
                <img src="\${game.team2.logo}" alt="\${game.team2.name}" />
                <span class="team-name">\${game.team2.name}</span>
                <span class="score">\${game.team2.score}</span>
            `;

            // Inning, Baserunners, Outs
            var inningWrapper = document.createElement("div");
            inningWrapper.className = "inning-info";
            inningWrapper.innerHTML = `
                <span class="inning">\${game.inning}</span>
                <span class="baserunners">\${this.getBaseRunnerHTML(game.baserunners)}</span>
                <span class="outs">\${game.outs} Outs</span>
            `;

            gameWrapper.appendChild(teamLogoWrapper);
            gameWrapper.appendChild(inningWrapper);
            wrapper.appendChild(gameWrapper);
        });

        return wrapper;
    },

    scheduleUpdate: function () {
        var self = this;
        setInterval(function () {
            self.getScores();
        }, this.config.updateInterval);

        // Refresh for the new day at 7:15 AM
        var now = new Date();
        var refreshTime = new Date();
        refreshTime.setHours(7, 15, 0, 0);
        var timeToRefresh = refreshTime - now;
        if (timeToRefresh < 0) {
            timeToRefresh += 86400000;  // Add 24 hours if past 7:15
        }

        setTimeout(function () {
            location.reload();
        }, timeToRefresh);
    },

    getScores: function () {
        this.sendSocketNotification("GET_MLB_SCORES", this.config.proxyUrls[this.currentProxyIndex]);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MLB_SCORES_RESULT") {
            this.scores = payload;
            this.updateDom();
        } else if (notification === "PROXY_ERROR") {
            // Try the next proxy URL in the list
            this.currentProxyIndex = (this.currentProxyIndex + 1) % this.config.proxyUrls.length;
            this.getScores();
        }
    },

    getBaseRunnerHTML: function (baserunners) {
        // Create base runner HTML based on positions (simplified example)
        return `
            <div class="bases">
                <div class="base \${baserunners.first ? 'occupied' : ''}"></div>
                <div class="base \${baserunners.second ? 'occupied' : ''}"></div>
                <div class="base \${baserunners.third ? 'occupied' : ''}"></div>
            </div>
        `;
    }
});
