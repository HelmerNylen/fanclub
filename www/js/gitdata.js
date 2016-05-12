angular.module('starter.gitdata', ['starter.services'])

.factory('GitService', function ($http, $state, StorageService, URLs, GitEndpoint, FoodEndpoint, DebuggerService) {
    var lastUpdate = StorageService.getOrDefault("gitLastUpdate", null);
    var content = StorageService.getOrDefault("gitContent", {});
    var callbacks = [];

    var update = function () {
        DebuggerService.log("Getting live data");
        try {
            $http.get(GitEndpoint.url + URLs.gitData("live-content/live.json")
                ).then(
                function successCallback(response) {
                    content = response.data;
                    lastUpdate = new Date().toDateString();
                    StorageService.set("gitLastUpdate", lastUpdate);
                    StorageService.set("gitContent", content);
                    for (var i = 0; i < callbacks.length; i++)
                        callbacks[i]();
                },
                function errorCallback(response) {
					DebuggerService.log("Error when getting live content from GitHub: " + JSON.stringify(response), "red");
                    for (var i = 0; i < callbacks.length; i++)
                        callbacks[i]();
                });
        } catch (e) {
            console.log(e);
        }
    };

    if (new Date().toDateString() != lastUpdate)
        update();
    else
        for (var i = 0; i < callbacks.length; i++)
            callbacks[i]();

    return {
        getContent: function () {
            return content;
        },
        registerCallback: function (cb) {
            callbacks.push(cb);
        }
    };
})
;