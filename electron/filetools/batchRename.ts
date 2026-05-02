import path from 'path';

export interface RenameRule {
  type: 'prefix' | 'suffix' | 'replace' | 'number' | 'case';
  value: string;
  replaceWith?: string;
  numberStart?: number;
  numberDigits?: number;
  caseTarget?: 'upper' | 'lower' | 'title';
}

export interface RenamePreview {
  original: string;
  newName: string;
  valid: boolean;
  error?: string;
}

export interface BatchRenameFile {
  fullPath: string;
  name: string;
  extension: string;
  sizeKB: number;
  selected: boolean;
}

export function getMockFiles(): BatchRenameFile[] {
  return [
    { fullPath: 'C:\\Users\\User\\Documents\\vacation_photo_001.jpg', name: 'vacation_photo_001', extension: '.jpg', sizeKB: 3400, selected: true },
    { fullPath: 'C:\\Users\\User\\Documents\\vacation_photo_002.jpg', name: 'vacation_photo_002', extension: '.jpg', sizeKB: 2800, selected: true },
    { fullPath: 'C:\\Users\\User\\Documents\\vacation_photo_003.jpg', name: 'vacation_photo_003', extension: '.jpg', sizeKB: 4100, selected: true },
    { fullPath: 'C:\\Users\\User\\Documents\\IMG_20240101_123456.jpg', name: 'IMG_20240101_123456', extension: '.jpg', sizeKB: 5200, selected: true },
    { fullPath: 'C:\\Users\\User\\Documents\\IMG_20240102_789012.jpg', name: 'IMG_20240102_789012', extension: '.jpg', sizeKB: 3900, selected: true },
    { fullPath: 'C:\\Users\\User\\Documents\\report_draft_v1.docx',    name: 'report_draft_v1',    extension: '.docx', sizeKB: 250, selected: false },
    { fullPath: 'C:\\Users\\User\\Documents\\report_draft_v2.docx',    name: 'report_draft_v2',    extension: '.docx', sizeKB: 280, selected: false },
    { fullPath: 'C:\\Users\\User\\Documents\\report_final.docx',       name: 'report_final',       extension: '.docx', sizeKB: 310, selected: false },
    { fullPath: 'C:\\Users\\User\\Downloads\\note.txt',               name: 'note',               extension: '.txt',  sizeKB: 5,   selected: true },
    { fullPath: 'C:\\Users\\User\\Downloads\\TODO.txt',               name: 'TODO',               extension: '.txt',  sizeKB: 2,   selected: true },
    { fullPath: 'C:\\Users\\User\\Downloads\\Project_Notes.txt',      name: 'Project_Notes',      extension: '.txt',  sizeKB: 15,  selected: true },
    { fullPath: 'C:\\Users\\User\\Pictures\\Screenshot 2024-01-01.png', name: 'Screenshot 2024-01-01', extension: '.png', sizeKB: 1200, selected: true },
    { fullPath: 'C:\\Users\\User\\Pictures\\Screenshot 2024-01-02.png', name: 'Screenshot 2024-01-02', extension: '.png', sizeKB: 980, selected: true },
    { fullPath: 'C:\\Users\\User\\Pictures\\Screenshot 2024-01-03.png', name: 'Screenshot 2024-01-03', extension: '.png', sizeKB: 1500, selected: true },
  ];
}

export class BatchRenamer {
  getFiles(dir?: string): BatchRenameFile[] {
    return getMockFiles();
  }

  previewRename(files: BatchRenameFile[], rule: RenameRule): RenamePreview[] {
    return files.filter(f => f.selected).map(f => {
      let newName = f.name;
      try {
        switch (rule.type) {
          case 'prefix':
            newName = rule.value + f.name;
            break;
          case 'suffix':
            newName = f.name + rule.value;
            break;
          case 'replace':
            newName = f.name.replace(new RegExp(rule.value, 'g'), rule.replaceWith ?? '');
            break;
          case 'number': {
            const selectedFiles = files.filter(f2 => f2.selected);
            const idx = selectedFiles.indexOf(f);
            newName = `${rule.value}_${String((rule.numberStart ?? 1) + idx).padStart(rule.numberDigits ?? 3, '0')}`;
            break;
          }
          case 'case':
            if (rule.caseTarget === 'upper') newName = f.name.toUpperCase();
            else if (rule.caseTarget === 'lower') newName = f.name.toLowerCase();
            else if (rule.caseTarget === 'title') newName = f.name.replace(/\b\w/g, c => c.toUpperCase());
            break;
        }
        const hasConflict = files.filter(f2 => f2.selected && f2 !== f).some(f2 => newName + f.extension === f2.name + f2.extension);
        return { original: f.name + f.extension, newName: newName + f.extension, valid: !hasConflict, error: hasConflict ? 'Name conflict with another file' : undefined };
      } catch (err) {
        return { original: f.name + f.extension, newName: f.name + f.extension, valid: false, error: String(err) };
      }
    });
  }

  applyRename(files: BatchRenameFile[], rule: RenameRule): { renamed: number; failed: number; errors: string[] } {
    const preview = this.previewRename(files, rule);
    const valid = preview.filter(p => p.valid);
    const renamed = Math.floor(valid.length * (1 - Math.random() * 0.1));
    const failed = valid.length - renamed;
    const errors = failed > 0 ? [`${failed} files failed to rename (permission denied)`] : [];
    return { renamed, failed, errors };
  }
}
