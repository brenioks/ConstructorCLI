// FIXME: Import/Use global namespace as definitions inside it are scattered around files
import { global } from "./GMEdit-Constructor/js/index.d.ts";
//import { global } from './GMEdit-Constructor/js/index.js';

const projectPath = "where the cli was called (.)";

/**
 * @implements {Destroyable}
 */
export class ConstructorCLI {
	
	/**
	 * @private
	 * @type {Preferences}
	 */
	preferences;

	/**	
	 * @type {ProjectComponents|undefined}
	 */
	currentProjectComponents = undefined;

	/**
	 * Initialise an instance of the plugin!
	 * 
	 * @param {NodeModules} nodeModules References to various NodeJS modules we need.
	 * @returns {Promise<Result<ConstructorPlugin>>}
	 */
    static async initialize(nodeModules) {
		nodeModulesProvider.inject(nodeModules);

		const diskIO = new NodeJSDiskIO(nodeModules.path.join, Electron_FS);
		const preferences = new Preferences(
			undefined,  // FIXME: Create an unused and empty problem logger to pass here
			new GMS2RuntimeIndexerImpl(diskIO),
			new UserIndexerImpl(diskIO),
			diskIO
		);

		return Ok(new ConstructorPlugin(preferences, diskIO));
	}
    
	/**
	 * Final, synchronous setup for the plugin instance happens here, once we've done the various
	 * asynchronous and fallible options during the {@link initialize} call.
	 * 
	 * @private
	 * @param {Preferences} preferences 
	 * @param {DiskIO} diskIO 
	 */
	constructor(preferences, diskIO) {
		this.preferences = preferences;

		/** @private */
		this.diskIO = diskIO;

        // onProjectOpen (Needs an project to be opened basically)
		if (this.currentProjectComponents !== undefined) {
			this.destroyCurrentProjectComponents();
		}

		// TODO: Use projectPath to open the project
        const project = project_current_get()
		const projectFormat = project_format_get(project);

		const projectProperties = new ProjectProperties(
			project,
			projectFormat.data.version,
			this.preferences,
			this.preferences.getLocalProjectPropertiesStore(project),
			undefined// this.controlPanel
		);
        
		const compileController = new CompileControllerImpl(project, this.diskIO);

		this.currentProjectComponents = {
			project,
			projectProperties,
			compileController
		};
	}

	destroy() {

		if (this.currentProjectComponents !== undefined) {
			this.destroyCurrentProjectComponents();
		}
		
	}
    
	/**
	 * Clean up the plugin state for the current project. Used when either closing the project, or
	 * when cleaning up the plugin.
	 * 
	 * @private
	 */
	destroyCurrentProjectComponents = () => {

		if (this.currentProjectComponents === undefined) {
			return;
		}

		const {
			configTreeUi,
			compileController,
			projectProperties
		} = this.currentProjectComponents;

		projectProperties.destroy();

		// FIXME: respect async here!
		compileController.destroyAsync();

		delete this.currentProjectComponents;

	}

    static async executeTask(task, components) {
        const { project, projectProperties, compileController } = components;

        /** @type {GMS2.RuntimeInfo} */
        let runtime;

        /** @type {GM.ReleaseChannel} */
        let channel;

        const chosenVersion = projectProperties.getRuntimeVersion();

        if (chosenVersion !== undefined) {
            channel = /** @type {GM.ReleaseChannel} */ (projectProperties.runtimeReleaseChannel);
            const result = this.preferences.getRuntimeInfo(channel, chosenVersion);

            runtime = result.data;
        }

        const user = this.preferences.getDefaultUser(channel);

        if (user === undefined) {
            // this.controlPanel.error('No user found to compile with.', new SolvableError(
            //     docString(`
            //         Constructor couldn't find any users at the data path specified for the
            //         ${channel} installation.
            //     `),
            //     docString(`
            //         Try specifying a different runtime channel type below, or check that the
            //         installation data path for ${channel} is correct.
            //     `)
            // ));
            return;
        }

        //let jobIdToReuse = undefined;

        const job = await compileController.start({
            task: task,
            user,
            runtime,
            prefabsPath: this.preferences.getPrefabsPath(channel),
            buildPath: this.getBuildDir(project),
            platform: projectProperties.platform ?? igorPaths.HOST_PLATFORM,
            device: projectProperties.device,
            runtimeType: projectProperties.runtimeBuildType,
            configName: projectProperties.buildConfigName
        }/*, jobIdToReuse*/);
    }

	/**
	 * Get the build directory to use for the given project.
	 * 
	 * @private
	 * @param {GMEdit.Project} project 
	 * @returns {string}
	 */
	getBuildDir(project) {
		return this.diskIO.joinPath(project.dir, 'build');
	}

	runCurrent = () => {
		if (this.currentProjectComponents !== undefined) {
			this.executeTask('Run', this.currentProjectComponents);
		}
	}

	packageCurrent = () => {
		if (this.currentProjectComponents !== undefined) {
			this.executeTask('Package', this.currentProjectComponents);
		}
	}

	/**
	 * Stop the currently viewed job, or the first running job if none are currently in view.
	 */
	stopCurrent = () => {
		if (this.currentProjectComponents === undefined) {
			return;
		}

		const currentTab = tab_current_get();

		if (currentTab?.gmlFile.editor instanceof OutputLogTab) {
			const outputLog = /** @type {JobOutputLog|undefined} */ (currentTab.gmlFile.editor.getClient());

			if (outputLog?.isRunning) {
				outputLog.stopJob();
				return;
			}
		}
		
		for (const output of JobOutputLog.instances) {
			if (output.job.getState().status === 'running') {
				output.job.stop();
				return;
			}
		}
	}

	cleanCurrent = async () => {

		const components = this.currentProjectComponents;
		
		if (components === undefined) {
			return;
		}

		const buildDir = this.getBuildDir(components.project);

		// Stop existing running jobs, as they wouldn't be too happy about their directories being cleared!
		await components.compileController.stopAll();
		
		// TODO: Swap Electron_FS with something else
		if (Electron_FS.existsSync(buildDir)) {
			try {
				Electron_FS.rmSync(buildDir, { recursive: true });
			} catch (err) {
				// this.controlPanel.error('Failed to clean project!', new SolvableError(
				// 	`An unexpected error occurred while removing the build directory '${buildDir}'.`,
				// 	'Do you have this directory open somewhere?',
				// 	err
				// ));
				return;
			}
		}

	}

}
