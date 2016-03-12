angular.module('starter.gitdata', ['starter.services'])

.factory('GitService', function($http, $state, StorageService, URLs, GitEndpoint, FoodEndpoint) {
	var content = null;
	var callbacks = [];
	
	try {
		$http.get(GitEndpoint.url + URLs.gitData("live-content/live.json")
			).then(
			function successCallback(response) {
				console.log(response);
				content = response.data;
				for (var i = 0; i < callbacks.length; i++)
					callbacks[i]();
			},
			function errorCallback(response) {
				console.log("Error when getting git data: " + response.status + ": " + response.statusText + ", " + response.data);
				for (var i = 0; i < callbacks.length; i++)
					callbacks[i]();
		});
	} catch (e) {
		console.log(e);
	}
	
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