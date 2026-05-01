export interface ScheduledTask {
  name: string;
  path: string;
  status: 'ready' | 'running' | 'disabled';
  triggers: string[];
  nextRun: string | null;
  lastRun: string | null;
  lastResult: 'success' | 'failure' | 'no_info';
  author: string;
  created: string;
  description: string;
  actions: string[];
}

const TASKS: ScheduledTask[] = [
  { name: 'Windows Update Scheduled Scan', path: '\\Microsoft\\Windows\\WindowsUpdate\\Scheduled Start', status: 'ready', triggers: ['At 3:00 AM every day'], nextRun: '2026-05-02 03:00:00', lastRun: '2026-05-01 03:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Scans for available Windows updates and downloads them automatically.', actions: ['C:\\Windows\\System32\\UsoClient.exe StartScan'] },
  { name: 'Windows Defender Scheduled Scan', path: '\\Microsoft\\Windows\\Windows Defender\\Windows Defender Scheduled Scan', status: 'ready', triggers: ['At 2:00 AM every Sunday'], nextRun: '2026-05-03 02:00:00', lastRun: '2026-04-26 02:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Performs a full system scan for malware and viruses.', actions: ['C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\4.18.24090.11-0\\MpCmdRun.exe Scan -ScheduleJob'] },
  { name: 'Disk Cleanup', path: '\\Microsoft\\Windows\\DiskCleanup\\SilentCleanup', status: 'ready', triggers: ['At 1:00 AM every day'], nextRun: '2026-05-02 01:00:00', lastRun: '2026-05-01 01:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Automatically cleans temporary files and empties recycle bin.', actions: ['C:\\Windows\\System32\\cleanmgr.exe /autoclean /d C:'] },
  { name: 'System Restore Point Creation', path: '\\Microsoft\\Windows\\SystemRestore\\SR', status: 'ready', triggers: ['At system startup', 'At 12:00 AM every day'], nextRun: '2026-05-02 00:00:00', lastRun: '2026-05-01 00:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Creates a system restore point for recovery purposes.', actions: ['C:\\Windows\\System32\\srtasks.exe ExecuteScheduledSPPCreation'] },
  { name: 'Idle Maintenance', path: '\\Microsoft\\Windows\\Maintenance\\WinSAT', status: 'ready', triggers: ['When computer is idle for 10 minutes'], nextRun: 'On idle', lastRun: '2026-05-01 14:30:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Runs system maintenance tasks when the computer is idle.', actions: ['C:\\Windows\\System32\\msfeedssync.exe sync'] },
  { name: 'User Feed Synchronization', path: '\\Microsoft\\Windows\\Feeds\\FeedsSync', status: 'ready', triggers: ['At logon', 'Every 12 hours'], nextRun: '2026-05-01 22:30:00', lastRun: '2026-05-01 10:30:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Synchronizes RSS feeds and web content.', actions: ['C:\\Windows\\System32\\msfeedssync.exe sync'] },
  { name: 'Google Update TaskMachineCore', path: '\\Google\\GoogleUpdate\\GoogleUpdateTaskMachineCore', status: 'ready', triggers: ['Every 1 hour'], nextRun: '2026-05-01 13:15:00', lastRun: '2026-05-01 12:15:00', lastResult: 'success', author: 'Google Inc.', created: '2026-01-10 09:00:00', description: 'Checks for Google Chrome updates and installs them.', actions: ['C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe /c'] },
  { name: 'Google Update TaskMachineUA', path: '\\Google\\GoogleUpdate\\GoogleUpdateTaskMachineUA', status: 'ready', triggers: ['Every 1 hour'], nextRun: '2026-05-01 13:25:00', lastRun: '2026-05-01 12:25:00', lastResult: 'success', author: 'Google Inc.', created: '2026-01-10 09:00:00', description: 'Checks for Google user application updates.', actions: ['C:\\Program Files (x86)\\Google\\Update\\GoogleUpdate.exe /ua'] },
  { name: 'Adobe Acrobat Update Task', path: '\\Adobe\\Adobe Acrobat\\Adobe Acrobat Update Task', status: 'ready', triggers: ['At logon', 'Every 4 hours'], nextRun: '2026-05-01 15:30:00', lastRun: '2026-05-01 11:30:00', lastResult: 'success', author: 'Adobe Inc.', created: '2026-02-20 14:00:00', description: 'Checks for Adobe Acrobat Reader updates.', actions: ['C:\\Program Files (x86)\\Common Files\\Adobe\\ARM\\1.0\\AdobeARM.exe'] },
  { name: 'Adobe Flash Player Updater', path: '\\Adobe\\Flash Player\\Adobe Flash Player Updater', status: 'disabled', triggers: ['Every 1 hour'], nextRun: null, lastRun: '2026-03-15 08:00:00', lastResult: 'no_info', author: 'Adobe Inc.', created: '2025-11-15 15:00:00', description: 'Checks for Adobe Flash Player updates. Flash Player is end-of-life.', actions: ['C:\\Windows\\SysWOW64\\Macromed\\Flash\\FlashUtil32_32_0_0_465_pepper.exe -update pepperplugin'] },
  { name: 'OneDrive Standalone Update Task', path: '\\Microsoft\\OneDrive\\OneDrive Standalone Update Task', status: 'ready', triggers: ['At logon', 'Every 2 hours'], nextRun: '2026-05-01 13:00:00', lastRun: '2026-05-01 11:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:40:00', description: 'Updates OneDrive standalone client silently.', actions: ['%localappdata%\\Microsoft\\OneDrive\\OneDriveStandaloneUpdater.exe'] },
  { name: 'NVIDIA GeForce Experience Update', path: '\\NVIDIA\\NvDriverUpdateCheckDaily_{B2FE1952-0186-46C3-BAEC-A80AA35AC5B8}', status: 'ready', triggers: ['At 10:00 AM every day'], nextRun: '2026-05-02 10:00:00', lastRun: '2026-05-01 10:00:00', lastResult: 'success', author: 'NVIDIA Corporation', created: '2026-01-05 11:00:00', description: 'Checks daily for NVIDIA driver updates.', actions: ['C:\\Program Files\\NVIDIA Corporation\\NvContainer\\nvcontainer.exe -d "C:\\Program Files\\NVIDIA Corporation\\NvDriverUpdateCheck"'] },
  { name: 'NVIDIA Profile Update', path: '\\NVIDIA\\NvProfileUpdaterDaily_{B2FE1952-0186-46C3-BAEC-A80AA35AC5B8}', status: 'ready', triggers: ['At 10:15 AM every day'], nextRun: '2026-05-02 10:15:00', lastRun: '2026-05-01 10:15:00', lastResult: 'success', author: 'NVIDIA Corporation', created: '2026-01-05 11:00:00', description: 'Updates NVIDIA game profile settings.', actions: ['C:\\Program Files\\NVIDIA Corporation\\NvContainer\\nvcontainer.exe -d "C:\\Program Files\\NVIDIA Corporation\\NvProfileUpdaterDaily"'] },
  { name: 'Mozilla Firefox Default Browser Agent', path: '\\Mozilla\\Firefox Default Browser Agent 308046B0AF4A39CB', status: 'ready', triggers: ['Every 7 hours'], nextRun: '2026-05-01 18:00:00', lastRun: '2026-05-01 11:00:00', lastResult: 'success', author: 'Mozilla Corporation', created: '2026-03-01 16:00:00', description: 'Checks if Firefox is the default browser.', actions: ['C:\\Program Files\\Mozilla Firefox\\default-browser-agent.exe'] },
  { name: 'Mozilla Firefox Background Update', path: '\\Mozilla\\Firefox Background Update 308046B0AF4A39CB', status: 'ready', triggers: ['Every 7 hours'], nextRun: '2026-05-01 18:15:00', lastRun: '2026-05-01 11:15:00', lastResult: 'success', author: 'Mozilla Corporation', created: '2026-03-01 16:00:00', description: 'Downloads and stages Firefox updates in the background.', actions: ['C:\\Program Files\\Mozilla Firefox\\firefox.exe --backgroundtask backgroundupdate'] },
  { name: 'Chrome Cleanup Computer', path: '\\Google\\Chrome Cleanup\\ChromeCleanupComputer', status: 'ready', triggers: ['At 10:30 AM every day'], nextRun: '2026-05-02 10:30:00', lastRun: '2026-05-01 10:30:00', lastResult: 'success', author: 'Google Inc.', created: '2026-01-10 09:05:00', description: 'Runs Chrome cleanup tool to check for unwanted software.', actions: ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe --cleanup'] },
  { name: 'Visual Studio Code Update Check', path: '\\Microsoft\\Visual Studio Code\\UpdateCheck', status: 'ready', triggers: ['At logon', 'Every 8 hours'], nextRun: '2026-05-01 16:00:00', lastRun: '2026-05-01 08:15:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2026-02-05 10:00:00', description: 'Checks for Visual Studio Code updates.', actions: ['C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe --update-check'] },
  { name: 'Discord Update', path: '\\Discord\\DiscordUpdate', status: 'ready', triggers: ['At logon', 'Every 3 hours'], nextRun: '2026-05-01 14:30:00', lastRun: '2026-05-01 11:30:00', lastResult: 'success', author: 'Discord Inc.', created: '2026-03-15 12:00:00', description: 'Checks for Discord updates and installs them in the background.', actions: ['C:\\Users\\User\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe'] },
  { name: 'Spotify Update', path: '\\Spotify\\SpotifyUpdate', status: 'disabled', triggers: ['At logon'], nextRun: null, lastRun: '2026-04-15 09:00:00', lastResult: 'failure', author: 'Spotify AB', created: '2026-03-20 08:00:00', description: 'Checks for Spotify updates. Disabled due to repeated failures.', actions: ['C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe --check-update'] },
  { name: 'WSL Update Check', path: '\\Microsoft\\WSL\\WSL Update Check', status: 'ready', triggers: ['At 4:00 AM every day'], nextRun: '2026-05-02 04:00:00', lastRun: '2026-05-01 04:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2026-04-01 10:00:00', description: 'Checks for Windows Subsystem for Linux updates.', actions: ['C:\\Program Files\\WSL\\wsl.exe --update'] },
  { name: 'Thunderbird Background Update', path: '\\Mozilla\\Thunderbird Background Update', status: 'disabled', triggers: ['Every 12 hours'], nextRun: null, lastRun: '2026-04-20 06:00:00', lastResult: 'no_info', author: 'Mozilla Corporation', created: '2026-04-10 09:00:00', description: 'Checks for Thunderbird updates. Disabled by user.', actions: ['C:\\Program Files\\Mozilla Thunderbird\\thunderbird.exe --backgroundtask backgroundupdate'] },
  { name: 'Steam Update Check', path: '\\Valve\\Steam\\Steam Update Check', status: 'ready', triggers: ['At logon', 'Every 2 hours'], nextRun: '2026-05-01 14:00:00', lastRun: '2026-05-01 12:00:00', lastResult: 'success', author: 'Valve Corporation', created: '2026-03-10 15:00:00', description: 'Checks for Steam client updates and downloads game updates.', actions: ['C:\\Program Files (x86)\\Steam\\steam.exe -silent'] },
  { name: 'Office Automatic Update 2.0', path: '\\Microsoft\\Office\\Office Automatic Updates 2.0', status: 'ready', triggers: ['Every 1 day at 2:30 AM'], nextRun: '2026-05-02 02:30:00', lastRun: '2026-05-01 02:30:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2026-02-01 09:00:00', description: 'Checks for Microsoft Office updates.', actions: ['C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeC2RClient.exe /update'] },
  { name: 'Device User Manager', path: '\\Microsoft\\Windows\\DeviceDirectoryClient\\HandleWnsCommand', status: 'ready', triggers: ['At logon'], nextRun: 'On next logon', lastRun: '2026-05-01 08:15:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Handles Windows Notification Service commands for device management.', actions: ['C:\\Windows\\System32\\deviceenroller.exe'] },
  { name: 'Explorer Grace Period Licensing', path: '\\Microsoft\\Windows\\License Manager\\Windows Licensing Grace Period Task', status: 'ready', triggers: ['At system startup'], nextRun: 'On next startup', lastRun: '2026-05-01 08:15:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Checks Windows licensing status.', actions: ['C:\\Windows\\System32\\sppcext.dll,SppGracePeriodLicenseRenewal'] },
  { name: 'IndexerAutomaticMaintenance', path: '\\Microsoft\\Windows\\Shell\\IndexerAutomaticMaintenance', status: 'running', triggers: ['When computer is idle for 5 minutes'], nextRun: 'On idle', lastRun: '2026-05-01 14:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Defragments and optimizes the Windows Search index.', actions: ['C:\\Windows\\System32\\SearchIndexer.exe'] },
  { name: 'OBS Studio Update Check', path: '\\OBS Studio\\OBSUpdateCheck', status: 'disabled', triggers: ['At logon'], nextRun: null, lastRun: '2026-04-01 12:00:00', lastResult: 'no_info', author: 'OBS Project', created: '2026-04-01 12:00:00', description: 'Checks for OBS Studio updates. Disabled by user.', actions: ['C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe --check-updates'] },
  { name: 'Node.js NPM Cache Cleanup', path: '\\Node.js\\NPM Cache Cleanup', status: 'ready', triggers: ['Every 7 days at 3:30 AM'], nextRun: '2026-05-08 03:30:00', lastRun: '2026-05-01 03:30:00', lastResult: 'success', author: 'OpenJS Foundation', created: '2026-04-20 15:00:00', description: 'Cleans old npm cache files to free disk space.', actions: ['C:\\Program Files\\nodejs\\npm.cmd cache clean --force'] },
  { name: 'AppListBackup', path: '\\Microsoft\\Windows\\AppListBackup\\AppListBackup', status: 'ready', triggers: ['At 6:00 PM every day'], nextRun: '2026-05-01 18:00:00', lastRun: '2026-04-30 18:00:00', lastResult: 'success', author: 'Microsoft Corporation', created: '2025-11-15 14:35:00', description: 'Backs up the list of installed Windows apps.', actions: ['C:\\Windows\\System32\\schtasks.exe /Run /TN "\\Microsoft\\Windows\\AppListBackup\\AppListBackup"'] },
];

export class SchedulerReader {
  getScheduledTasks(): ScheduledTask[] {
    return TASKS;
  }

  getTaskDetail(name: string): (ScheduledTask & { conditions: string[]; settings: string[] }) | null {
    const task = TASKS.find((t) => t.name === name);
    if (!task) return null;
    return {
      ...task,
      conditions: [
        'Start only if the following network connection is available: Any connection',
        'Start the task only if the computer is on AC power',
        'Stop if the computer switches to battery power',
        'Wake the computer to run this task',
      ],
      settings: [
        'Allow task to be run on demand',
        'Run task as soon as possible after a scheduled start is missed',
        'If the task fails, restart every 10 minutes up to 3 times',
        'Stop the task if it runs longer than 1 hour',
        'If the running task does not end when requested, force it to stop',
      ],
    };
  }
}
