export interface WindowsFeature {
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  isEnabledByDefault: boolean;
  category: string;
  featureType: 'role' | 'feature' | 'optional';
  installState: 'enabled' | 'disabled' | 'enabled_pending_reboot' | 'disabled_pending_reboot';
  sizeMB: number;
  dependsOn: string[];
  dependentFeatures: string[];
  restartRequired: boolean;
  isCritical: boolean;
}

const features: WindowsFeature[] = [
  { name: 'NetFx3', displayName: '.NET Framework 3.5 (includes .NET 2.0 and 3.0)', description: 'Runtime for applications built with .NET Framework 3.5 and earlier', enabled: true, isEnabledByDefault: true, category: '.NET Framework', featureType: 'feature', installState: 'enabled', sizeMB: 320, dependsOn: [], dependentFeatures: ['NetFx4AdvancedServices', 'WCF-Services45'], restartRequired: false, isCritical: false },
  { name: 'NetFx4AdvancedServices', displayName: '.NET Framework 4.8 Advanced Services', description: 'Advanced features of .NET Framework 4.8 including WCF, WF, and ASP.NET', enabled: true, isEnabledByDefault: true, category: '.NET Framework', featureType: 'feature', installState: 'enabled', sizeMB: 180, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'WCF-Services45', displayName: 'WCF Services', description: 'Windows Communication Foundation services for building connected applications', enabled: true, isEnabledByDefault: false, category: '.NET Framework', featureType: 'feature', installState: 'enabled', sizeMB: 45, dependsOn: ['NetFx3'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'WCF-TCP-PortSharing45', displayName: 'WCF TCP Port Sharing', description: 'Allows multiple WCF services to share the same TCP port', enabled: false, isEnabledByDefault: false, category: '.NET Framework', featureType: 'feature', installState: 'disabled', sizeMB: 2, dependsOn: ['WCF-Services45'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Microsoft-Hyper-V', displayName: 'Hyper-V', description: 'Microsoft Hyper-V virtualization platform for running virtual machines', enabled: false, isEnabledByDefault: false, category: 'Hyper-V', featureType: 'role', installState: 'disabled', sizeMB: 450, dependsOn: ['Microsoft-Hyper-V-Management-PowerShell'], dependentFeatures: ['Hyper-V-Tools', 'Hyper-V-Platform', 'Containers-DisposableClientVM'], restartRequired: true, isCritical: false },
  { name: 'Microsoft-Hyper-V-Management-PowerShell', displayName: 'Hyper-V PowerShell Module', description: 'PowerShell cmdlets for Hyper-V management', enabled: false, isEnabledByDefault: false, category: 'Hyper-V', featureType: 'feature', installState: 'disabled', sizeMB: 35, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Hyper-V-Tools', displayName: 'Hyper-V Management Tools', description: 'GUI and command-line management tools for Hyper-V', enabled: false, isEnabledByDefault: false, category: 'Hyper-V', featureType: 'feature', installState: 'disabled', sizeMB: 62, dependsOn: ['Microsoft-Hyper-V'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Microsoft-Windows-Subsystem-Linux', displayName: 'Windows Subsystem for Linux', description: 'Run a Linux environment directly on Windows without a virtual machine', enabled: true, isEnabledByDefault: false, category: 'WSL', featureType: 'feature', installState: 'enabled', sizeMB: 280, dependsOn: ['VirtualMachinePlatform'], dependentFeatures: [], restartRequired: true, isCritical: false },
  { name: 'VirtualMachinePlatform', displayName: 'Virtual Machine Platform', description: 'Core platform components required for WSL 2 and other virtualization features', enabled: true, isEnabledByDefault: false, category: 'WSL', featureType: 'feature', installState: 'enabled', sizeMB: 95, dependsOn: [], dependentFeatures: ['Microsoft-Windows-Subsystem-Linux', 'Containers-DisposableClientVM'], restartRequired: true, isCritical: false },
  { name: 'MediaPlayback', displayName: 'Windows Media Player', description: 'Legacy Windows Media Player for audio and video playback', enabled: false, isEnabledByDefault: true, category: 'Media Features', featureType: 'feature', installState: 'disabled', sizeMB: 52, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'WindowsMediaPlayer', displayName: 'Windows Media Player (App)', description: 'Modern Windows Media Player application', enabled: true, isEnabledByDefault: true, category: 'Media Features', featureType: 'feature', installState: 'enabled', sizeMB: 88, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Media-Streaming', displayName: 'Media Streaming', description: 'DLNA media streaming to devices on your network', enabled: false, isEnabledByDefault: false, category: 'Media Features', featureType: 'feature', installState: 'disabled', sizeMB: 18, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Printing-PrintToPDFServices-Features', displayName: 'Microsoft Print to PDF', description: 'Built-in virtual printer that saves documents as PDF files', enabled: true, isEnabledByDefault: true, category: 'Print and Document', featureType: 'feature', installState: 'enabled', sizeMB: 12, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Printing-XPSServices-Features', displayName: 'Microsoft XPS Document Writer', description: 'Built-in virtual printer for creating XPS documents', enabled: true, isEnabledByDefault: true, category: 'Print and Document', featureType: 'feature', installState: 'enabled', sizeMB: 8, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Printing-Foundation-Features', displayName: 'Print and Document Services', description: 'Core printing services and drivers for Windows', enabled: true, isEnabledByDefault: true, category: 'Print and Document', featureType: 'feature', installState: 'enabled', sizeMB: 95, dependsOn: [], dependentFeatures: ['Printing-PrintToPDFServices-Features'], restartRequired: false, isCritical: true },
  { name: 'Printing-Client-Gui', displayName: 'Print Management Console', description: 'GUI management tools for printers and print servers', enabled: false, isEnabledByDefault: false, category: 'Print and Document', featureType: 'feature', installState: 'disabled', sizeMB: 25, dependsOn: ['Printing-Foundation-Features'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'IIS-WebServer', displayName: 'Internet Information Services', description: 'Microsoft web server for hosting websites and web applications', enabled: false, isEnabledByDefault: false, category: 'Internet Information Services', featureType: 'role', installState: 'disabled', sizeMB: 210, dependsOn: ['IIS-WebServerRole'], dependentFeatures: ['IIS-ASPNET', 'IIS-FTPServer'], restartRequired: true, isCritical: false },
  { name: 'IIS-WebServerRole', displayName: 'IIS Web Server Role', description: 'Core IIS role services', enabled: false, isEnabledByDefault: false, category: 'Internet Information Services', featureType: 'role', installState: 'disabled', sizeMB: 85, dependsOn: [], dependentFeatures: [], restartRequired: true, isCritical: false },
  { name: 'IIS-ASPNET', displayName: 'IIS ASP.NET Support', description: 'ASP.NET hosting support for IIS web server', enabled: false, isEnabledByDefault: false, category: 'Internet Information Services', featureType: 'feature', installState: 'disabled', sizeMB: 45, dependsOn: ['IIS-WebServer', 'NetFx4AdvancedServices'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'IIS-FTPServer', displayName: 'IIS FTP Server', description: 'FTP server service for file transfer', enabled: false, isEnabledByDefault: false, category: 'Internet Information Services', featureType: 'feature', installState: 'disabled', sizeMB: 28, dependsOn: ['IIS-WebServer'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'IIS-ManagementConsole', displayName: 'IIS Management Console', description: 'GUI management tools for IIS', enabled: false, isEnabledByDefault: false, category: 'Internet Information Services', featureType: 'feature', installState: 'disabled', sizeMB: 32, dependsOn: ['IIS-WebServer'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'Containers-DisposableClientVM', displayName: 'Windows Sandbox', description: 'Lightweight isolated desktop environment for running untrusted applications', enabled: false, isEnabledByDefault: false, category: 'Virtualization', featureType: 'feature', installState: 'disabled', sizeMB: 180, dependsOn: ['Microsoft-Hyper-V', 'VirtualMachinePlatform'], dependentFeatures: [], restartRequired: true, isCritical: false },
  { name: 'Containers', displayName: 'Containers', description: 'Windows container runtime and tools for containerized applications', enabled: false, isEnabledByDefault: false, category: 'Virtualization', featureType: 'feature', installState: 'disabled', sizeMB: 340, dependsOn: [], dependentFeatures: [], restartRequired: true, isCritical: false },
  { name: 'Windows-Defender-Features', displayName: 'Windows Defender Antivirus', description: 'Built-in antivirus and threat protection', enabled: true, isEnabledByDefault: true, category: 'Security', featureType: 'feature', installState: 'enabled', sizeMB: 245, dependsOn: [], dependentFeatures: ['Windows-Defender-ApplicationGuard'], restartRequired: false, isCritical: true },
  { name: 'Windows-Defender-ApplicationGuard', displayName: 'Microsoft Defender Application Guard', description: 'Isolated browsing environment using Hyper-V for Edge', enabled: false, isEnabledByDefault: false, category: 'Security', featureType: 'feature', installState: 'disabled', sizeMB: 190, dependsOn: ['Windows-Defender-Features', 'Microsoft-Hyper-V'], dependentFeatures: [], restartRequired: true, isCritical: false },
  { name: 'MicrosoftWindowsPowerShellV2Root', displayName: 'Windows PowerShell 5.1', description: 'Windows PowerShell command-line shell and scripting language', enabled: true, isEnabledByDefault: true, category: 'PowerShell', featureType: 'feature', installState: 'enabled', sizeMB: 78, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: true },
  { name: 'MicrosoftWindowsPowerShellISE', displayName: 'Windows PowerShell ISE', description: 'Integrated Scripting Environment for PowerShell', enabled: false, isEnabledByDefault: false, category: 'PowerShell', featureType: 'feature', installState: 'disabled', sizeMB: 42, dependsOn: ['MicrosoftWindowsPowerShellV2Root'], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'TFTP', displayName: 'TFTP Client', description: 'Trivial File Transfer Protocol client', enabled: false, isEnabledByDefault: false, category: 'Other', featureType: 'feature', installState: 'disabled', sizeMB: 1, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'TelnetClient', displayName: 'Telnet Client', description: 'Command-line Telnet client for remote terminal connections', enabled: false, isEnabledByDefault: false, category: 'Other', featureType: 'feature', installState: 'disabled', sizeMB: 1, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'SimpleTCP', displayName: 'Simple TCP/IP Services', description: 'Legacy TCP/IP services including Echo, Discard, and Quote of the Day', enabled: false, isEnabledByDefault: false, category: 'Other', featureType: 'feature', installState: 'disabled', sizeMB: 2, dependsOn: [], dependentFeatures: [], restartRequired: false, isCritical: false },
  { name: 'SMB1Protocol', displayName: 'SMB 1.0/CIFS File Sharing Support', description: 'Legacy SMB 1.0 protocol support for older network devices', enabled: false, isEnabledByDefault: false, category: 'Other', featureType: 'feature', installState: 'disabled', sizeMB: 8, dependsOn: [], dependentFeatures: [], restartRequired: true, isCritical: false },
];

const deduped = new Map<string, WindowsFeature>();
for (const f of features) deduped.set(f.name, f);

export class WindowsFeaturesManager {
  getFeatures(): WindowsFeature[] {
    return Array.from(deduped.values());
  }

  getCategories(): string[] {
    const cats = new Set<string>();
    for (const f of deduped.values()) cats.add(f.category);
    return Array.from(cats).sort();
  }

  toggleFeature(name: string, enable: boolean): { success: boolean; message: string; restartRequired: boolean } {
    const feature = deduped.get(name);
    if (!feature) return { success: false, message: `Feature "${name}" not found`, restartRequired: false };
    if (feature.isCritical && !enable) return { success: false, message: `${feature.displayName} is a system-critical feature and cannot be disabled`, restartRequired: false };

    const deps = this.getDependencyTree(name, enable);
    const restartRequired = deps.some(d => {
      const f = deduped.get(d);
      return f?.restartRequired ?? false;
    }) || feature.restartRequired;

    return {
      success: true,
      message: enable
        ? `${feature.displayName} will be enabled${deps.length ? ' with ' + deps.length + ' dependencies' : ''}`
        : `${feature.displayName} will be disabled`,
      restartRequired,
    };
  }

  private getDependencyTree(name: string, enable: boolean): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const feature = deduped.get(name);
    if (!feature) return result;

    if (enable) {
      // Collect all dependencies when enabling
      const stack = [name];
      while (stack.length) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);
        const f = deduped.get(current);
        if (f) {
          if (current !== name) result.push(current);
          for (const dep of f.dependsOn) {
            if (!visited.has(dep)) stack.push(dep);
          }
        }
      }
    }

    return result;
  }

  getFeatureDetails(name: string): (WindowsFeature & {
    registryPath: string;
    imagePath: string;
    installDate: string | null;
    logPath: string;
    statusPaths: string[];
  }) | null {
    const feature = deduped.get(name);
    if (!feature) return null;
    return {
      ...feature,
      registryPath: `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Setup\\OCManager\\Subcomponents\\${name}`,
      imagePath: `C:\\Windows\\WinSxS\\${name.toLowerCase()}`,
      installDate: feature.enabled ? '2025-11-15T08:30:00Z' : null,
      logPath: `C:\\Windows\\Logs\\CBS\\cbs.log`,
      statusPaths: [
        `C:\\Windows\\System32\\${name}.dll`,
        `C:\\Windows\\SysWOW64\\${name}.dll`,
      ],
    };
  }

  getInstallSize(): { totalEnabledMB: number; totalAvailableMB: number; totalDisabledMB: number } {
    let totalEnabledMB = 0;
    let totalDisabledMB = 0;
    for (const f of deduped.values()) {
      if (f.enabled) totalEnabledMB += f.sizeMB;
      else totalDisabledMB += f.sizeMB;
    }
    return { totalEnabledMB, totalAvailableMB: totalEnabledMB + totalDisabledMB, totalDisabledMB };
  }
}
