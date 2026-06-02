import * as validator from '../src/input-validator';
import { MAX_PORT, MIN_PORT } from '../src/input-validator';

describe('arch validator tests', () => {
  it('Throws if arch is unknown', () => {
    const func = () => {
      validator.checkArch('some-arch');
    };
    expect(func).toThrowError(`Value for input.arch 'some-arch' is unknown. Supported options: ${validator.VALID_ARCHS}`);
  });

  it('Validates successfully with valid arch', () => {
    const func1 = () => {
      validator.checkArch('x86');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkArch('x86_64');
    };
    expect(func2).not.toThrow();
  });
});

describe('channel validator tests', () => {
  it('Throws if channel is unknown', () => {
    const func = () => {
      validator.checkChannel('some-channel');
    };
    expect(func).toThrowError(`Value for input.channel 'some-channel' is unknown. Supported options: ${validator.VALID_CHANNELS}`);
  });

  it('Validates successfully with valid channel', () => {
    const func1 = () => {
      validator.checkChannel('stable');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkChannel('beta');
    };
    expect(func2).not.toThrow();

    const func3 = () => {
      validator.checkChannel('dev');
    };
    expect(func3).not.toThrow();

    const func4 = () => {
      validator.checkChannel('canary');
    };
    expect(func4).not.toThrow();
  });
});

