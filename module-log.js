/*
// File: module-log.js
// Path: /
//
// Logging module for cv.epite.ch: Wraps calls to console.log and console.dir to
// add the module the logging was called from.
//
// This module works by calling custom functions to call. IE:
// > var LOG_A = log('CALL_ME_A');
// > var LOG_B = log('IAM_THE_B');
// > LOG_A('%s', 'foo');
// [CALL_ME_A] foo
// > LOB_B('bar %d', 4);
// [IAM_THE_B] bar 4
// >
//
// For more control over logging, the ENV value DONOTLOG (if present) is split
// to an array over every ':' character and none of the logging functions will
// print anything if the module name is present in the DONOTLOG array. Trick is
// achieved by simply returning an empty function when called with an undesired
// module name.
//
// Dependencies:
// - {LIB} util
//
// Contents:
// - Function: log (moduleName)
// - Function: dir (moduleName)
//
// Exports:
// - log {Function}
// - dir {Function}
*/

(function () {
	var util = require('util');
	var DONOTLOG = process.env.DONOTLOG;
	if (DONOTLOG) {
		DONOTLOG = DONOTLOG.split(':');
	} else {
		DONOTLOG = [];
	}

	/*
	// Function: log (moduleName)
	//
	// Console.log() wrapper to clarify modules that sent a specific log (and
	// pretty useful for grep-ing the log files). Is called with an (optional)
	// string as module name and returns a function that will apply its own
	// arguments to console.log() after having added the moduleName right before
	// its first argument.
	//
	// If not provided, moduleName will be implied to be '---'.
	//
	// Arguments:
	// - moduleName {String} String to use as module name for future calls of
	//                       the resulting function. If not enclosed withing
	//                       brackets, they will be added.
	*/
	function log (moduleName) {
		if (DONOTLOG.indexOf(moduleName) !== -1) return function(){};
		if (!moduleName) moduleName = '---';
		else if (moduleName[0] != '[') moduleName = '[' + moduleName + ']';
		return function LOG () {
			if (!arguments[0]) return;
			var space = (arguments[0][0] === '[') ? '' : ' ';
			arguments[0] = moduleName + space + arguments[0];
			return console.log.apply(this, arguments);
		};
	};


	/*
	// Function: dir (moduleName)
	//
	// Console.dir() wrapper to clarify modules that asked for inspection of an
	// object by prepending every line of the inspection with the module name.
	// Use is exactly the same as log from this module.
	//
	// If not provided, moduleName will be implied to be '---'.
	//
	// Arguments:
	// - moduleName {String} String to use as module name for future calls of
	//                       the resulting function. If not enclosed withing
	//                       brackets, they will be added.
	*/
	function dir (moduleName) {
		if (DONOTLOG.indexOf(moduleName) !== -1) return function(){};
		if (!moduleName) moduleName = '---';
		else if (moduleName[0] != '[') moduleName = '[' + moduleName + ']';
		moduleName += ' ';
		return function DIR (obj) {
			obj = moduleName + util.inspect(obj).replace(/\n/g, '\n' + moduleName);
			console.log(obj);
			return;
		};
	}

	module.exports = {
		log: log,
		dir: dir
	};

})();
