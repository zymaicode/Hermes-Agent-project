export interface RegistryValue {
  name: string;
  type: 'REG_SZ' | 'REG_DWORD' | 'REG_QWORD' | 'REG_BINARY' | 'REG_MULTI_SZ' | 'REG_EXPAND_SZ';
  data: string;
  dataSize: number;
}

export interface RegistryKey {
  name: string;
  path: string;
  hive: 'HKEY_CLASSES_ROOT' | 'HKEY_CURRENT_USER' | 'HKEY_LOCAL_MACHINE' | 'HKEY_USERS' | 'HKEY_CURRENT_CONFIG';
  subkeys: number;
  values: RegistryValue[];
  lastModified: string;
}

export interface RegistrySearchResult {
  key: string;
  matchType: 'key_name' | 'value_name' | 'value_data';
  value?: string;
}

interface TreeNode {
  name: string;
  path: string;
  hive: RegistryKey['hive'];
  children: Record<string, TreeNode>;
}

function genValues(): RegistryValue[] {
  return [
    { name: '(Default)', type: 'REG_SZ', data: '(value not set)', dataSize: 0 },
    { name: 'DisplayName', type: 'REG_SZ', data: 'Windows Service Application', dataSize: 28 },
    { name: 'Version', type: 'REG_SZ', data: '10.0.19041.1', dataSize: 12 },
    { name: 'Start', type: 'REG_DWORD', data: String(Math.floor(Math.random() * 4) + 1), dataSize: 4 },
    { name: 'ImagePath', type: 'REG_EXPAND_SZ', data: '%SystemRoot%\\system32\\svchost.exe -k netsvcs', dataSize: 48 },
    { name: 'InstallDate', type: 'REG_SZ', data: '2024-06-15T10:30:00Z', dataSize: 20 },
    { name: 'ErrorControl', type: 'REG_DWORD', data: '1', dataSize: 4 },
    { name: 'Type', type: 'REG_DWORD', data: String(Math.floor(Math.random() * 32) + 16), dataSize: 4 },
    { name: 'ObjectName', type: 'REG_SZ', data: 'LocalSystem', dataSize: 11 },
    { name: 'FailureActions', type: 'REG_BINARY', data: '00 00 00 00 00 00 00 00 00 00 00 00 03 00 00 00 ...', dataSize: 32 },
  ];
}

function makeFakeDate(): string {
  const d = new Date(Date.now() - Math.random() * 31536000000 * 2);
  return d.toISOString();
}

export class RegistryViewer {
  private tree: Record<string, TreeNode> = {};

  constructor() {
    this.buildTree();
  }

