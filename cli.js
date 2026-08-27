import { IgorJob } from './IgorJob.js';
import * as igorPaths from './GMEdit-Constructor/js/compiler/igor-paths.js';
import { Err, Ok } from './GMEdit-Constructor/js/utils/Result.js';
import { BaseError, InvalidStateErr, SolvableError } from './GMEdit-Constructor/js/utils/Err.js';
import { GMRuntimeVersion } from './GMEdit-Constructor/js/compiler/GMVersion.js';
import { spawn } from 'node:child_process';

// Default flags GameMaker uses every time (decoded)
const ASSET_COMPILER_FEATURE_FLAGS = [
	"gm-auth-login",
	"mqtt",
	"audio-fx",
	"operagx-yyc",
	"intellisense",
	"nullish",
	"login_sso",
	"test",
	"custom_env",
	"filt+fx",
	"gx_mod_wallpaper",
	"gx_mod_gamestrip",
	"live_wallpaper_subscription",
	"code-editor",
	"strip_unused_assets",
	"update-process",
	"package-manager",
	"prefab-library",
	"svg",
	"reddit",
	"cronus"
];

function encodeFeatureFlags(flags) {
	const bytes = Buffer.from(flags.join(","), "utf-8");
	for (const [i, byte] of bytes.entries()) {
		bytes[i] = byte + 10;
	}
  	return bytes.toString("base64");
}

function getFlagsForJobSettings(settings, project) {

	const projectName = project.displayName;
	const blob_extension = "win";

	const flags = [
		"-rp=" + settings.runtime.path,
		"-cache=" + settings.buildPath + "/cache/",
		"-project=" + project.path,
		"-runtime=" + settings.runtimeType,
		"-of=" + `${settings.buildPath}/output/${projectName}.${blob_extension}`,
		//"-lf=" + settings.user.fullPath + "/license.plist",
		"-ac",
		`/ffe=${encodeFeatureFlags(ASSET_COMPILER_FEATURE_FLAGS)}`,
		"-jsonErrors=",
		"-uf=" + settings.user.fullPath,
		"-config=" + settings.configName,
		//"-options=" + "D:/OneDrive/Documents/FreebieProjects/DroidMaker//ConstructorCLI/test/build/build.bff",
	];

	if (settings.prefabsPath !== undefined) {
		flags.push("-prefabs=" + settings.prefabsPath);
	}

	if (settings.projectToolPath !== undefined) {
		flags.push("-projectool=" + settings.projectToolPath);
	}

	// Ignore cache to fix changes not applying in yyc
	if (settings.runtimeType === 'YYC') {
		flags.push('-ic');
	}

	if (settings.threads !== undefined) {
		flags.push("-j=" + settings.threads);
	}
	
	if (settings.device !== undefined) {
		flags.push(
			"-df=" + settings.device.filePath,
			"-device=" + settings.device.name
		);
	}

	/** @type {string} */
	let igorAction = settings.task;

	if (settings.task === "Package") {
		flags.push("-tf=" + settings.packageFile);
		switch (settings.platform) {
			case 'HTML5':
				igorAction = 'folder';
			break;

			case 'Windows':
			case 'Mac':
				igorAction = 'PackageZip';
			break;
		}
	}

	// Eg: "-v -- Windows Run"
	flags.push("-v", "--", settings.platform, igorAction);

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
		proc = spawn(settings.runtime.igorPath, flags, spawn_opts);

		startTime = await new Promise((resolve, reject) => {
			proc.once('spawn', () => resolve(new Date()));
			proc.once('error', reject);
		});
	} catch (err) {
		return Err(new InvalidStateErr('While trying to create the Igor process, the spawn() call failed unexpectedly', err));
	}

	const job = new IgorJob(1, settings, proc, project, startTime);

	// Open explorer inside the package directory with the package.zip selected
	const packageDir = settings.packageFile.substring(0, settings.packageFile.lastIndexOf("/"));
	const packageFile = settings.packageFile.substring(settings.packageFile.lastIndexOf("/") + 1);
	if (settings.task === "Package") {
		job.events.once('stop', () => spawn("explorer", ["/select,", ".\\" + packageFile], {cwd: packageDir}));
	}

	return Ok(job);
}

const runtime = {
	version: GMRuntimeVersion.parse("runtime-2026.0.0.23"),
	path: "C:/ProgramData/GameMakerStudio2-LTS2026/Cache/runtimes/runtime-2026.0.0.23",
	igorPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Cache/runtimes/runtime-2026.0.0.23/bin/igor/windows/x64/Igor.exe",
}

const user = {
	name: "el0fmail1",
	directoryName: "el0fmail1_2640949",
	fullPath: "C:/Users/aronb/AppData/Roaming/GameMakerStudio2-LTS2026/el0fmail1_2640949",
	devices: {
		path: "C:/Users/aronb/AppData/Roaming/GameMakerStudio2-LTS2026/el0fmail1_2640949/devices.json",
		forPlatform: undefined,
	},
}

console.log("Hi Igor starter!");

const startResult = await start({
	task: 'Package',	// 'Run' | 'Package'
	user,
	runtime,
	prefabsPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Prefabs",
	projectToolPath: "C:/ProgramData/GameMakerStudio2-LTS2026/Plugins/@gm-tools-project-tool-win-x64/ProjectTool.exe",
	buildPath: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/ConstructorCLI/test/build",
	platform: "Android",
	device: undefined,
	runtimeType: 'VM',
	configName: 'Default',
	packageFile: "D:/OneDrive/Documents/FreebieProjects/DroidMaker/ConstructorCLI/test/build/output/package.zip"
}, {
	displayName: "philosophers pit",
	dir: "D:/OneDrive/Documents/GameMakerStudio2/philosophers pit",
	path: "D:/OneDrive/Documents/GameMakerStudio2/philosophers pit/philosophers pit.yyp"
})

if (!startResult.ok) {
	console.error("Igor job failed!");
	process.exit(1);
}

const job = startResult.data;
console.log(job);

let stdout = "";
job.events.createGroup({
	stdout: content => {
		console.log(content.substring(stdout.length, content.length - 1));
		stdout = content;
	},
	stop: content => console.log("\n", content),
	stopping: undefined
});