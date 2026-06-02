import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as crypto from 'crypto';
import * as fs from 'fs';

const BUILD_TOOLS_VERSION = '36.0.0';
// SDK command-line tools 20.0
const CMDLINE_TOOLS_URL_MAC = 'https://dl.google.com/android/repository/commandlinetools-mac-14742923_latest.zip';
const CMDLINE_TOOLS_URL_LINUX = 'https://dl.google.com/android/repository/commandlinetools-linux-14742923_latest.zip';

// SHA-256 digests for the pinned cmdline-tools zips above. Update when the build number changes.
const CMDLINE_TOOLS_SHA256_MAC = 'ed304c5ede3718541e4f978e4ae870a4d853db74af6c16d920588d48523b9dee';
const CMDLINE_TOOLS_SHA256_LINUX = '04453066b540409d975c676d781da1477479dde3761310f1a7eb92a1dfb15af7';

function sha256File(filePath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

/**
 * Installs & updates the Android SDK for the macOS platform, including SDK platform for the chosen API level, latest build tools, platform tools, Android Emulator,
 * and the system image for the chosen API level, CPU arch, and target.
 */
export async function installAndroidSdk(
  apiLevel: string,
  systemImageApiLevel: String,
  target: string,
  arch: string,
  channelId: number,
  emulatorBuild?: string,
  ndkVersion?: string,
  cmakeVersion?: string,
): Promise<void> {
  try {
    console.log(`::group::Install Android SDK`);
    const isOnMac = process.platform === 'darwin';
    const isArm = process.arch === 'arm64';

    const cmdlineToolsPath = `${process.env.ANDROID_HOME}/cmdline-tools`;
    if (!fs.existsSync(cmdlineToolsPath)) {
      console.log('Installing new cmdline-tools.');
      const sdkUrl = isOnMac ? CMDLINE_TOOLS_URL_MAC : CMDLINE_TOOLS_URL_LINUX;
      const expectedSha256 = isOnMac ? CMDLINE_TOOLS_SHA256_MAC : CMDLINE_TOOLS_SHA256_LINUX;
      const downloadPath = await tc.downloadTool(sdkUrl);
      const actualSha256 = sha256File(downloadPath);
      if (actualSha256 !== expectedSha256) {
        core.warning(`cmdline-tools SHA-256 mismatch for ${sdkUrl}. Expected ${expectedSha256}, got ${actualSha256}. Continuing install.`);
      }
      await tc.extractZip(downloadPath, cmdlineToolsPath);
      await io.mv(`${cmdlineToolsPath}/cmdline-tools`, `${cmdlineToolsPath}/latest`);
    }

    // add paths for commandline-tools and platform-tools
    core.addPath(`${cmdlineToolsPath}/latest:${cmdlineToolsPath}/latest/bin:${process.env.ANDROID_HOME}/platform-tools`);

    // set standard AVD path
    await io.mkdirP(`${process.env.HOME}/.android/avd`);
    core.exportVariable('ANDROID_AVD_HOME', `${process.env.HOME}/.android/avd`);

    // accept all Android SDK licenses
    await exec.exec(`sh -c \\"yes | sdkmanager --licenses > /dev/null"`);

    console.log('Installing latest build tools, platform tools, and platform.');

    await exec.exec(`sh -c \\"sdkmanager --install 'build-tools;${BUILD_TOOLS_VERSION}' platform-tools 'platforms;android-${apiLevel}'> /dev/null"`);

    console.log('Installing latest emulator.');
    await exec.exec(`sh -c \\"sdkmanager --install emulator --channel=${channelId} > /dev/null"`);

    if (emulatorBuild) {
      console.log(`Installing emulator build ${emulatorBuild}.`);
      // TODO find out the correct download URLs for all build ids
      var downloadUrlSuffix: string;
      const majorBuildVersion = Number(emulatorBuild);
      if (majorBuildVersion >= 8000000) {
        if (isArm) {
          downloadUrlSuffix = `_aarch64-${emulatorBuild}`;
        } else {
          downloadUrlSuffix = `_x64-${emulatorBuild}`;
        }
      } else if (majorBuildVersion >= 7000000) {
        downloadUrlSuffix = `_x64-${emulatorBuild}`;
      } else {
        downloadUrlSuffix = `-${emulatorBuild}`;
      }
      await exec.exec(`curl -fo emulator.zip https://dl.google.com/android/repository/emulator-${isOnMac ? 'darwin' : 'linux'}${downloadUrlSuffix}.zip`);
      await exec.exec(`unzip -o -q emulator.zip -d ${process.env.ANDROID_HOME}`);
      await io.rmRF('emulator.zip');
    }
    console.log('Installing system images.');
    await exec.exec(`sh -c \\"sdkmanager --install 'system-images;android-${systemImageApiLevel};${target};${arch}' --channel=${channelId} > /dev/null"`);

    if (ndkVersion) {
      console.log(`Installing NDK ${ndkVersion}.`);
      await exec.exec(`sh -c \\"sdkmanager --install 'ndk;${ndkVersion}' --channel=${channelId} > /dev/null"`);
    }
    if (cmakeVersion) {
      console.log(`Installing CMake ${cmakeVersion}.`);
      await exec.exec(`sh -c \\"sdkmanager --install 'cmake;${cmakeVersion}' --channel=${channelId} > /dev/null"`);
    }
  } finally {
    console.log(`::endgroup::`);
  }
}
