/*
node config/build.js -lHRs --ip=$HOST --port=$PORT --env=dev
{
	l: true,
	H: true,
	R: true,
	s: true,
	ip: '127.0.0.1',
	port: '8080',
	env: 'dev'
}
*/
export function getArgs() {
	var args = {};
	process.argv
		.slice(2, process.argv.length)
		.forEach(function (arg) {
			// long arg
			if (arg.slice(0, 2) === '--') {
				var longArg = arg.split('=');
				var longArgFlag = longArg[0].slice(2, longArg[0].length);
				var longArgValue = longArg.length > 1 ? longArg[1] : true;
				args[longArgFlag] = longArgValue;
			}
			// flags
			else if (arg[0] === '-') {
				var flags = arg.slice(1, arg.length).split('');
				flags.forEach(function (flag) {
					args[flag] = true;
				});
			}
		});
	return args;
}