  private buildTree(): void {
    this.tree = {
      'HKEY_CLASSES_ROOT': {
        name: 'HKEY_CLASSES_ROOT',
        path: 'HKEY_CLASSES_ROOT',
        hive: 'HKEY_CLASSES_ROOT',
        children: {
          '*': { name: '*', path: 'HKEY_CLASSES_ROOT\\*', hive: 'HKEY_CLASSES_ROOT', children: {
            shell: { name: 'shell', path: 'HKEY_CLASSES_ROOT\\*\\shell', hive: 'HKEY_CLASSES_ROOT', children: {} },
          }},
          Directory: { name: 'Directory', path: 'HKEY_CLASSES_ROOT\\Directory', hive: 'HKEY_CLASSES_ROOT', children: {
            Background: { name: 'Background', path: 'HKEY_CLASSES_ROOT\\Directory\\Background', hive: 'HKEY_CLASSES_ROOT', children: {
              shell: { name: 'shell', path: 'HKEY_CLASSES_ROOT\\Directory\\Background\\shell', hive: 'HKEY_CLASSES_ROOT', children: {} },
            }},
          }},
          '.txt': { name: '.txt', path: 'HKEY_CLASSES_ROOT\\.txt', hive: 'HKEY_CLASSES_ROOT', children: {} },
          '.exe': { name: '.exe', path: 'HKEY_CLASSES_ROOT\\.exe', hive: 'HKEY_CLASSES_ROOT', children: {} },
          'http': { name: 'http', path: 'HKEY_CLASSES_ROOT\\http', hive: 'HKEY_CLASSES_ROOT', children: {
            shell: { name: 'shell', path: 'HKEY_CLASSES_ROOT\\http\\shell', hive: 'HKEY_CLASSES_ROOT', children: {
              open: { name: 'open', path: 'HKEY_CLASSES_ROOT\\http\\shell\\open', hive: 'HKEY_CLASSES_ROOT', children: {
                command: { name: 'command', path: 'HKEY_CLASSES_ROOT\\http\\shell\\open\\command', hive: 'HKEY_CLASSES_ROOT', children: {} },
              }},
            }},
          }},
        },
      },

      'HKEY_CURRENT_USER': {
        name: 'HKEY_CURRENT_USER',
        path: 'HKEY_CURRENT_USER',
        hive: 'HKEY_CURRENT_USER',
        children: {
          Software: { name: 'Software', path: 'HKEY_CURRENT_USER\\Software', hive: 'HKEY_CURRENT_USER', children: {
            Microsoft: { name: 'Microsoft', path: 'HKEY_CURRENT_USER\\Software\\Microsoft', hive: 'HKEY_CURRENT_USER', children: {
              Windows: { name: 'Windows', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows', hive: 'HKEY_CURRENT_USER', children: {
                'CurrentVersion': { name: 'CurrentVersion', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion', hive: 'HKEY_CURRENT_USER', children: {
                  Explorer: { name: 'Explorer', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer', hive: 'HKEY_CURRENT_USER', children: {
                    Advanced: { name: 'Advanced', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', hive: 'HKEY_CURRENT_USER', children: {} },
                    UserAssist: { name: 'UserAssist', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\UserAssist', hive: 'HKEY_CURRENT_USER', children: {} },
                  }},
                  Run: { name: 'Run', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', hive: 'HKEY_CURRENT_USER', children: {} },
                  'Internet Settings': { name: 'Internet Settings', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', hive: 'HKEY_CURRENT_USER', children: {} },
                }},
              }},
              Office: { name: 'Office', path: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Office', hive: 'HKEY_CURRENT_USER', children: {} },
            }},
            Google: { name: 'Google', path: 'HKEY_CURRENT_USER\\Software\\Google', hive: 'HKEY_CURRENT_USER', children: {
              Chrome: { name: 'Chrome', path: 'HKEY_CURRENT_USER\\Software\\Google\\Chrome', hive: 'HKEY_CURRENT_USER', children: {} },
            }},
            '7-Zip': { name: '7-Zip', path: 'HKEY_CURRENT_USER\\Software\\7-Zip', hive: 'HKEY_CURRENT_USER', children: {} },
          }},
          'Control Panel': { name: 'Control Panel', path: 'HKEY_CURRENT_USER\\Control Panel', hive: 'HKEY_CURRENT_USER', children: {
            Desktop: { name: 'Desktop', path: 'HKEY_CURRENT_USER\\Control Panel\\Desktop', hive: 'HKEY_CURRENT_USER', children: {} },
            Accessibility: { name: 'Accessibility', path: 'HKEY_CURRENT_USER\\Control Panel\\Accessibility', hive: 'HKEY_CURRENT_USER', children: {} },
          }},
          'Environment': { name: 'Environment', path: 'HKEY_CURRENT_USER\\Environment', hive: 'HKEY_CURRENT_USER', children: {} },
        },
      },

      'HKEY_LOCAL_MACHINE': {
        name: 'HKEY_LOCAL_MACHINE',
        path: 'HKEY_LOCAL_MACHINE',
        hive: 'HKEY_LOCAL_MACHINE',
        children: {
          HARDWARE: { name: 'HARDWARE', path: 'HKLM\\HARDWARE', hive: 'HKEY_LOCAL_MACHINE', children: {
            DESCRIPTION: { name: 'DESCRIPTION', path: 'HKLM\\HARDWARE\\DESCRIPTION', hive: 'HKEY_LOCAL_MACHINE', children: {
              System: { name: 'System', path: 'HKLM\\HARDWARE\\DESCRIPTION\\System', hive: 'HKEY_LOCAL_MACHINE', children: {} },
            }},
          }},
          SOFTWARE: { name: 'SOFTWARE', path: 'HKLM\\SOFTWARE', hive: 'HKEY_LOCAL_MACHINE', children: {
            Microsoft: { name: 'Microsoft', path: 'HKLM\\SOFTWARE\\Microsoft', hive: 'HKEY_LOCAL_MACHINE', children: {
              Windows: { name: 'Windows', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows', hive: 'HKEY_LOCAL_MACHINE', children: {
                'CurrentVersion': { name: 'CurrentVersion', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion', hive: 'HKEY_LOCAL_MACHINE', children: {
                  Run: { name: 'Run', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                  Uninstall: { name: 'Uninstall', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                  Policies: { name: 'Policies', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies', hive: 'HKEY_LOCAL_MACHINE', children: {
                    System: { name: 'System', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                  }},
                  Explorer: { name: 'Explorer', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                }},
                'Windows NT': { name: 'Windows NT', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT', hive: 'HKEY_LOCAL_MACHINE', children: {
                  CurrentVersion: { name: 'CurrentVersion', path: 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                }},
              }},
              '.NETFramework': { name: '.NETFramework', path: 'HKLM\\SOFTWARE\\Microsoft\\.NETFramework', hive: 'HKEY_LOCAL_MACHINE', children: {} },
            }},
            NVIDIA: { name: 'NVIDIA', path: 'HKLM\\SOFTWARE\\NVIDIA', hive: 'HKEY_LOCAL_MACHINE', children: {
              Corporation: { name: 'Corporation', path: 'HKLM\\SOFTWARE\\NVIDIA\\Corporation', hive: 'HKEY_LOCAL_MACHINE', children: {} },
            }},
          }},
          SYSTEM: { name: 'SYSTEM', path: 'HKLM\\SYSTEM', hive: 'HKEY_LOCAL_MACHINE', children: {
            CurrentControlSet: { name: 'CurrentControlSet', path: 'HKLM\\SYSTEM\\CurrentControlSet', hive: 'HKEY_LOCAL_MACHINE', children: {
              Services: { name: 'Services', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services', hive: 'HKEY_LOCAL_MACHINE', children: {
                Tcpip: { name: 'Tcpip', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip', hive: 'HKEY_LOCAL_MACHINE', children: {
                  Parameters: { name: 'Parameters', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                }},
                W32Time: { name: 'W32Time', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\W32Time', hive: 'HKEY_LOCAL_MACHINE', children: {} },
              }},
              Control: { name: 'Control', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control', hive: 'HKEY_LOCAL_MACHINE', children: {
                SessionManager: { name: 'Session Manager', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager', hive: 'HKEY_LOCAL_MACHINE', children: {} },
                TerminalServer: { name: 'Terminal Server', path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server', hive: 'HKEY_LOCAL_MACHINE', children: {} },
              }},
            }},
          }},
        },
      },

      'HKEY_USERS': {
        name: 'HKEY_USERS',
        path: 'HKEY_USERS',
        hive: 'HKEY_USERS',
        children: {
          '.DEFAULT': { name: '.DEFAULT', path: 'HKEY_USERS\\.DEFAULT', hive: 'HKEY_USERS', children: {
            'Control Panel': { name: 'Control Panel', path: 'HKEY_USERS\\.DEFAULT\\Control Panel', hive: 'HKEY_USERS', children: {} },
            Keyboard: { name: 'Keyboard', path: 'HKEY_USERS\\.DEFAULT\\Keyboard', hive: 'HKEY_USERS', children: {} },
          }},
          'S-1-5-21-XXXX': { name: 'S-1-5-21-XXXX', path: 'HKEY_USERS\\S-1-5-21-XXXX', hive: 'HKEY_USERS', children: {
            Software: { name: 'Software', path: 'HKEY_USERS\\S-1-5-21-XXXX\\Software', hive: 'HKEY_USERS', children: {} },
          }},
        },
      },

      'HKEY_CURRENT_CONFIG': {
        name: 'HKEY_CURRENT_CONFIG',
        path: 'HKEY_CURRENT_CONFIG',
        hive: 'HKEY_CURRENT_CONFIG',
        children: {
          Software: { name: 'Software', path: 'HKEY_CURRENT_CONFIG\\Software', hive: 'HKEY_CURRENT_CONFIG', children: {
            Fonts: { name: 'Fonts', path: 'HKEY_CURRENT_CONFIG\\Software\\Fonts', hive: 'HKEY_CURRENT_CONFIG', children: {} },
            Microsoft: { name: 'Microsoft', path: 'HKEY_CURRENT_CONFIG\\Software\\Microsoft', hive: 'HKEY_CURRENT_CONFIG', children: {} },
          }},
          System: { name: 'System', path: 'HKEY_CURRENT_CONFIG\\System', hive: 'HKEY_CURRENT_CONFIG', children: {
            CurrentControlSet: { name: 'CurrentControlSet', path: 'HKEY_CURRENT_CONFIG\\System\\CurrentControlSet', hive: 'HKEY_CURRENT_CONFIG', children: {} },
          }},
        },
      },
    };
  }

  getRootKeys(): RegistryKey[] {
    return Object.values(this.tree).map((t) => ({
      name: t.name,
      path: t.path,
      hive: t.hive,
      subkeys: Object.keys(t.children).length,
      values: [],
      lastModified: makeFakeDate(),
    }));
  }

  getKey(path: string): RegistryKey {
    const node = this.findNode(path);
    if (!node) {
      return { name: path.split('\\').pop() || '', path, hive: 'HKEY_LOCAL_MACHINE', subkeys: 0, values: [], lastModified: makeFakeDate() };
    }
    return {
      name: node.name,
      path: node.path,
      hive: node.hive,
      subkeys: Object.keys(node.children).length,
      values: genValues().slice(0, Math.floor(Math.random() * 5) + 5),
      lastModified: makeFakeDate(),
    };
  }

  getSubKeys(path: string): string[] {
    const node = this.findNode(path);
    if (!node) return [];
    return Object.keys(node.children);
  }

  navigate(path: string): { key: RegistryKey; subkeys: string[]; parent: string | null } {
    const key = this.getKey(path);
    const subkeys = this.getSubKeys(path);
    const parts = path.replace(/^HKLM\\/i, 'HKEY_LOCAL_MACHINE\\').split('\\');
    parts.pop();
    const parent = parts.length > 0 ? parts.join('\\') : null;
    return { key, subkeys, parent };
  }

  search(query: string, scope?: string): RegistrySearchResult[] {
    const results: RegistrySearchResult[] = [];
    const lower = query.toLowerCase();

    const searchNode = (node: TreeNode): void => {
      if (scope && node.path !== scope && !node.path.startsWith(scope + '\\')) return;
      if (node.path.length > 6) { // skip root entries
        if (node.name.toLowerCase().includes(lower)) {
          results.push({ key: node.path, matchType: 'key_name' });
        }
      }
      for (const child of Object.values(node.children)) {
        searchNode(child);
      }
    };

    for (const root of Object.values(this.tree)) {
      searchNode(root);
    }

    // Add some value matches for realism
    if (results.length < 20) {
      const samplePaths = [
        'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
        'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
        'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
        'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters',
      ];
      for (const p of samplePaths) {
        if (p.toLowerCase().includes(lower)) {
          results.push({ key: p, matchType: 'value_name', value: 'DisplayName' });
        }
      }
    }

    return results.slice(0, 50);
  }

  getFavorites(): string[] {
    return [
      'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
      'HKLM\\SYSTEM\\CurrentControlSet\\Services',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
      'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion',
      'HKLM\\HARDWARE\\DESCRIPTION\\System',
      'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
      'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
      'HKEY_CLASSES_ROOT\\http\\shell\\open\\command',
    ];
  }

  private findNode(path: string): TreeNode | null {
    const normalized = path.replace(/^HKLM\\/i, 'HKEY_LOCAL_MACHINE\\').replace(/^HKCU\\/i, 'HKEY_CURRENT_USER\\');
    const parts = normalized.split('\\');
    let current: Record<string, TreeNode> | undefined = this.tree;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current) return null;
      const node: TreeNode | undefined = current[part];
      if (!node) return null;
      if (i === parts.length - 1) return node;
      current = node.children;
    }
    return null;
  }
}
