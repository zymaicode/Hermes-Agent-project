export interface FontEntry {
  name: string;
  family: string;
  type: 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting' | 'symbol';
  format: 'ttf' | 'otf' | 'woff2';
  version: string;
  designer: string;
  foundry: string;
  license: string;
  filePath: string;
  fileSizeKB: number;
  installed: string;
  styles: string[];
  weight: number;
  isSystemFont: boolean;
  isVariable: boolean;
  supportedScripts: string[];
  sampleText: string;
}

const fonts: FontEntry[] = [
  { name: 'Segoe UI', family: 'Segoe UI', type: 'sans-serif', format: 'ttf', version: '7.10', designer: 'Steve Matteson', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\segoeui.ttf', fileSizeKB: 1250, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Light', 'SemiLight', 'SemiBold', 'Black'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek', 'Arabic', 'Hebrew', 'Thai', 'Vietnamese'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Segoe UI Variable', family: 'Segoe UI', type: 'sans-serif', format: 'ttf', version: '2.01', designer: 'Steve Matteson', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\segoeui-vf.ttf', fileSizeKB: 980, installed: '2025-11-15', styles: ['Variable (200-900)'], weight: 400, isSystemFont: true, isVariable: true, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Arial', family: 'Arial', type: 'sans-serif', format: 'ttf', version: '7.00', designer: 'Robin Nicholas, Patricia Saunders', foundry: 'Monotype', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\arial.ttf', fileSizeKB: 756, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Narrow', 'Black'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek', 'Arabic', 'Hebrew'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Times New Roman', family: 'Times New Roman', type: 'serif', format: 'ttf', version: '7.00', designer: 'Stanley Morison', foundry: 'Monotype', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\times.ttf', fileSizeKB: 850, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Consolas', family: 'Consolas', type: 'monospace', format: 'ttf', version: '7.00', designer: 'Lucas de Groot', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\consola.ttf', fileSizeKB: 540, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'function hello() { return "world"; }' },
  { name: 'Courier New', family: 'Courier New', type: 'monospace', format: 'ttf', version: '6.90', designer: 'Howard Kettler', foundry: 'IBM/Monotype', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\cour.ttf', fileSizeKB: 640, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'function hello() { return "world"; }' },
  { name: 'Verdana', family: 'Verdana', type: 'sans-serif', format: 'ttf', version: '5.33', designer: 'Matthew Carter', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\verdana.ttf', fileSizeKB: 420, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Tahoma', family: 'Tahoma', type: 'sans-serif', format: 'ttf', version: '7.00', designer: 'Matthew Carter', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\tahoma.ttf', fileSizeKB: 400, installed: '2025-11-15', styles: ['Regular', 'Bold'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Microsoft Sans Serif', family: 'Microsoft Sans Serif', type: 'sans-serif', format: 'ttf', version: '6.10', designer: 'Microsoft', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\micross.ttf', fileSizeKB: 320, installed: '2025-11-15', styles: ['Regular'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Inter', family: 'Inter', type: 'sans-serif', format: 'otf', version: '4.0', designer: 'Rasmus Andersson', foundry: 'Rasmus Andersson', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\Inter-Regular.otf', fileSizeKB: 380, installed: '2026-02-10', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Thin', 'Extra Light', 'Light', 'Medium', 'SemiBold', 'Extra Bold', 'Black'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'JetBrains Mono', family: 'JetBrains Mono', type: 'monospace', format: 'ttf', version: '2.304', designer: 'Philipp Nurullin', foundry: 'JetBrains', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\JetBrainsMono-Regular.ttf', fileSizeKB: 290, installed: '2026-03-15', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Thin', 'Extra Light', 'Light', 'Medium', 'SemiBold', 'Extra Bold'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic'], sampleText: 'function hello() { return "world"; }' },
  { name: 'Fira Code', family: 'Fira Code', type: 'monospace', format: 'ttf', version: '6.2', designer: 'Nikita Prokopov', foundry: 'Mozilla', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\FiraCode-Regular.ttf', fileSizeKB: 260, installed: '2026-01-20', styles: ['Regular', 'Bold', 'Light', 'Medium', 'SemiBold'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'const arrow = () => { return "=>"; }' },
  { name: 'Cascadia Code', family: 'Cascadia Code', type: 'monospace', format: 'ttf', version: '2111.01', designer: 'Aaron Bell', foundry: 'Microsoft', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\CascadiaCode.ttf', fileSizeKB: 310, installed: '2026-02-28', styles: ['Regular', 'Bold', 'Italic', 'Light', 'SemiLight', 'SemiBold'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic'], sampleText: 'const hello = "world"; // ligature test !=>' },
  { name: 'Roboto', family: 'Roboto', type: 'sans-serif', format: 'ttf', version: '2.138', designer: 'Christian Robertson', foundry: 'Google', license: 'Apache License 2.0', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\Roboto-Regular.ttf', fileSizeKB: 340, installed: '2026-04-05', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Thin', 'Light', 'Medium', 'Black'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Open Sans', family: 'Open Sans', type: 'sans-serif', format: 'ttf', version: '3.000', designer: 'Steve Matteson', foundry: 'Google/Ascender', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\OpenSans-Regular.ttf', fileSizeKB: 280, installed: '2026-03-01', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Light', 'SemiBold', 'Extra Bold'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic', 'Greek'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Montserrat', family: 'Montserrat', type: 'sans-serif', format: 'otf', version: '7.222', designer: 'Julieta Ulanovsky', foundry: 'Julieta Ulanovsky', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\Montserrat-Regular.otf', fileSizeKB: 410, installed: '2025-12-10', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Thin', 'Extra Light', 'Light', 'Medium', 'SemiBold', 'Extra Bold', 'Black'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Poppins', family: 'Poppins', type: 'sans-serif', format: 'otf', version: '4.004', designer: 'Indian Type Foundry', foundry: 'Indian Type Foundry', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\Poppins-Regular.otf', fileSizeKB: 350, installed: '2026-01-05', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Thin', 'Extra Light', 'Light', 'Medium', 'SemiBold', 'Extra Bold', 'Black'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Microsoft YaHei', family: 'Microsoft YaHei', type: 'sans-serif', format: 'ttf', version: '6.25', designer: 'Microsoft', foundry: 'Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\msyh.ttf', fileSizeKB: 22000, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Light'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'CJK'], sampleText: '创新的设计带来卓越的体验 12345' },
  { name: 'SimSun', family: 'SimSun', type: 'serif', format: 'ttf', version: '5.16', designer: 'Zhongyi', foundry: 'Zhongyi Electronic', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\simsun.ttf', fileSizeKB: 15000, installed: '2025-11-15', styles: ['Regular', 'Bold'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'CJK'], sampleText: '创新设计卓越体验 12345' },
  { name: 'Yu Gothic', family: 'Yu Gothic', type: 'sans-serif', format: 'ttf', version: '1.94', designer: 'Jiyu-Kobo', foundry: 'Jiyu-Kobo/Microsoft', license: 'Proprietary', filePath: 'C:\\Windows\\Fonts\\yugoth.ttf', fileSizeKB: 18500, installed: '2025-11-15', styles: ['Regular', 'Bold', 'Light', 'Medium'], weight: 400, isSystemFont: true, isVariable: false, supportedScripts: ['Latin', 'CJK'], sampleText: '革新的なデザインは卓越した体験をもたらす' },
  { name: 'Playfair Display', family: 'Playfair Display', type: 'serif', format: 'otf', version: '1.202', designer: 'Claus Eggers Sorensen', foundry: 'Google', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\PlayfairDisplay-Regular.otf', fileSizeKB: 280, installed: '2026-04-20', styles: ['Regular', 'Bold', 'Italic', 'Bold Italic', 'Black'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin', 'Cyrillic'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Dancing Script', family: 'Dancing Script', type: 'handwriting', format: 'otf', version: '2.001', designer: 'Pablo Impallari', foundry: 'Impallari Type', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\DancingScript-Regular.otf', fileSizeKB: 180, installed: '2026-03-25', styles: ['Regular', 'Bold', 'Medium', 'SemiBold'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Pacifico', family: 'Pacifico', type: 'handwriting', format: 'ttf', version: '3.000', designer: 'Vernon Adams', foundry: 'Google', license: 'SIL Open Font License', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\Pacifico-Regular.ttf', fileSizeKB: 160, installed: '2025-12-20', styles: ['Regular'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Latin'], sampleText: 'The quick brown fox jumps over the lazy dog' },
  { name: 'Material Icons', family: 'Material Icons', type: 'symbol', format: 'ttf', version: '4.0.0', designer: 'Google', foundry: 'Google', license: 'Apache License 2.0', filePath: 'C:\\Users\\User\\AppData\\Local\\Microsoft\\Windows\\Fonts\\MaterialIcons-Regular.ttf', fileSizeKB: 520, installed: '2026-01-15', styles: ['Regular'], weight: 400, isSystemFont: false, isVariable: false, supportedScripts: ['Symbols'], sampleText: 'home settings close check star' },
];

export class FontManager {
  getInstalledFonts(): FontEntry[] {
    return fonts;
  }

  getFontPreview(fontName: string, text: string, size: number): string {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${size * 2 + 20}" viewBox="0 0 600 ${size * 2 + 20}"><rect fill="#0d1117" width="600" height="${size * 2 + 20}"/><text font-family="${fontName}, sans-serif" font-size="${size}px" fill="#c9d1d9" x="10" y="${size + 5}">${text}</text></svg>`)}`;
  }

  getFontDetail(name: string): (FontEntry & {
    glyphCount: number;
    kerningPairs: number;
    panose: string;
    fsSelection: string;
    unicodeRanges: string[];
    embeddingRights: string;
    subfamily: string;
    fullName: string;
    postScriptName: string;
  }) | null {
    const font = fonts.find(f => f.name === name);
    if (!font) return null;
    return {
      ...font,
      glyphCount: font.isSystemFont ? 2450 : 1200,
      kerningPairs: font.isSystemFont ? 4500 : 1800,
      panose: font.type === 'monospace' ? '2 11 6 9 2 2 4 3 2 4' : '2 11 6 4 2 2 2 2 2 4',
      fsSelection: 'Regular',
      unicodeRanges: font.supportedScripts.map(s => `${s} (${s === 'CJK' ? 'U+4E00–U+9FFF' : 'U+0000–U+024F'})`),
      embeddingRights: 'Installable',
      subfamily: 'Regular',
      fullName: font.name,
      postScriptName: font.name.replace(/ /g, '') + '-Regular',
    };
  }

  getGroupedByType(): Record<string, FontEntry[]> {
    const groups: Record<string, FontEntry[]> = {};
    for (const f of fonts) {
      if (!groups[f.type]) groups[f.type] = [];
      groups[f.type].push(f);
    }
    return groups;
  }

  getRecentFonts(): string[] {
    return ['JetBrains Mono', 'Inter', 'Segoe UI', 'Cascadia Code', 'Fira Code'];
  }
}
