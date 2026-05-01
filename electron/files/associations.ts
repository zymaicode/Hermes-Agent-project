export interface FileAssociation {
  extension: string;
  description: string;
  contentType: string;
  progId: string;
  defaultProgram: string;
  iconPath: string;
  perceivedType: string;
  isRegistered: boolean;
  hasUserChoice: boolean;
}

export interface ProtocolAssociation {
  protocol: string;
  defaultProgram: string;
  description: string;
}

const ASSOCIATIONS: FileAssociation[] = [
  // Text
  { extension: '.txt', description: 'Text Document', contentType: 'text/plain', progId: 'txtfile', defaultProgram: 'Notepad', iconPath: '%SystemRoot%\\system32\\imageres.dll,-102', perceivedType: 'text', isRegistered: true, hasUserChoice: false },
  { extension: '.md', description: 'Markdown File', contentType: 'text/markdown', progId: 'VSCode.md', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.csv', description: 'Comma Separated Values', contentType: 'text/csv', progId: 'Excel.CSV', defaultProgram: 'Microsoft Excel', iconPath: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE', perceivedType: 'document', isRegistered: true, hasUserChoice: true },
  { extension: '.json', description: 'JSON File', contentType: 'application/json', progId: 'VSCode.json', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.xml', description: 'XML Document', contentType: 'application/xml', progId: 'VSCode.xml', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.log', description: 'Log File', contentType: 'text/plain', progId: 'Applications\\notepad++.exe', defaultProgram: 'Notepad++', iconPath: 'C:\\Program Files\\Notepad++\\notepad++.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },

  // Document
  { extension: '.pdf', description: 'PDF File', contentType: 'application/pdf', progId: 'MSEdgePDF', defaultProgram: 'Microsoft Edge', iconPath: '%SystemRoot%\\SystemApps\\Microsoft.MicrosoftEdge_8wekyb3d8bbwe\\msedge.exe', perceivedType: 'document', isRegistered: true, hasUserChoice: true },
  { extension: '.docx', description: 'Microsoft Word Document', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', progId: 'Word.Document.12', defaultProgram: 'Microsoft Word', iconPath: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE', perceivedType: 'document', isRegistered: true, hasUserChoice: true },
  { extension: '.xlsx', description: 'Microsoft Excel Spreadsheet', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', progId: 'Excel.Sheet.12', defaultProgram: 'Microsoft Excel', iconPath: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE', perceivedType: 'document', isRegistered: true, hasUserChoice: true },
  { extension: '.pptx', description: 'Microsoft PowerPoint Presentation', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', progId: 'PowerPoint.Show.12', defaultProgram: 'Microsoft PowerPoint', iconPath: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE', perceivedType: 'document', isRegistered: true, hasUserChoice: true },

  // Code
  { extension: '.js', description: 'JavaScript File', contentType: 'application/javascript', progId: 'VSCode.js', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.ts', description: 'TypeScript File', contentType: 'application/typescript', progId: 'VSCode.ts', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.py', description: 'Python File', contentType: 'text/x-python', progId: 'VSCode.py', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.html', description: 'HTML Document', contentType: 'text/html', progId: 'VSCode.html', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.css', description: 'CSS Stylesheet', contentType: 'text/css', progId: 'VSCode.css', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.tsx', description: 'TypeScript React File', contentType: 'text/typescript', progId: 'VSCode.tsx', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.go', description: 'Go Source File', contentType: 'text/x-go', progId: 'VSCode.go', defaultProgram: 'Visual Studio Code', iconPath: 'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: false },

  // Image
  { extension: '.jpg', description: 'JPEG Image', contentType: 'image/jpeg', progId: 'AppX43hnxtbyypsdt1k9hk9cmkbdhnk3fm2j2', defaultProgram: 'Photos', iconPath: '%SystemRoot%\\system32\\imageres.dll,-72', perceivedType: 'image', isRegistered: true, hasUserChoice: true },
  { extension: '.png', description: 'PNG Image', contentType: 'image/png', progId: 'AppX43hnxtbyypsdt1k9hk9cmkbdhnk3fm2j2', defaultProgram: 'Photos', iconPath: '%SystemRoot%\\system32\\imageres.dll,-83', perceivedType: 'image', isRegistered: true, hasUserChoice: true },
  { extension: '.gif', description: 'GIF Image', contentType: 'image/gif', progId: 'AppX43hnxtbyypsdt1k9hk9cmkbdhnk3fm2j2', defaultProgram: 'Photos', iconPath: '%SystemRoot%\\system32\\imageres.dll,-82', perceivedType: 'image', isRegistered: true, hasUserChoice: false },
  { extension: '.bmp', description: 'Bitmap Image', contentType: 'image/bmp', progId: 'Paint.Picture', defaultProgram: 'Paint', iconPath: '%SystemRoot%\\system32\\mspaint.exe', perceivedType: 'image', isRegistered: true, hasUserChoice: false },
  { extension: '.svg', description: 'SVG Image', contentType: 'image/svg+xml', progId: 'MSEdgeHTM', defaultProgram: 'Microsoft Edge', iconPath: '%SystemRoot%\\SystemApps\\Microsoft.MicrosoftEdge_8wekyb3d8bbwe\\msedge.exe', perceivedType: 'image', isRegistered: true, hasUserChoice: true },

  // Audio
  { extension: '.mp3', description: 'MP3 Audio', contentType: 'audio/mpeg', progId: 'WMP11.AssocFile.MP3', defaultProgram: 'Windows Media Player', iconPath: '%SystemRoot%\\system32\\wmploc.dll,-731', perceivedType: 'audio', isRegistered: true, hasUserChoice: false },
  { extension: '.wav', description: 'WAV Audio', contentType: 'audio/wav', progId: 'WMP11.AssocFile.WAV', defaultProgram: 'Windows Media Player', iconPath: '%SystemRoot%\\system32\\wmploc.dll,-732', perceivedType: 'audio', isRegistered: true, hasUserChoice: false },
  { extension: '.flac', description: 'FLAC Audio', contentType: 'audio/flac', progId: 'MusicBee.FLAC', defaultProgram: 'MusicBee', iconPath: 'C:\\Program Files (x86)\\MusicBee\\MusicBee.exe', perceivedType: 'audio', isRegistered: true, hasUserChoice: true },

  // Video
  { extension: '.mp4', description: 'MP4 Video', contentType: 'video/mp4', progId: 'AppX6eg8h5sxqq90pv53845wmnbewywdqq5h', defaultProgram: 'Movies & TV', iconPath: '%SystemRoot%\\system32\\imageres.dll,-84', perceivedType: 'video', isRegistered: true, hasUserChoice: true },
  { extension: '.mkv', description: 'Matroska Video', contentType: 'video/x-matroska', progId: 'VLC.mkv', defaultProgram: 'VLC Media Player', iconPath: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', perceivedType: 'video', isRegistered: true, hasUserChoice: true },
  { extension: '.avi', description: 'AVI Video', contentType: 'video/x-msvideo', progId: 'VLC.avi', defaultProgram: 'VLC Media Player', iconPath: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', perceivedType: 'video', isRegistered: true, hasUserChoice: true },

  // Archive
  { extension: '.zip', description: 'Compressed (zipped) Folder', contentType: 'application/zip', progId: 'CompressedFolder', defaultProgram: 'File Explorer', iconPath: '%SystemRoot%\\system32\\imageres.dll,-155', perceivedType: 'document', isRegistered: true, hasUserChoice: false },
  { extension: '.rar', description: 'RAR Archive', contentType: 'application/x-rar-compressed', progId: 'WinRAR', defaultProgram: 'WinRAR', iconPath: 'C:\\Program Files\\WinRAR\\WinRAR.exe', perceivedType: 'document', isRegistered: true, hasUserChoice: true },
  { extension: '.7z', description: '7-Zip Archive', contentType: 'application/x-7z-compressed', progId: '7-Zip.7z', defaultProgram: '7-Zip File Manager', iconPath: 'C:\\Program Files\\7-Zip\\7zFM.exe', perceivedType: 'document', isRegistered: true, hasUserChoice: true },

  // Web
  { extension: '.htm', description: 'HTML Document', contentType: 'text/html', progId: 'ChromeHTML', defaultProgram: 'Google Chrome', iconPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: true },
  { extension: '.url', description: 'Internet Shortcut', contentType: 'application/internet-shortcut', progId: 'InternetShortcut', defaultProgram: 'Google Chrome', iconPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', perceivedType: 'text', isRegistered: true, hasUserChoice: false },

  // System
  { extension: '.dll', description: 'Application Extension', contentType: 'application/x-msdownload', progId: 'dllfile', defaultProgram: 'Windows Shell', iconPath: '%SystemRoot%\\system32\\imageres.dll,-71', perceivedType: 'system', isRegistered: true, hasUserChoice: false },
  { extension: '.exe', description: 'Application', contentType: 'application/x-msdownload', progId: 'exefile', defaultProgram: 'Windows Shell', iconPath: '%SystemRoot%\\system32\\imageres.dll,-12', perceivedType: 'system', isRegistered: true, hasUserChoice: false },
  { extension: '.msi', description: 'Windows Installer Package', contentType: 'application/x-msi', progId: 'Msi.Package', defaultProgram: 'Windows Installer', iconPath: '%SystemRoot%\\system32\\msiexec.exe', perceivedType: 'system', isRegistered: true, hasUserChoice: false },
];

const PROTOCOLS: ProtocolAssociation[] = [
  { protocol: 'http', defaultProgram: 'Google Chrome', description: 'HyperText Transfer Protocol' },
  { protocol: 'https', defaultProgram: 'Google Chrome', description: 'HyperText Transfer Protocol Secure' },
  { protocol: 'mailto', defaultProgram: 'Microsoft Outlook', description: 'Email (MailTo) Protocol' },
  { protocol: 'ftp', defaultProgram: 'File Explorer', description: 'File Transfer Protocol' },
  { protocol: 'telnet', defaultProgram: 'Windows Terminal', description: 'Telnet Protocol' },
  { protocol: 'ms-settings', defaultProgram: 'Windows Settings', description: 'Windows Settings URI' },
  { protocol: 'onenote', defaultProgram: 'Microsoft OneNote', description: 'OneNote Protocol' },
];

const COMMON_PROGRAMS = ['Notepad', 'Visual Studio Code', 'Microsoft Edge', 'Google Chrome', 'Microsoft Word', 'Microsoft Excel', 'Windows Media Player', 'VLC Media Player', 'Photos', 'Paint', 'File Explorer'];

export class FileAssociationReader {
  getAssociations(): FileAssociation[] {
    return ASSOCIATIONS;
  }

  getProtocolAssociations(): ProtocolAssociation[] {
    return PROTOCOLS;
  }

  getCategoryBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const assoc of ASSOCIATIONS) {
      breakdown[assoc.perceivedType] = (breakdown[assoc.perceivedType] || 0) + 1;
    }
    return breakdown;
  }

  setAssociation(extension: string, program: string): { success: boolean; message: string } {
    const assoc = ASSOCIATIONS.find((a) => a.extension === extension);
    if (!assoc) return { success: false, message: `No association found for ${extension}` };
    if (!COMMON_PROGRAMS.includes(program)) return { success: false, message: `Program ${program} not found` };
    assoc.defaultProgram = program;
    assoc.hasUserChoice = true;
    return { success: true, message: `${extension} will now open with ${program}` };
  }
}
