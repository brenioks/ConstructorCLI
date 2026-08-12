//import { IgorJob } from './GMEdit-Constructor/js/compiler/job/IgorJob.js';
import { child_process } from './GMEdit-Constructor/js/utils/node/node-import.js';
import { Err, Ok } from './GMEdit-Constructor/js/utils/Result.js';

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

console.log("hi igor spawner");
//spawn(undefined, undefined);
