import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface AppEntry {
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: number;
  installPath: string;
  uninstallString: string;
  isSelected: boolean;
}

export interface UninstallResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface AppDetails extends AppEntry {
  category: string;
  description: string;
  dependencies: string[];
}

const SIMULATED_APPS: AppEntry[] = [
  { name: 'Google Chrome', version: '125.0.6422.141', publisher: 'Google LLC', installDate: '2026-04-15', size: 420, installPath: 'C:\\Program Files\\Google\\Chrome\\Application', uninstallString: 'C:\\Program Files\\Google\\Chrome\\Application\\125.0.6422.141\\Installer\\setup.exe --uninstall --force-uninstall', isSelected: false },
  { name: 'Visual Studio Code', version: '1.94.2', publisher: 'Microsoft Corporation', installDate: '2026-03-28', size: 380, installPath: 'C:\\Program Files\\Microsoft VS Code', uninstallString: 'C:\\Program Files\\Microsoft VS Code\\unins000.exe /VERYSILENT', isSelected: false },
  { name: 'Node.js', version: '20.11.0', publisher: 'OpenJS Foundation', installDate: '2026-02-10', size: 85, installPath: 'C:\\Program Files\\nodejs', uninstallString: 'C:\\Program Files\\nodejs\\unins000.exe /VERYSILENT', isSelected: false },
  { name: 'Python 3.12', version: '3.12.3', publisher: 'Python Software Foundation', installDate: '2026-04-20', size: 150, installPath: 'C:\\Python312', uninstallString: 'C:\\Python312\\python-3.12.3-amd64.exe /uninstall /quiet', isSelected: false },
  { name: '7-Zip', version: '24.07', publisher: 'Igor Pavlov', installDate: '2026-01-05', size: 5, installPath: 'C:\\Program Files\\7-Zip', uninstallString: 'C:\\Program Files\\7-Zip\\Uninstall.exe /S', isSelected: false },
  { name: 'Git for Windows', version: '2.45.1', publisher: 'Git Development Team', installDate: '2026-04-01', size: 260, installPath: 'C:\\Program Files\\Git', uninstallString: 'C:\\Program Files\\Git\\unins000.exe /VERYSILENT', isSelected: false },
  { name: 'Docker Desktop', version: '4.32.0', publisher: 'Docker Inc.', installDate: '2026-03-15', size: 2800, installPath: 'C:\\Program Files\\Docker\\Docker', uninstallString: 'C:\\Program Files\\Docker\\Docker\\Docker Desktop Installer.exe uninstall --quiet', isSelected: false },
  { name: 'Notepad++', version: '8.6.9', publisher: 'Notepad++ Team', installDate: '2026-02-22', size: 12, installPath: 'C:\\Program Files\\Notepad++', uninstallString: 'C:\\Program Files\\Notepad++\\uninstall.exe /S', isSelected: false },
  { name: 'Discord', version: '1.0.9032', publisher: 'Discord Inc.', installDate: '2026-04-25', size: 180, installPath: 'C:\\Users\\Admin\\AppData\\Local\\Discord', uninstallString: 'C:\\Users\\Admin\\AppData\\Local\\Discord\\Update.exe --uninstall /S', isSelected: false },
  { name: 'Steam', version: 'r17091612', publisher: 'Valve Corporation', installDate: '2025-11-30', size: 560, installPath: 'C:\\Program Files (x86)\\Steam', uninstallString: 'C:\\Program Files (x86)\\Steam\\uninstall.exe /S', isSelected: false },
  { name: 'MSI Afterburner', version: '4.6.5', publisher: 'MSI', installDate: '2026-01-18', size: 45, installPath: 'C:\\Program Files (x86)\\MSI Afterburner', uninstallString: 'C:\\Program Files (x86)\\MSI Afterburner\\unins000.exe /VERYSILENT', isSelected: false },
  { name: 'CPU-Z', version: '2.11', publisher: 'CPUID', installDate: '2026-04-10', size: 8, installPath: 'C:\\Program Files\\CPUID\\CPU-Z', uninstallString: 'C:\\Program Files\\CPUID\\CPU-Z\\unins000.exe /VERYSILENT', isSelected: false },
  { name: 'Zoom', version: '6.1.5', publisher: 'Zoom Video Communications', installDate: '2026-03-05', size: 95, installPath: 'C:\\Users\\Admin\\AppData\\Roaming\\Zoom', uninstallString: 'C:\\Users\\Admin\\AppData\\Roaming\\Zoom\\uninstall\\Installer.exe /uninstall /S', isSelected: false },
  { name: 'Slack', version: '4.39.90', publisher: 'Slack Technologies', installDate: '2026-04-12', size: 210, installPath: 'C:\\Users\\Admin\\AppData\\Local\\slack', uninstallString: 'C:\\Users\\Admin\\AppData\\Local\\slack\\Update.exe --uninstall /S', isSelected: false },
  { name: 'Postman', version: '11.10.0', publisher: 'Postman, Inc.', installDate: '2026-02-28', size: 340, installPath: 'C:\\Users\\Admin\\AppData\\Local\\Postman', uninstallString: 'C:\\Users\\Admin\\AppData\\Local\\Postman\\Update.exe --uninstall /S', isSelected: false },
  { name: 'Adobe Reader', version: '2024.002.20991', publisher: 'Adobe Inc.', installDate: '2025-12-10', size: 410, installPath: 'C:\\Program Files\\Adobe\\Acrobat Reader DC', uninstallString: 'MsiExec.exe /X{AC76BA86-7AD7-1033-7B44-A82000000003} /qn', isSelected: false },
  { name: 'Opera Browser', version: '110.0.5130.64', publisher: 'Opera Software', installDate: '2026-04-28', size: 195, installPath: 'C:\\Program Files\\Opera', uninstallString: 'C:\\Program Files\\Opera\\Launcher.exe /uninstall /S', isSelected: false },
  { name: 'BalenaEtcher', version: '1.19.21', publisher: 'Balena Inc.', installDate: '2025-08-15', size: 160, installPath: 'C:\\Program Files\\balena-etcher', uninstallString: 'C:\\Program Files\\balena-etcher\\Uninstall balenaEtcher.exe /S', isSelected: false },
  { name: 'QEMU', version: '8.2.0', publisher: 'QEMU Project', installDate: '2025-07-20', size: 620, installPath: 'C:\\Program Files\\qemu', uninstallString: 'C:\\Program Files\\qemu\\qemu-uninstall.exe /S', isSelected: false },
  { name: 'MySQL Workbench', version: '8.0.36', publisher: 'Oracle Corporation', installDate: '2026-01-25', size: 450, installPath: 'C:\\Program Files\\MySQL\\MySQL Workbench 8.0', uninstallString: 'MsiExec.exe /X{1F2E3D4C-5B6A-7890-ABCD-EF1234567890} /qn', isSelected: false },
];

