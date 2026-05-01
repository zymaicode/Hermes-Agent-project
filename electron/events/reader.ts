export interface EventLogEntry {
  id: number;
  logName: string;
  level: 'critical' | 'error' | 'warning' | 'information' | 'verbose';
  source: string;
  eventId: number;
  taskCategory: string;
  user: string;
  computer: string;
  timeCreated: string;
  message: string;
  details: Record<string, string>;
  xml: string;
}

const NOW = Date.now();

function minsAgo(m: number): string {
  return new Date(NOW - m * 60000).toISOString();
}

function hrsAgo(h: number): string {
  return new Date(NOW - h * 3600000).toISOString();
}

const EVENTS: EventLogEntry[] = [
  // System log events
  { id: 1, logName: 'System', level: 'information', source: 'Service Control Manager', eventId: 7036, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: minsAgo(5), message: 'The Windows Update service entered the running state.', details: { 'ServiceName': 'wuauserv', 'Status': 'Running' }, xml: '' },
  { id: 2, logName: 'System', level: 'information', source: 'Service Control Manager', eventId: 7036, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: minsAgo(12), message: 'The Background Intelligent Transfer Service entered the running state.', details: { 'ServiceName': 'BITS', 'Status': 'Running' }, xml: '' },
  { id: 3, logName: 'System', level: 'information', source: 'Kernel-General', eventId: 12, taskCategory: 'Time Change', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: minsAgo(18), message: 'The operating system started at system time 2025-04-30T22:45:12.500000000Z.', details: { 'StartTime': '2025-04-30T22:45:12.500000000Z', 'OldTime': '2025-04-30T22:46:00.000000000Z', 'NewTime': '2025-04-30T22:46:00.500000000Z' }, xml: '' },
  { id: 4, logName: 'System', level: 'information', source: 'Microsoft-Windows-Kernel-Power', eventId: 42, taskCategory: 'Sleep Transition', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(1), message: 'The system is entering sleep state. Reason: Application API.', details: { 'SleepReason': 'Application API', 'TargetState': '4' }, xml: '' },
  { id: 5, logName: 'System', level: 'information', source: 'Microsoft-Windows-Kernel-Power', eventId: 107, taskCategory: 'Wake Source', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(1), message: 'The system has resumed from sleep. Wake source: Power Button.', details: { 'WakeSourceType': 'Power Button', 'WakeTime': '50ms' }, xml: '' },
  { id: 6, logName: 'System', level: 'warning', source: 'Microsoft-Windows-DNS-Client', eventId: 1014, taskCategory: 'Name Resolution', user: 'NETWORK SERVICE', computer: 'DESKTOP-PC', timeCreated: minsAgo(25), message: 'Name resolution for the name wpad.local timed out after none of the configured DNS servers responded.', details: { 'QueryName': 'wpad.local', 'QueryType': 'A' }, xml: '' },
  { id: 7, logName: 'System', level: 'warning', source: 'Disk', eventId: 51, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: minsAgo(45), message: 'An error was detected on device \\Device\\Harddisk1\\DR3 during a paging operation.', details: { 'Device': '\\Device\\Harddisk1\\DR3', 'Operation': 'Paging' }, xml: '' },
  { id: 8, logName: 'System', level: 'error', source: 'Service Control Manager', eventId: 7000, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(2), message: 'The hrdevmon service failed to start due to the following error: The service did not respond to the start or control request in a timely fashion.', details: { 'ServiceName': 'hrdevmon', 'ErrorCode': '1053' }, xml: '' },
  { id: 9, logName: 'System', level: 'error', source: 'Service Control Manager', eventId: 7009, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(2), message: 'A timeout was reached (30000 milliseconds) while waiting for the hrdevmon service to connect.', details: { 'ServiceName': 'hrdevmon', 'TimeoutMs': '30000' }, xml: '' },
  { id: 10, logName: 'System', level: 'information', source: 'Microsoft-Windows-Winlogon', eventId: 7001, taskCategory: 'Logon', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(3), message: 'User logon notification for Customer Experience Improvement Program.', details: { 'UserSid': 'S-1-5-21-123456-7890-1001' }, xml: '' },
  { id: 11, logName: 'System', level: 'information', source: 'Microsoft-Windows-Kernel-Processor-Power', eventId: 55, taskCategory: 'Processor', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(4), message: 'Processor 7 in group 0 exposes the following power management capabilities: idle states (ACPI C1, C2, C3), performance states (ACPI P0-P8), and throttle states.', details: { 'Processor': '7', 'Group': '0', 'Capabilities': 'C1, C2, C3, P0-P8' }, xml: '' },
  { id: 12, logName: 'System', level: 'information', source: 'Microsoft-Windows-FilterManager', eventId: 6, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(5), message: 'File System Filter "npsvctrig" (10.0.26100.1) loaded and registered with Filter Manager.', details: { 'FilterName': 'npsvctrig', 'Version': '10.0.26100.1' }, xml: '' },
  { id: 13, logName: 'System', level: 'warning', source: 'Microsoft-Windows-Time-Service', eventId: 36, taskCategory: 'None', user: 'LOCAL SERVICE', computer: 'DESKTOP-PC', timeCreated: hrsAgo(6), message: 'The time service has not synchronized the system time for 86400 seconds because none of the time service providers provided a usable time stamp.', details: { 'SecondsWithoutSync': '86400' }, xml: '' },
  { id: 14, logName: 'System', level: 'information', source: 'Tcpip', eventId: 4201, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(7), message: 'The system detected that network adapter "Intel(R) Wi-Fi 6E AX211" was connected to the network, and has initiated normal operation.', details: { 'AdapterName': 'Intel(R) Wi-Fi 6E AX211', 'InterfaceGUID': '{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}' }, xml: '' },
  { id: 15, logName: 'System', level: 'error', source: 'Microsoft-Windows-DistributedCOM', eventId: 10010, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(8), message: 'The server {AB8902B4-09CA-4BB6-B78D-A8F59079A8D5} did not register with DCOM within the required timeout.', details: { 'ServerGUID': '{AB8902B4-09CA-4BB6-B78D-A8F59079A8D5}' }, xml: '' },

  // Application log events
  { id: 16, logName: 'Application', level: 'information', source: 'Windows Error Reporting', eventId: 1001, taskCategory: 'None', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(10), message: 'Fault bucket 123456789, type 0. Event Name: APPCRASH. Response: Not available. Cab Id: 0.', details: { 'BucketID': '123456789', 'EventName': 'APPCRASH' }, xml: '' },
  { id: 17, logName: 'Application', level: 'error', source: 'Application Error', eventId: 1000, taskCategory: 'Application Crashing Events', user: 'DESKTOP-PC\\User', computer: 'DESKTOP-PC', timeCreated: minsAgo(30), message: 'Faulting application name: chrome.exe, version: 125.0.6422.141, time stamp: 0x6637a000. Faulting module name: ntdll.dll, version: 10.0.26100.3323, time stamp: 0x8f3b2c10.', details: { 'AppName': 'chrome.exe', 'AppVersion': '125.0.6422.141', 'ModuleName': 'ntdll.dll' }, xml: '' },
  { id: 18, logName: 'Application', level: 'error', source: 'Application Error', eventId: 1000, taskCategory: 'Application Crashing Events', user: 'DESKTOP-PC\\User', computer: 'DESKTOP-PC', timeCreated: minsAgo(32), message: 'Faulting application name: chrome.exe, version: 125.0.6422.141, time stamp: 0x6637a000. Faulting module name: chrome.dll, version: 125.0.6422.141, time stamp: 0x6637a100.', details: { 'AppName': 'chrome.exe', 'AppVersion': '125.0.6422.141', 'ModuleName': 'chrome.dll' }, xml: '' },
  { id: 19, logName: 'Application', level: 'warning', source: 'Microsoft-Windows-Security-SPP', eventId: 8233, taskCategory: 'None', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(3), message: 'The rules engine reported a failed enforcement call. The installation token is invalid or has expired.', details: { 'HRESULT': '0x8007007B' }, xml: '' },
  { id: 20, logName: 'Application', level: 'information', source: 'ESENT', eventId: 102, taskCategory: 'Logging/Recovery', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(4), message: 'Application (SearchIndexer) has started a new instance of the database engine (10.0.26100.3323).', details: { 'AppName': 'SearchIndexer', 'EngineVersion': '10.0.26100.3323' }, xml: '' },
  { id: 21, logName: 'Application', level: 'information', source: 'ESENT', eventId: 103, taskCategory: 'Logging/Recovery', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(4), message: 'Application (SearchIndexer) has successfully started the database engine.', details: { 'AppName': 'SearchIndexer' }, xml: '' },
  { id: 22, logName: 'Application', level: 'information', source: 'MsiInstaller', eventId: 11707, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(5), message: 'Product: Microsoft Visual C++ 2022 Redistributable (x64) -- Installation operation completed successfully.', details: { 'ProductName': 'Microsoft Visual C++ 2022 Redistributable (x64)', 'InstallResult': 'Success' }, xml: '' },
  { id: 23, logName: 'Application', level: 'warning', source: 'Microsoft-Windows-RestartManager', eventId: 10010, taskCategory: 'None', user: 'DESKTOP-PC\\User', computer: 'DESKTOP-PC', timeCreated: hrsAgo(6), message: 'Application "Discord" (pid 5672) is preventing a restart or shutdown because it has open file handles in the system.', details: { 'AppName': 'Discord', 'PID': '5672' }, xml: '' },
  { id: 24, logName: 'Application', level: 'information', source: 'SecurityCenter', eventId: 1, taskCategory: 'None', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(8), message: 'The Windows Security Center Service has started.', details: { 'ServiceStatus': 'Started' }, xml: '' },
  { id: 25, logName: 'Application', level: 'error', source: 'Microsoft-Windows-Perflib', eventId: 1008, taskCategory: 'None', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(10), message: 'The Open Procedure for service "BITS" in DLL "C:\\Windows\\System32\\bitsperf.dll" failed. Performance data for this service will not be available.', details: { 'Service': 'BITS', 'DLL': 'C:\\Windows\\System32\\bitsperf.dll' }, xml: '' },

  // Security log events
  { id: 26, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4624, taskCategory: 'Logon', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(2), message: 'An account was successfully logged on. Subject: Security ID: S-1-5-18, Account Name: DESKTOP-PC$, Logon Type: 5 (Service).', details: { 'LogonType': '5', 'AccountName': 'DESKTOP-PC$', 'LogonID': '0x3E7' }, xml: '' },
  { id: 27, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4624, taskCategory: 'Logon', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(15), message: 'An account was successfully logged on. Subject: Security ID: S-1-5-21-123456-7890-1001, Account Name: User, Logon Type: 2 (Interactive).', details: { 'LogonType': '2', 'AccountName': 'User', 'LogonID': '0x5A7B2' }, xml: '' },
  { id: 28, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4672, taskCategory: 'Special Logon', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(15), message: 'Special privileges assigned to new logon. Security ID: S-1-5-21-123456-7890-1001, Privileges: SeSecurityPrivilege, SeTakeOwnershipPrivilege.', details: { 'UserSID': 'S-1-5-21-123456-7890-1001', 'Privileges': 'SeSecurityPrivilege, SeTakeOwnershipPrivilege' }, xml: '' },
  { id: 29, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4634, taskCategory: 'Logoff', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(2), message: 'An account was logged off. Subject: Security ID: S-1-5-21-123456-7890-1001, Account Name: User, Logon ID: 0x5A7B2.', details: { 'LogonID': '0x5A7B2', 'AccountName': 'User' }, xml: '' },
  { id: 30, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4648, taskCategory: 'Logon', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(20), message: 'A logon was attempted using explicit credentials. Subject: Account Name: User, Target Server: localhost.', details: { 'AccountName': 'User', 'TargetServer': 'localhost' }, xml: '' },
  { id: 31, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 5061, taskCategory: 'System Integrity', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(40), message: 'Cryptographic operation. Subject: Security ID: S-1-5-18, Operation: Key open.', details: { 'Operation': 'Key open', 'SubjectSID': 'S-1-5-18' }, xml: '' },
  { id: 32, logName: 'Security', level: 'error', source: 'Microsoft-Windows-Security-Auditing', eventId: 4625, taskCategory: 'Logon', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(55), message: 'An account failed to log on. Subject: Security ID: S-1-0-0, Account Name: -, Failure Reason: Unknown user name or bad password. Status: 0xC000006D.', details: { 'FailureReason': 'Unknown user name or bad password', 'Status': '0xC000006D' }, xml: '' },
  { id: 33, logName: 'Security', level: 'information', source: 'Microsoft-Windows-Security-Auditing', eventId: 4798, taskCategory: 'User Account Management', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: hrsAgo(3), message: "A user's local group membership was enumerated. Subject: Account Name: User, Target Account: Administrator.", details: { 'SubjectAccount': 'User', 'TargetAccount': 'Administrator' }, xml: '' },
  { id: 34, logName: 'Security', level: 'warning', source: 'Microsoft-Windows-Security-Auditing', eventId: 5156, taskCategory: 'Filtering Platform Connection', user: 'N/A', computer: 'DESKTOP-PC', timeCreated: minsAgo(35), message: 'The Windows Filtering Platform has permitted a connection. Application: chrome.exe, Direction: Outbound, Remote Address: 142.250.80.46:443.', details: { 'AppName': 'chrome.exe', 'Direction': 'Outbound', 'RemoteAddress': '142.250.80.46:443' }, xml: '' },

  // Setup log events
  { id: 35, logName: 'Setup', level: 'information', source: 'Microsoft-Windows-Servicing', eventId: 1, taskCategory: 'Servicing', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(6), message: 'Package KB5051234 was successfully changed to the Installed state.', details: { 'PackageID': 'KB5051234', 'NewState': 'Installed' }, xml: '' },
  { id: 36, logName: 'Setup', level: 'information', source: 'Microsoft-Windows-Servicing', eventId: 2, taskCategory: 'Servicing', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(6), message: 'Package KB5051234 requires a reboot to complete installation.', details: { 'PackageID': 'KB5051234', 'RebootRequired': 'true' }, xml: '' },
  { id: 37, logName: 'Setup', level: 'information', source: 'Microsoft-Windows-Servicing', eventId: 1, taskCategory: 'Servicing', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(12), message: 'Package KB5049876 was successfully changed to the Installed state.', details: { 'PackageID': 'KB5049876', 'NewState': 'Installed' }, xml: '' },
  { id: 38, logName: 'Setup', level: 'warning', source: 'Microsoft-Windows-Servicing', eventId: 3, taskCategory: 'Servicing', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(12), message: 'Package KB5049876 installation encountered a non-fatal error. The package was installed but some components may not be fully functional.', details: { 'PackageID': 'KB5049876', 'ErrorType': 'NonFatal' }, xml: '' },
  { id: 39, logName: 'Setup', level: 'information', source: 'Microsoft-Windows-Servicing', eventId: 4, taskCategory: 'Servicing', user: 'SYSTEM', computer: 'DESKTOP-PC', timeCreated: hrsAgo(14), message: 'Servicing stack updated to version 10.0.26100.3037.', details: { 'ServicingStackVersion': '10.0.26100.3037' }, xml: '' },
];

