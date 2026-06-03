export const MIN_API_LEVEL = 15;
export const VALID_ARCHS: Array<string> = ['x86', 'x86_64', 'arm64-v8a'];
export const VALID_CHANNELS: Array<string> = ['stable', 'beta', 'dev', 'canary'];
export const MIN_PORT = 5554;
export const MAX_PORT = 5584;

const AVD_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;
const PROFILE_PATTERN = /^[A-Za-z0-9 ._()-]+$/;
const SDCARD_PATH_OR_SIZE_PATTERN = /^[A-Za-z0-9./_-]+$/;
const CORES_PATTERN = /^[0-9]+$/;
const MEMORY_SIZE_PATTERN = /^[0-9]+[KkMmGg]?$/;
const EMULATOR_OPTIONS_PATTERN = /^[A-Za-z0-9 ._:=/,@+-]+$/;

export function playstoreTargetSubstitution(target: string): string {
  // "playstore" is an allowed shorthand for "google_apis_playstore" images
  // this is idempotent - return same even if run multiple times on same target
  if (target === 'playstore') return 'google_apis_playstore';
  if (target === 'playstore_ps16k') return 'google_apis_playstore_ps16k';
  return target;
}

export function checkArch(arch: string): void {
  if (!VALID_ARCHS.includes(arch)) {
    throw new Error(`Value for input.arch '${arch}' is unknown. Supported options: ${VALID_ARCHS}.`);
  }
}

export function checkChannel(channel: string): void {
  if (!VALID_CHANNELS.includes(channel)) {
    throw new Error(`Value for input.channel '${channel}' is unknown. Supported options: ${VALID_CHANNELS}.`);
  }
}

export function checkForceAvdCreation(forceAvdCreation: string): void {
  if (!isValidBoolean(forceAvdCreation)) {
    throw new Error(`Input for input.force-avd-creation should be either 'true' or 'false'.`);
  }
}

export function checkPort(port: number): void {
  if (port < MIN_PORT || port > MAX_PORT) {
    throw new Error(`Emulator port is outside of the supported port range [${MIN_PORT}, ${MAX_PORT}], was ${port}`);
  }
  if (port % 2 == 1) {
    throw new Error(`Emulator port has to be even, was ${port}`);
  }
}

export function checkDisableAnimations(disableAnimations: string): void {
  if (!isValidBoolean(disableAnimations)) {
    throw new Error(`Input for input.disable-animations should be either 'true' or 'false'.`);
  }
}

export function checkDisableSpellchecker(disableSpellchecker: string): void {
  if (!isValidBoolean(disableSpellchecker)) {
    throw new Error(`Input for input.disable-spellchecker should be either 'true' or 'false'.`);
  }
}

export function checkDisableLinuxHardwareAcceleration(disableLinuxHardwareAcceleration: string): void {
  if (!(isValidBoolean(disableLinuxHardwareAcceleration) || disableLinuxHardwareAcceleration === 'auto')) {
    throw new Error(`Input for input.disable-linux-hw-accel should be either 'true' or 'false' or 'auto'.`);
  }
}

export function checkEnableHardwareKeyboard(enableHardwareKeyboard: string): void {
  if (!isValidBoolean(enableHardwareKeyboard)) {
    throw new Error(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
  }
}

export function checkEmulatorBuild(emulatorBuild: string): void {
  if (isNaN(Number(emulatorBuild)) || !Number.isInteger(Number(emulatorBuild))) {
    throw new Error(`Unexpected emulator build: '${emulatorBuild}'.`);
  }
}

function isValidBoolean(value: string): boolean {
  return value === 'true' || value === 'false';
}

export function checkAvdName(avdName: string): void {
  if (!AVD_NAME_PATTERN.test(avdName)) {
    throw new Error(`Invalid avd-name '${avdName}'. Allowed characters: letters, digits, '.', '_', '-'.`);
  }
}

export function checkProfile(profile: string): void {
  if (profile.trim() !== '' && !PROFILE_PATTERN.test(profile)) {
    throw new Error(`Invalid profile '${profile}'. Allowed characters: letters, digits, spaces, '.', '_', '-', '(', ')'.`);
  }
}

export function checkSdcardPathOrSize(sdcardPathOrSize: string): void {
  if (sdcardPathOrSize.trim() !== '' && !SDCARD_PATH_OR_SIZE_PATTERN.test(sdcardPathOrSize)) {
    throw new Error(`Invalid sdcard-path-or-size '${sdcardPathOrSize}'. Allowed characters: letters, digits, '/', '.', '_', '-'.`);
  }
}

export function checkCores(cores: string): void {
  if (cores.trim() !== '' && !CORES_PATTERN.test(cores)) {
    throw new Error(`Invalid cores '${cores}'. Must be a positive integer.`);
  }
}

export function checkRamSize(ramSize: string): void {
  if (ramSize.trim() !== '' && !MEMORY_SIZE_PATTERN.test(ramSize)) {
    throw new Error(`Invalid ram-size '${ramSize}'. Must be a number, optionally with K, M, or G suffix.`);
  }
}

export function checkHeapSize(heapSize: string): void {
  if (heapSize.trim() !== '' && !MEMORY_SIZE_PATTERN.test(heapSize)) {
    throw new Error(`Invalid heap-size '${heapSize}'. Must be a number, optionally with K, M, or G suffix.`);
  }
}

export function checkEmulatorOptions(emulatorOptions: string): void {
  if (emulatorOptions.trim() !== '' && !EMULATOR_OPTIONS_PATTERN.test(emulatorOptions)) {
    throw new Error(`Invalid emulator-options '${emulatorOptions}'. Allowed characters: letters, digits, spaces, '.', '_', '-', ':', '=', '/', ',', '@', '+'.`);
  }
}

export function checkDiskSize(diskSize: string): void {
  // Disk size can be empty - the default value
  if (diskSize) {
    // Can also be number of bytes
    if (isNaN(Number(diskSize)) || !Number.isInteger(Number(diskSize))) {
      // Disk size can have a size multiplier at the end K, M or G
      const diskSizeUpperCase = diskSize.toUpperCase();
      if (diskSizeUpperCase.endsWith('K') || diskSizeUpperCase.endsWith('M') || diskSizeUpperCase.endsWith('G')) {
        const diskSizeNoModifier: string = diskSize.slice(0, -1);
        if (0 == diskSizeNoModifier.length || isNaN(Number(diskSizeNoModifier)) || !Number.isInteger(Number(diskSizeNoModifier))) {
          throw new Error(`Unexpected disk size: '${diskSize}'.`);
        }
      }
    }
  }
}