const APP_CATEGORIES: Record<string, string> = {
  'Google Chrome': 'Browsers',
  'Opera Browser': 'Browsers',
  'Visual Studio Code': 'Development',
  'Node.js': 'Development',
  'Git for Windows': 'Development',
  'Python 3.12': 'Development',
  'Docker Desktop': 'Development',
  'Postman': 'Development',
  'MySQL Workbench': 'Development',
  '7-Zip': 'System',
  'CPU-Z': 'System',
  'MSI Afterburner': 'System',
  'QEMU': 'System',
  'BalenaEtcher': 'System',
  'Notepad++': 'System',
  'Steam': 'Games',
  'Discord': 'Media',
  'Slack': 'Media',
  'Zoom': 'Media',
  'Adobe Reader': 'System',
};

const APP_DETAILS: Record<string, { description: string; dependencies: string[] }> = {
  'Google Chrome': { description: 'Fast, secure, and customizable web browser from Google.', dependencies: [] },
  'Opera Browser': { description: 'Feature-rich web browser with built-in VPN and ad blocker.', dependencies: [] },
  'Visual Studio Code': { description: 'Lightweight but powerful source code editor with support for hundreds of languages.', dependencies: ['Node.js (for extensions)', 'Git (for source control)'] },
  'Node.js': { description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine for building scalable network applications.', dependencies: [] },
  'Git for Windows': { description: 'Distributed version control system designed to handle everything from small to very large projects.', dependencies: [] },
  'Python 3.12': { description: 'Interpreted, high-level general-purpose programming language with dynamic semantics.', dependencies: [] },
  'Docker Desktop': { description: 'Platform for building, sharing, and running containerized applications.', dependencies: ['WSL 2'] },
  'Postman': { description: 'API development environment for building, testing, and documenting APIs.', dependencies: [] },
  'MySQL Workbench': { description: 'Visual database design tool that integrates SQL development, administration, and database design.', dependencies: ['MySQL Server', 'Visual C++ Redistributable'] },
  '7-Zip': { description: 'Free and open-source file archiver with a high compression ratio.', dependencies: [] },
  'CPU-Z': { description: 'Freeware system profiling and monitoring tool for Windows.', dependencies: [] },
  'MSI Afterburner': { description: 'Graphics card overclocking and hardware monitoring utility.', dependencies: ['RivaTuner Statistics Server'] },
  'QEMU': { description: 'Generic and open source machine emulator and virtualizer.', dependencies: [] },
  'BalenaEtcher': { description: 'Cross-platform tool for flashing OS images to SD cards and USB drives.', dependencies: [] },
  'Notepad++': { description: 'Free source code editor and Notepad replacement that supports several languages.', dependencies: [] },
  'Steam': { description: 'Digital distribution platform for video games and software.', dependencies: [] },
  'Discord': { description: 'Voice, video, and text communication platform designed for creating communities.', dependencies: [] },
  'Slack': { description: 'Business communication platform offering persistent chat rooms organized by topic.', dependencies: [] },
  'Zoom': { description: 'Video conferencing and online meeting platform.', dependencies: [] },
  'Adobe Reader': { description: 'Industry-standard software for viewing, printing, and annotating PDF documents.', dependencies: [] },
};

export class AppManager {
  getApps(): AppEntry[] {
    return SIMULATED_APPS.map((app) => ({
      ...app,
      category: APP_CATEGORIES[app.name] || 'Other',
    }));
  }

  async uninstallApp(name: string): Promise<{ success: boolean; message: string }> {
    const app = SIMULATED_APPS.find((a) => a.name === name);
    if (!app) {
      return { success: false, message: `App "${name}" not found.` };
    }

    if (process.platform === 'win32' && app.uninstallString) {
      try {
        await execAsync(app.uninstallString, { timeout: 60000 });
        return { success: true, message: `"${name}" uninstalled successfully.` };
      } catch (err) {
        return { success: false, message: `Failed to uninstall "${name}": ${String(err)}` };
      }
    }

    // Simulated uninstall on non-Windows
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
    const success = Math.random() > 0.15;
    return success
      ? { success: true, message: `"${name}" uninstalled successfully.` }
      : { success: false, message: `Failed to uninstall "${name}": uninstaller exited with code 1603.` };
  }

  async uninstallSelected(names: string[]): Promise<UninstallResult> {
    const results: UninstallResult = { success: 0, failed: 0, errors: [] };

    for (const name of names) {
      const result = await this.uninstallApp(name);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(result.message);
      }
    }

    return results;
  }

  getAppDetails(name: string): AppDetails | null {
    const app = SIMULATED_APPS.find((a) => a.name === name);
    if (!app) return null;

    const details = APP_DETAILS[name];
    const category = APP_CATEGORIES[name] || 'Other';

    if (!details) {
      return { ...app, category, description: 'No additional details available.', dependencies: [] };
    }

    return { ...app, ...details, category };
  }
}
