module.exports = (function() {
	"use strict";
		
	function performPostRequest(url, data, callback, headerOptions) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		handleRequest(xhr, callback, headerOptions);
		xhr.send(JSON.stringify(data));
	}
		
	function performGetRequest(url, data, callback, headerOptions) {
		url = addParameterToURL(url, data);
		var xhr = new XMLHttpRequest();	
		xhr.open("GET", url);
		handleRequest(xhr, callback, headerOptions);
		xhr.send();
	}
	
	var DEFAULT_HEADER_OPTIONS = {
		"Accept": "application/json",
		"Content-Type": "application/json"
	};
	
	function handleRequest(xhr, callback, headerOptions) {
		var header = headerOptions || DEFAULT_HEADER_OPTIONS;
		for(var key in header) {
			xhr.setRequestHeader(key, header[key]);
		}
		xhr.onreadystatechange = function onRequestReadyChange() {
			if(this.status === 401) {
				callback(new Error("Invalid Credentials"));
			}
			if (this.readyState == 4) {
				callback(null, this.responseText);
			}
		};
		xhr.onerror = function onReuqestError() {
			callback(new Error("An Error occured"));
		};
	}
	
	function getJSONParseCallback(callback) {
		function parseJSON(err, data) {
			if(data) {
				//TODO try/catch
				data = JSON.parse(data);
				callback(err, data);
			}else {
				callback(err);
			}
			
		};
		
		return parseJSON;
	}
	
	function addParameterToURL(url, parameters) {
		var result = url;
		var addCharacter = "?";
		for(var key in parameters) {
			url += (addCharacter + key + "=" + parameters[key]);
			addCharacter = "&";
		}
		
		return url;
	}
	
	return {
		performPostRequest: performPostRequest,
		performGetRequest: performGetRequest,
		getJSONParseCallback: getJSONParseCallback,
		addParameterToURL: addParameterToURL
	};
})()