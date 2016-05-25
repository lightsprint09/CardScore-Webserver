var haikunator = require("haikunator");

var count = 10000
var object = {}

var errors = 0
for(var i = 0; i < count; i++) {
	var name = haikunator({tokenLength: 0});
	var trys = 0
	while(object[name]) {
		var tokenLength = trys > 10 ? 2 : 0
		name = haikunator({tokenLength: tokenLength});
		
		if (trys > 10) {
			errors++
		}
		trys++
		
	}
	object[name] = true
}
console.log(100 / count * errors)