export interface GameDetected {
  name: string;
  processName: string;
  pid: number;
  detectedAt: number;
}

// Known game process names (common patterns)
const GAME_PROCESS_NAMES = [
  'eldenring.exe', 'dota2.exe', 'csgo.exe', 'cs2.exe', 'valorant.exe',
  'leagueoflegends.exe', 'fortnite.exe', 'apexlegends.exe', 'overwatch.exe',
  'minecraft.exe', 'java.exe', 'gta5.exe', 'rdr2.exe', 'cyberpunk2077.exe',
  'starfield.exe', 'diablo4.exe', 'wow.exe', 'ffxiv_dx11.exe', 'destiny2.exe',
  'rainbowsix.exe', 'rocketleague.exe', 'warframe.exe', 'warzone.exe',
  'pathofexile.exe', 'lostark.exe', 'steam.exe', 'epicgameslauncher.exe',
  'battle.net.exe', 'xboxapp.exe', 'ubisoftconnect.exe',
];

// Services safe to suspend during gaming
export const OPTIMIZATION_SERVICES = [
  { name: 'wuauserv', display: 'Windows Update', critical: false },
  { name: 'BITS', display: 'Background Intelligent Transfer', critical: false },
  { name: 'SysMain', display: 'SysMain (Superfetch)', critical: false },
  { name: 'WSearch', display: 'Windows Search', critical: false },
  { name: 'DiagTrack', display: 'Connected User Experiences', critical: false },
  { name: 'dmwappushservice', display: 'Device Management WAP Push', critical: false },
  { name: 'WMPNetworkSvc', display: 'Windows Media Player Network', critical: false },
  { name: 'TabletInputService', display: 'Touch Keyboard and Handwriting', critical: false },
  { name: 'XblAuthManager', display: 'Xbox Live Auth Manager', critical: false },
  { name: 'XblGameSave', display: 'Xbox Live Game Save', critical: false },
  { name: 'XboxNetApiSvc', display: 'Xbox Live Networking', critical: false },
  { name: 'stisvc', display: 'Windows Image Acquisition', critical: false },
  { name: 'MapsBroker', display: 'Windows Maps', critical: false },
  { name: 'WalletService', display: 'WalletService', critical: false },
  { name: 'OneSyncSvc', display: 'Sync Host', critical: false },
  { name: 'PcaSvc', display: 'Program Compatibility Assistant', critical: false },
  { name: 'WFDSConMgrSvc', display: 'Wi-Fi Direct', critical: false },
  { name: 'WlanSvc', display: 'WLAN AutoConfig', critical: false },
];

// Processes to safely terminate during gaming
export const OPTIMIZATION_PROCESSES = [
  'chrome.exe', 'msedge.exe', 'firefox.exe', 'brave.exe',
  'slack.exe', 'discord.exe', 'telegram.exe', 'whatsapp.exe',
  'outlook.exe', 'winword.exe', 'excel.exe', 'powerpnt.exe',
  'code.exe', 'cursor.exe', 'notepad++.exe',
  'spotify.exe', 'browser.exe', 'onenote.exe',
  'skype.exe', 'zoom.exe', 'teams.exe',
];

export function detectGames(processes: Array<{ name: string; pid: number; path?: string }>): GameDetected[] {
  const games: GameDetected[] = [];
  for (const proc of processes) {
    const name = proc.name.toLowerCase();
    if (GAME_PROCESS_NAMES.includes(name)) {
      games.push({
        name: proc.name.replace(/\.exe$/i, ''),
        processName: proc.name,
        pid: proc.pid,
        detectedAt: Date.now(),
      });
    }
  }
  return games;
}
