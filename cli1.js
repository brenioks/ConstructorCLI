//import { IgorJob } from './GMEdit-Constructor/js/compiler/job/IgorJob.js';
import { child_process } from './GMEdit-Constructor/js/utils/node/node-import.js';
import * as igorPaths from './GMEdit-Constructor/js/compiler/igor-paths.js';
import { Err, Ok } from './GMEdit-Constructor/js/utils/Result.js';
import { BaseError, InvalidStateErr, SolvableError } from './GMEdit-Constructor/js/utils/Err.js';
import { GMRuntimeVersion } from './GMEdit-Constructor/js/compiler/GMVersion.js';

async function spawn(settings, project) {
	/** @type {NodeJS.ProcessEnv} */
	const env = Object.assign({}, process.env);
	
	/** @type {import('node:child_process').SpawnOptionsWithoutStdio} */
	const spawn_opts = {
		cwd: project.dir,
		detached: (process.platform !== 'win32'),
		env,
	};

	/** @type {import('node:child_process').ChildProcessWithoutNullStreams} */
	let proc;
	/** @type {Date} */
	let startTime;

	try {
		proc = child_process.spawn(settings.runtime.igorPath, flags, spawn_opts);

		startTime = await new Promise((resolve, reject) => {
			proc.once('spawn', () => resolve(new Date()));
			proc.once('error', reject);
		});
	} catch (err) {
		return Err(new InvalidStateErr('While trying to create the Igor process, the spawn() call failed unexpectedly', err));
	}

	const job = new IgorJob(1, settings, proc, project, startTime);

	//this.jobs.push(job);
	//job.events.once('stop', () => this.removeJob(job));

	return Ok(job);
}

const runtime = {
	version: GMRuntimeVersion.parse("runtime-2026.0.0.23"),
	path: "C:/ProgramData/GameMakerStudio2-LTS2026/Cache/runtimes/runtime-2026.0.0.23/",
	igorPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Cache/runtimes/runtime-2026.0.0.23/bin/igor/windows/x64/Igor.exe",
}

const user = {
	name: "el0fmail1",
	directoryName: "el0fmail1_2640949",
	fullPath: "C:/Users/aronb/AppData/Roaming/GameMakerStudio2-LTS2026/el0fmail1_2640949/",
	devices: {
		path: "C:/Users/aronb/AppData/Roaming/GameMakerStudio2-LTS2026/el0fmail1_2640949/devices.json",
		forPlatform: undefined,
	},
}

console.log("hi igor spawner");
const job = await spawn({
	task: 'Package',	// 'Run' | 'Package'
	user,
	runtime,
	prefabsPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Prefabs/",
	buildPath: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/CLI tests/build",
	platform: igorPaths.HOST_PLATFORM,
	device: undefined,
	runtimeType: 'VM',
	configName: 'Default'
}, {
	dir: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/CLI tests"
})
console.log(job);