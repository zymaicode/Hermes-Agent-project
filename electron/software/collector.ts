export interface SoftwareEntry {
  id: number;
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  sizeMB: number;
}

const SIMULATED_APPS: SoftwareEntry[] = [
  {
    id: 1,
    name: 'Google Chrome',
    version: '132.0.6834.83',
    publisher: 'Google LLC',
    installDate: '2025-11-15',
    sizeMB: 1024,
  },
  {
    id: 2,
    name: 'Visual Studio Code',
    version: '1.97.0',
    publisher: 'Microsoft Corporation',
    installDate: '2025-12-02',
    sizeMB: 512,
  },
  {
    id: 3,
    name: 'Node.js',
    version: '22.13.0',
    publisher: 'OpenJS Foundation',
    installDate: '2025-10-20',
    sizeMB: 256,
  },
  {
    id: 4,
    name: 'Git',
    version: '2.47.1',
    publisher: 'Git Development Community',
    installDate: '2025-10-20',
    sizeMB: 128,
  },
  {
    id: 5,
    name: 'Steam',
    version: '2.10.91',
    publisher: 'Valve Corporation',
    installDate: '2025-09-10',
    sizeMB: 2048,
  },
  {
    id: 6,
    name: 'Docker Desktop',
    version: '4.37.1',
    publisher: 'Docker Inc.',
    installDate: '2025-11-28',
    sizeMB: 1024,
  },
  {
    id: 7,
    name: '7-Zip',
    version: '24.09',
    publisher: 'Igor Pavlov',
    installDate: '2025-09-05',
    sizeMB: 4,
  },
  {
    id: 8,
    name: 'Notepad++',
    version: '8.7.7',
    publisher: 'Don Ho',
    installDate: '2025-10-12',
    sizeMB: 32,
  },
  {
    id: 9,
    name: 'Python',
    version: '3.13.1',
    publisher: 'Python Software Foundation',
    installDate: '2025-12-15',
    sizeMB: 384,
  },
  {
    id: 10,
    name: 'Slack',
    version: '4.41.105',
    publisher: 'Slack Technologies',
    installDate: '2025-11-01',
    sizeMB: 640,
  },
  {
    id: 11,
    name: 'Mozilla Firefox',
    version: '134.0.1',
    publisher: 'Mozilla Foundation',
    installDate: '2025-12-20',
    sizeMB: 512,
  },
  {
    id: 12,
    name: 'Postman',
    version: '11.23.3',
    publisher: 'Postman Inc.',
    installDate: '2025-10-08',
    sizeMB: 384,
  },
  {
    id: 13,
    name: 'Obsidian',
    version: '1.7.4',
    publisher: 'Obsidian MD',
    installDate: '2025-09-22',
    sizeMB: 256,
  },
  {
    id: 14,
    name: 'Spotify',
    version: '1.2.53.440',
    publisher: 'Spotify AB',
    installDate: '2025-08-15',
    sizeMB: 512,
  },
  {
    id: 15,
    name: 'Microsoft Office 365',
    version: '16.0.18025',
    publisher: 'Microsoft Corporation',
    installDate: '2025-09-01',
    sizeMB: 4096,
  },
];

export class SoftwareCollector {
  getInstalledApps(): SoftwareEntry[] {
    return SIMULATED_APPS;
  }

  searchApps(query: string): SoftwareEntry[] {
    const lower = query.toLowerCase();
    return SIMULATED_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(lower) ||
        app.publisher.toLowerCase().includes(lower)
    );
  }
}
