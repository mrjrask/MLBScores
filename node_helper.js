
const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function (notification, proxyUrl) {
        if (notification === "GET_MLB_SCORES") {
            this.getMLBScores(proxyUrl);
        }
    },

    getMLBScores: function (proxyUrl) {
        axios.get(proxyUrl)
            .then((response) => {
                // Send the parsed scores back to the front-end
                this.sendSocketNotification("MLB_SCORES_RESULT", response.data);
            })
            .catch((error) => {
                console.log("Error fetching MLB scores from proxy: ", proxyUrl, error);
                this.sendSocketNotification("PROXY_ERROR");  // Notify front-end to try another proxy
            });
    }
});