// Generate XML for each event
for (const e of EVENTS) {
  e.xml = `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="${e.source}" />
    <EventID>${e.eventId}</EventID>
    <Level>${e.level === 'critical' ? '1' : e.level === 'error' ? '2' : e.level === 'warning' ? '3' : '4'}</Level>
    <Task>${e.taskCategory}</Task>
    <TimeCreated SystemTime="${e.timeCreated}" />
    <Computer>${e.computer}</Computer>
    <Security UserID="${e.user}" />
  </System>
  <EventData>
${Object.entries(e.details).map(([k, v]) => `    <Data Name="${k}">${v}</Data>`).join('\n')}
  </EventData>
</Event>`;
}

export class EventLogReader {
  getEvents(logName?: string, level?: string, limit?: number, search?: string): EventLogEntry[] {
    let events = EVENTS;

    if (logName && logName !== 'All Logs') {
      events = events.filter((e) => e.logName === logName);
    }
    if (level && level !== 'all') {
      events = events.filter((e) => e.level === level);
    }
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.source.toLowerCase().includes(q) ||
          String(e.eventId).includes(q)
      );
    }

    events = events.slice(0, limit ?? 100);
    return events;
  }

  getLogNames(): string[] {
    return ['System', 'Application', 'Security', 'Setup'];
  }

  getEventCounts(): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const logName of this.getLogNames()) {
      result[logName] = { critical: 0, error: 0, warning: 0, information: 0, verbose: 0 };
    }
    for (const e of EVENTS) {
      result[e.logName][e.level] = (result[e.logName][e.level] || 0) + 1;
    }
    return result;
  }
}
