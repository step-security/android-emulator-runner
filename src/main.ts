import * as core from '@actions/core';
import { installAndroidSdk } from './sdk-installer';
import {
  checkArch,
  checkAvdName,
  checkCores,
  checkDisableAnimations,
  checkEmulatorBuild,
  checkEmulatorOptions,
  checkDisableSpellchecker,
  checkDisableLinuxHardwareAcceleration,
  checkForceAvdCreation,
  checkChannel,
  checkEnableHardwareKeyboard,
  checkDiskSize,
  checkHeapSize,
  checkPort,
  checkProfile,
  checkRamSize,
  checkSdcardPathOrSize,
  playstoreTargetSubstitution,
  MIN_PORT,
} from './input-validator';
import { createAvd, launchEmulator, killEmulator } from './emulator-manager';
import * as exec from '@actions/exec';
import { parseScript } from './script-parser';
import { getChannelId } from './channel-id-mapper';
import * as fs from 'fs';
import axios, { isAxiosError } from 'axios';

async function validateSubscription(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let repoPrivate: boolean | undefined;

  if (eventPath && fs.existsSync(eventPath)) {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    repoPrivate = eventData?.repository?.private;
  }

  const upstream = 'reactivecircus/android-emulator-runner';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';

  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m✓ Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');

  if (repoPrivate === false) return;

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body: Record<string, string> = { action: action || '' };
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(`https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`, body, { timeout: 3000 });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

async function run() {
  await validateSubscription();
  let port: number = MIN_PORT;
  try {
    console.log(`::group::Configure emulator`);
    let linuxSupportKVM = false;
    // only support running on macOS or Linux
    if (process.platform !== 'darwin') {
      if (process.platform === 'linux') {
        try {
          fs.accessSync('/dev/kvm', fs.constants.R_OK | fs.constants.W_OK);
          linuxSupportKVM = true;
        } catch {
          console.warn(
            `You're running a Linux VM where hardware acceleration is not available. Please consider using a macOS VM instead to take advantage of native hardware acceleration support provided by HAXM.`,
          );
        }
      } else {
        throw new Error('Unsupported virtual machine: please use either macos or ubuntu VM.');
      }
    }

    // API level of the platform and system image
    const apiLevel = core.getInput('api-level', { required: true });
    console.log(`API level: ${apiLevel}`);

    let systemImageApiLevel = core.getInput('system-image-api-level');
    if (!systemImageApiLevel) {
      systemImageApiLevel = apiLevel;
    }
    console.log(`System image API level: ${systemImageApiLevel}`);

    // target of the system image
    const target = playstoreTargetSubstitution(core.getInput('target'));
    console.log(`target: ${target}`);

    // CPU architecture of the system image
    const arch = core.getInput('arch');
    checkArch(arch);
    console.log(`CPU architecture: ${arch}`);

    // Hardware profile used for creating the AVD
    const profile = core.getInput('profile');
    checkProfile(profile);
    console.log(`Hardware profile: ${profile}`);

    // Number of cores to use for emulator
    const cores = core.getInput('cores');
    checkCores(cores);
    console.log(`Cores: ${cores}`);

    // RAM to use for AVD
    const ramSize = core.getInput('ram-size');
    checkRamSize(ramSize);
    console.log(`RAM size: ${ramSize}`);

    // Heap size to use for AVD
    const heapSize = core.getInput('heap-size');
    checkHeapSize(heapSize);
    console.log(`Heap size: ${heapSize}`);

    // SD card path or size used for creating the AVD
    const sdcardPathOrSize = core.getInput('sdcard-path-or-size');
    checkSdcardPathOrSize(sdcardPathOrSize);
    console.log(`SD card path or size: ${sdcardPathOrSize}`);

    const diskSize = core.getInput('disk-size');
    checkDiskSize(diskSize);
    console.log(`Disk size: ${diskSize}`);

    // custom name used for creating the AVD
    const avdName = core.getInput('avd-name');
    checkAvdName(avdName);
    console.log(`AVD name: ${avdName}`);

    // force AVD creation
    const forceAvdCreationInput = core.getInput('force-avd-creation');
    checkForceAvdCreation(forceAvdCreationInput);
    const forceAvdCreation = forceAvdCreationInput === 'true';
    console.log(`force avd creation: ${forceAvdCreation}`);

    // Emulator boot timeout seconds
    const emulatorBootTimeout = parseInt(core.getInput('emulator-boot-timeout'), 10);
    console.log(`Emulator boot timeout: ${emulatorBootTimeout}`);

    // Emulator port to use
    port = parseInt(core.getInput('emulator-port'), 10);
    checkPort(port);
    console.log(`emulator port: ${port}`);

    // emulator options
    const emulatorOptions = core.getInput('emulator-options').trim();
    checkEmulatorOptions(emulatorOptions);
    console.log(`emulator options: ${emulatorOptions}`);

    // disable animations
    const disableAnimationsInput = core.getInput('disable-animations');
    checkDisableAnimations(disableAnimationsInput);
    const disableAnimations = disableAnimationsInput === 'true';
    console.log(`disable animations: ${disableAnimations}`);

    // disable spellchecker
    const disableSpellcheckerInput = core.getInput('disable-spellchecker');
    checkDisableSpellchecker(disableSpellcheckerInput);
    const disableSpellchecker = disableSpellcheckerInput === 'true';
    console.log(`disable spellchecker: ${disableSpellchecker}`);

    // disable linux hardware acceleration
    let disableLinuxHardwareAccelerationInput = core.getInput('disable-linux-hw-accel');
    checkDisableLinuxHardwareAcceleration(disableLinuxHardwareAccelerationInput);
    if (disableLinuxHardwareAccelerationInput === 'auto' && process.platform === 'linux') {
      disableLinuxHardwareAccelerationInput = linuxSupportKVM ? 'false' : 'true';
    }
    const disableLinuxHardwareAcceleration = disableLinuxHardwareAccelerationInput === 'true';
    console.log(`disable Linux hardware acceleration: ${disableLinuxHardwareAcceleration}`);

    // enable hardware keyboard
    const enableHardwareKeyboardInput = core.getInput('enable-hw-keyboard');
    checkEnableHardwareKeyboard(enableHardwareKeyboardInput);
    const enableHardwareKeyboard = enableHardwareKeyboardInput === 'true';
    console.log(`enable hardware keyboard: ${enableHardwareKeyboard}`);

    // emulator build
    const emulatorBuildInput = core.getInput('emulator-build');
    if (emulatorBuildInput) {
      checkEmulatorBuild(emulatorBuildInput);
      console.log(`using emulator build: ${emulatorBuildInput}`);
    }
    const emulatorBuild = !emulatorBuildInput ? undefined : emulatorBuildInput;

    // custom working directory
    const workingDirectoryInput = core.getInput('working-directory');
    if (workingDirectoryInput) {
      console.log(`custom working directory: ${workingDirectoryInput}`);
    }
    const workingDirectory = !workingDirectoryInput ? undefined : workingDirectoryInput;

    // version of NDK to install
    const ndkInput = core.getInput('ndk');
    if (ndkInput) {
      console.log(`version of NDK to install: ${ndkInput}`);
    }
    const ndkVersion = !ndkInput ? undefined : ndkInput;

    // version of CMake to install
    const cmakeInput = core.getInput('cmake');
    if (cmakeInput) {
      console.log(`version of CMake to install: ${cmakeInput}`);
    }
    const cmakeVersion = !cmakeInput ? undefined : cmakeInput;

    // channelId (up to and including) to download the SDK packages from
    const channelName = core.getInput('channel');
    checkChannel(channelName);
    const channelId = getChannelId(channelName);
    console.log(`Channel: ${channelId} (${channelName})`);

    // custom script to run
    const scriptInput = core.getInput('script', { required: true });
    const scripts = parseScript(scriptInput);
    console.log(`Script:`);
    scripts.forEach(async (script: string) => {
      console.log(`${script}`);
    });

    // custom pre emulator launch script
    const preEmulatorLaunchScriptInput = core.getInput('pre-emulator-launch-script');
    const preEmulatorLaunchScripts = !preEmulatorLaunchScriptInput ? undefined : parseScript(preEmulatorLaunchScriptInput);
    console.log(`Pre emulator launch script:`);
    preEmulatorLaunchScripts?.forEach(async (script: string) => {
      console.log(`${script}`);
    });
    console.log(`::endgroup::`);

    // install SDK
    await installAndroidSdk(apiLevel, systemImageApiLevel, target, arch, channelId, emulatorBuild, ndkVersion, cmakeVersion);

    // create AVD
    await createAvd(arch, avdName, cores, diskSize, enableHardwareKeyboard, forceAvdCreation, heapSize, profile, ramSize, sdcardPathOrSize, systemImageApiLevel, target);

    // execute pre emulator launch script if set
    if (preEmulatorLaunchScripts !== undefined) {
      console.log(`::group::Run pre emulator launch script`);
      try {
        for (const preEmulatorLaunchScript of preEmulatorLaunchScripts) {
          // use array form to avoid various quote escaping problems
          // caused by exec(`sh -c "${preEmulatorLaunchScript}"`)
          await exec.exec('sh', ['-c', preEmulatorLaunchScript], {
            cwd: workingDirectory,
          });
        }
      } catch (error) {
        core.setFailed(error instanceof Error ? error.message : (error as string));
      }
      console.log(`::endgroup::`);
    }

    // launch an emulator
    await launchEmulator(avdName, disableAnimations, disableLinuxHardwareAcceleration, disableSpellchecker, emulatorBootTimeout, emulatorOptions, enableHardwareKeyboard, port);

    // execute the custom script
    try {
      // move to custom working directory if set
      if (workingDirectory) {
        process.chdir(workingDirectory);
      }
      for (const script of scripts) {
        // use array form to avoid various quote escaping problems
        // caused by exec(`sh -c "${script}"`)
        await exec.exec('sh', ['-c', script], {
          env: { ...process.env, EMULATOR_PORT: `${port}`, ANDROID_SERIAL: `emulator-${port}` },
        });
      }
    } catch (error) {
      core.setFailed(error instanceof Error ? error.message : (error as string));
    }

    // finally kill the emulator
    await killEmulator(port);
  } catch (error) {
    // kill the emulator so the action can exit
    await killEmulator(port);
    core.setFailed(error instanceof Error ? error.message : (error as string));
  }
}

run();