describe('force-avd-creation validator tests', () => {
  it('Throws if force-avd-creation is not a boolean', () => {
    const func = () => {
      validator.checkForceAvdCreation('yes');
    };
    expect(func).toThrowError(`Input for input.force-avd-creation should be either 'true' or 'false'.`);
  });

  it('Validates successfully if force-avd-creation is either true or false', () => {
    const func1 = () => {
      validator.checkForceAvdCreation('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkForceAvdCreation('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('emulator-port validator tests', () => {
  it('Validates if emulator-port is even and in range', () => {
    const func = () => {
      validator.checkPort(5554);
    };
    expect(func).not.toThrow();
  });
  it('Throws if emulator-port is lower than MIN_PORT', () => {
    const func = () => {
      validator.checkPort(MIN_PORT - 2);
    };
    expect(func).toThrow();
  });
  it('Throws if emulator-port is higher than MAX_PORT', () => {
    const func = () => {
      validator.checkPort(MAX_PORT + 2);
    };
    expect(func).toThrow();
  });
  it('Throws if emulator-port is odd', () => {
    const func = () => {
      validator.checkPort(5555);
    };
    expect(func).toThrow();
  });
});

describe('disable-animations validator tests', () => {
  it('Throws if disable-animations is not a boolean', () => {
    const func = () => {
      validator.checkDisableAnimations('yes');
    };
    expect(func).toThrowError(`Input for input.disable-animations should be either 'true' or 'false'.`);
  });

  it('Validates successfully if disable-animations is either true or false', () => {
    const func1 = () => {
      validator.checkDisableAnimations('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableAnimations('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('disable-spellchecker validator tests', () => {
  it('Throws if disable-spellchecker is not a boolean', () => {
    const func = () => {
      validator.checkDisableSpellchecker('yes');
    };
    expect(func).toThrowError(`Input for input.disable-spellchecker should be either 'true' or 'false'.`);
  });

  it('Validates successfully if disable-spellchecker is either true or false', () => {
    const func1 = () => {
      validator.checkDisableSpellchecker('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableSpellchecker('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('disable-linux-hw-accel validator tests', () => {
  it('Throws if disable-linux-hw-accel is not a boolean', () => {
    const func = () => {
      validator.checkDisableLinuxHardwareAcceleration('yes');
    };
    expect(func).toThrowError(`Input for input.disable-linux-hw-accel should be either 'true' or 'false' or 'auto'.`);
  });

  it('Validates successfully if disable-linux-hw-accel is either true or false or auto', () => {
    const func1 = () => {
      validator.checkDisableLinuxHardwareAcceleration('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableLinuxHardwareAcceleration('false');
    };
    expect(func2).not.toThrow();

    const func3 = () => {
      validator.checkDisableLinuxHardwareAcceleration('auto');
    };
    expect(func3).not.toThrow();
  });
});

describe('enable-hw-keyboard validator tests', () => {
  it('Throws if enable-hw-keyboard is not a boolean', () => {
    const func = () => {
      validator.checkEnableHardwareKeyboard('yes');
    };
    expect(func).toThrowError(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
  });

  it('Validates successfully if enable-hardware-keyboard is either true or false', () => {
    const func1 = () => {
      validator.checkEnableHardwareKeyboard('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkEnableHardwareKeyboard('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('emulator-build validator tests', () => {
  it('Throws if emulator-build is not a number', () => {
    const func = () => {
      validator.checkEmulatorBuild('abc123');
    };
    expect(func).toThrowError(`Unexpected emulator build: 'abc123'.`);
  });

  it('Throws if emulator-build is not an integer', () => {
    const func = () => {
      validator.checkEmulatorBuild('123.123');
    };
    expect(func).toThrowError(`Unexpected emulator build: '123.123'.`);
  });

  it('Validates successfully with valid emulator-build', () => {
    const func = () => {
      validator.checkEmulatorBuild('6061023');
    };
    expect(func).not.toThrow();
  });
});

describe('avd-name validator tests', () => {
  it('Accepts typical AVD names', () => {
    expect(() => validator.checkAvdName('test')).not.toThrow();
    expect(() => validator.checkAvdName('Pixel_7_Pro')).not.toThrow();
    expect(() => validator.checkAvdName('avd-1.2')).not.toThrow();
  });

  it('Rejects empty avd-name', () => {
    expect(() => validator.checkAvdName('')).toThrowError(`Invalid avd-name ''.`);
  });

  it('Rejects shell metacharacters', () => {
    expect(() => validator.checkAvdName(`test'; whoami; echo '`)).toThrow();
    expect(() => validator.checkAvdName('test"; rm -rf /; echo "')).toThrow();
    expect(() => validator.checkAvdName('test$(whoami)')).toThrow();
    expect(() => validator.checkAvdName('test`whoami`')).toThrow();
    expect(() => validator.checkAvdName('test|cat /etc/passwd')).toThrow();
    expect(() => validator.checkAvdName('test name with space')).toThrow();
  });
});

describe('profile validator tests', () => {
  it('Accepts empty profile (optional input)', () => {
    expect(() => validator.checkProfile('')).not.toThrow();
    expect(() => validator.checkProfile('   ')).not.toThrow();
  });

  it('Accepts typical profile names', () => {
    expect(() => validator.checkProfile('Galaxy Nexus')).not.toThrow();
    expect(() => validator.checkProfile('pixel_7_pro')).not.toThrow();
    expect(() => validator.checkProfile('7in WSVGA (Tablet)')).not.toThrow();
  });

  it('Rejects shell metacharacters', () => {
    expect(() => validator.checkProfile(`Galaxy'; whoami; echo '`)).toThrow();
    expect(() => validator.checkProfile('p$(whoami)')).toThrow();
    expect(() => validator.checkProfile('p`whoami`')).toThrow();
    expect(() => validator.checkProfile('p|cat')).toThrow();
    expect(() => validator.checkProfile('p;ls')).toThrow();
  });
});

describe('sdcard-path-or-size validator tests', () => {
  it('Accepts empty value (optional input)', () => {
    expect(() => validator.checkSdcardPathOrSize('')).not.toThrow();
    expect(() => validator.checkSdcardPathOrSize('   ')).not.toThrow();
  });

  it('Accepts size values', () => {
    expect(() => validator.checkSdcardPathOrSize('100M')).not.toThrow();
    expect(() => validator.checkSdcardPathOrSize('1000K')).not.toThrow();
    expect(() => validator.checkSdcardPathOrSize('1G')).not.toThrow();
  });

  it('Accepts path values', () => {
    expect(() => validator.checkSdcardPathOrSize('/path/to/sdcard')).not.toThrow();
    expect(() => validator.checkSdcardPathOrSize('./relative/path-1.img')).not.toThrow();
  });

  it('Rejects shell metacharacters', () => {
    expect(() => validator.checkSdcardPathOrSize(`100M'; whoami; echo '`)).toThrow();
    expect(() => validator.checkSdcardPathOrSize('$(whoami)')).toThrow();
    expect(() => validator.checkSdcardPathOrSize('`whoami`')).toThrow();
    expect(() => validator.checkSdcardPathOrSize('100M|cat')).toThrow();
    expect(() => validator.checkSdcardPathOrSize('100M;ls')).toThrow();
    expect(() => validator.checkSdcardPathOrSize('/path with space')).toThrow();
  });
});

describe('cores validator tests', () => {
  it('Accepts empty value (uses default)', () => {
    expect(() => validator.checkCores('')).not.toThrow();
  });

  it('Accepts positive integers', () => {
    expect(() => validator.checkCores('1')).not.toThrow();
    expect(() => validator.checkCores('2')).not.toThrow();
    expect(() => validator.checkCores('16')).not.toThrow();
  });

  it('Rejects shell metacharacters and non-integer values', () => {
    expect(() => validator.checkCores(`2'; whoami; #`)).toThrow();
    expect(() => validator.checkCores('2$(whoami)')).toThrow();
    expect(() => validator.checkCores('2`whoami`')).toThrow();
    expect(() => validator.checkCores('2|cat')).toThrow();
    expect(() => validator.checkCores('2;ls')).toThrow();
    expect(() => validator.checkCores('-2')).toThrow();
    expect(() => validator.checkCores('2.5')).toThrow();
    expect(() => validator.checkCores('two')).toThrow();
  });
});

describe('ram-size validator tests', () => {
  it('Accepts empty value (optional input)', () => {
    expect(() => validator.checkRamSize('')).not.toThrow();
  });

  it('Accepts size values', () => {
    expect(() => validator.checkRamSize('2048')).not.toThrow();
    expect(() => validator.checkRamSize('2048M')).not.toThrow();
    expect(() => validator.checkRamSize('2048m')).not.toThrow();
    expect(() => validator.checkRamSize('2K')).not.toThrow();
    expect(() => validator.checkRamSize('1G')).not.toThrow();
  });

  it('Rejects shell metacharacters and malformed sizes', () => {
    expect(() => validator.checkRamSize(`2048M'; whoami; #`)).toThrow();
    expect(() => validator.checkRamSize('$(whoami)')).toThrow();
    expect(() => validator.checkRamSize('`whoami`')).toThrow();
    expect(() => validator.checkRamSize('2048M|cat')).toThrow();
    expect(() => validator.checkRamSize('2048MM')).toThrow();
    expect(() => validator.checkRamSize('2048T')).toThrow();
  });
});

describe('heap-size validator tests', () => {
  it('Accepts empty value (optional input)', () => {
    expect(() => validator.checkHeapSize('')).not.toThrow();
  });

  it('Accepts size values', () => {
    expect(() => validator.checkHeapSize('512')).not.toThrow();
    expect(() => validator.checkHeapSize('512M')).not.toThrow();
    expect(() => validator.checkHeapSize('512m')).not.toThrow();
    expect(() => validator.checkHeapSize('1G')).not.toThrow();
  });

  it('Rejects shell metacharacters and malformed sizes', () => {
    expect(() => validator.checkHeapSize(`512M'; whoami; #`)).toThrow();
    expect(() => validator.checkHeapSize('$(whoami)')).toThrow();
    expect(() => validator.checkHeapSize('`whoami`')).toThrow();
    expect(() => validator.checkHeapSize('512M;ls')).toThrow();
    expect(() => validator.checkHeapSize('512MM')).toThrow();
  });
});

describe('emulator-options validator tests', () => {
  it('Accepts empty value', () => {
    expect(() => validator.checkEmulatorOptions('')).not.toThrow();
  });

  it('Accepts default and typical emulator options', () => {
    expect(() => validator.checkEmulatorOptions('-no-window -gpu swiftshader_indirect -no-snapshot -noaudio -no-boot-anim')).not.toThrow();
    expect(() => validator.checkEmulatorOptions('-no-snapshot-save -camera-back emulated')).not.toThrow();
    expect(() => validator.checkEmulatorOptions('-skin 1080x1920')).not.toThrow();
    expect(() => validator.checkEmulatorOptions('-prop name=value')).not.toThrow();
    expect(() => validator.checkEmulatorOptions('-feature -Vulkan,-GLDirectMem')).not.toThrow();
    expect(() => validator.checkEmulatorOptions('-http-proxy http://user:pass@host:8080')).not.toThrow();
  });

  it('Rejects shell metacharacters', () => {
    expect(() => validator.checkEmulatorOptions('-no-window; whoami')).toThrow();
    expect(() => validator.checkEmulatorOptions('-no-window && whoami')).toThrow();
    expect(() => validator.checkEmulatorOptions('-no-window | cat')).toThrow();
    expect(() => validator.checkEmulatorOptions('-no-window $(whoami)')).toThrow();
    expect(() => validator.checkEmulatorOptions('-no-window `whoami`')).toThrow();
    expect(() => validator.checkEmulatorOptions(`-no-window'; whoami; echo '`)).toThrow();
    expect(() => validator.checkEmulatorOptions('-no-window > /tmp/out')).toThrow();
  });
});

describe('checkDiskSize validator tests', () => {
  it('Empty size is acceptable, means default', () => {
    const func = () => {
      validator.checkDiskSize('');
    };
    expect(func).not.toThrow();
  });

  it('Numbers means bytes', () => {
    expect(() => {
      validator.checkDiskSize('8000000000');
    }).not.toThrow();
  });

  it('Uppercase size modifier', () => {
    expect(() => {
      validator.checkDiskSize('8000000K');
    }).not.toThrow();
    expect(() => {
      validator.checkDiskSize('8000M');
    }).not.toThrow();
    expect(() => {
      validator.checkDiskSize('8G');
    }).not.toThrow();
  });

  it('Lowercase size modifier', () => {
    expect(() => {
      validator.checkDiskSize('8000000k');
    }).not.toThrow();
    expect(() => {
      validator.checkDiskSize('8000m');
    }).not.toThrow();
    expect(() => {
      validator.checkDiskSize('8g');
    }).not.toThrow();
  });

  it('Modifier without a number is unacceptable', () => {
    expect(() => {
      validator.checkDiskSize('G');
    }).toThrowError(`Unexpected disk size: 'G'.`);
  });

  it('Double modifier is unacceptable', () => {
    expect(() => {
      validator.checkDiskSize('14gg');
    }).toThrowError(`Unexpected disk size: '14gg'.`);
  });
});
