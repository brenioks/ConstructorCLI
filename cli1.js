//import { IgorJob } from './GMEdit-Constructor/js/compiler/job/IgorJob.js';
import * as igorPaths from './GMEdit-Constructor/js/compiler/igor-paths.js';
import { Err, Ok } from './GMEdit-Constructor/js/utils/Result.js';
import { BaseError, InvalidStateErr, SolvableError } from './GMEdit-Constructor/js/utils/Err.js';
import { GMRuntimeVersion } from './GMEdit-Constructor/js/compiler/GMVersion.js';
import { spawn } from 'node:child_process';

/** @type {import('node:child_process')} */ 
let child_process;

function getFlagsForJobSettings(settings, project) {

	const projectName = project.displayName;
	const blob_extension = "win";

	const flags = [
		'/project=' + project.dir,
		'/config=' + settings.configName,
		'/rp=' + settings.runtime.path,
		'/runtime=' + settings.runtimeType,
		'/cache=' + settings.buildPath + 'cache',
		'/of=' + settings.buildPath + 'output' + `${projectName}.${blob_extension}`,
		`/uf=${settings.user.fullPath}`,
		'/v'
	];

	if (settings.prefabsPath !== undefined) {
		flags.push(`/prefabs=${settings.prefabsPath}`);
	}

	// ignore cache, this fixes changes not applying in yyc
	if (settings.runtimeType === 'YYC') {
		flags.push('/ic');
	}

	if (settings.threads !== undefined) {
		flags.push(`/j=${settings.threads}`);
	}

	if (settings.device !== undefined) {
		flags.push(
			`/df=${settings.device.filePath}`,
			`/device=${settings.device.name}`
		);
	}

	/** @type {string} */
	let igorVerb = settings.task;

	switch (settings.platform) {
		case 'HTML5':
			if (settings.task === 'Package') {
				igorVerb = 'folder';
			}
		break;

		case 'Windows':
		case 'Mac':
			if (settings.task === 'Package') {
				igorVerb = 'PackageZip';
			}
		break;
	}

	flags.push('--');
	flags.push(settings.platform, igorVerb);

	return flags;
}

async function start(settings, project) {
	/** @type {NodeJS.ProcessEnv} */
	const env = Object.assign({}, process.env);
	
	const flags = getFlagsForJobSettings(settings, project);

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
		proc = spawn(settings.runtime.igorPath);

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
const job = await start({
	task: 'Package',	// 'Run' | 'Package'
	user,
	runtime,
	prefabsPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Prefabs/",
	buildPath: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/CLI tests/build/",
	platform: igorPaths.HOST_PLATFORM,
	device: undefined,
	runtimeType: 'VM',
	configName: 'Default'
}, {
	displayName: "CLI tests",
	dir: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/CLI tests"
})
console.log(job);
