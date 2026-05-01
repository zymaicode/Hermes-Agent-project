export interface LocalUser {
  name: string;
  fullName: string;
  description: string;
  sid: string;
  enabled: boolean;
  passwordAge: number;
  lastLogon: string;
  groups: string[];
  isAdmin: boolean;
  accountType: 'administrator' | 'standard' | 'guest';
}

export interface LocalGroup {
  name: string;
  description: string;
  sid: string;
  memberCount: number;
  members: string[];
}

const SIMULATED_USERS: LocalUser[] = [
  {
    name: 'Administrator',
    fullName: 'Built-in Administrator',
    description: 'Built-in account for administering the computer/domain',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-500',
    enabled: true,
    passwordAge: 45,
    lastLogon: '2026-04-28T08:15:00Z',
    groups: ['Administrators', 'Users'],
    isAdmin: true,
    accountType: 'administrator',
  },
  {
    name: 'DefaultAccount',
    fullName: 'Default Account',
    description: 'A user account managed by the system',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-503',
    enabled: false,
    passwordAge: 0,
    lastLogon: '',
    groups: ['Users'],
    isAdmin: false,
    accountType: 'standard',
  },
  {
    name: 'Guest',
    fullName: 'Built-in Guest',
    description: 'Built-in account for guest access to the computer/domain',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-501',
    enabled: false,
    passwordAge: 0,
    lastLogon: '',
    groups: ['Guests'],
    isAdmin: false,
    accountType: 'guest',
  },
  {
    name: 'WDAGUtilityAccount',
    fullName: 'WDAG Utility Account',
    description: 'A user account managed and used by the system for Windows Defender Application Guard scenarios',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-504',
    enabled: true,
    passwordAge: 0,
    lastLogon: '',
    groups: ['Users'],
    isAdmin: false,
    accountType: 'standard',
  },
  {
    name: 'zhangsan',
    fullName: '张三',
    description: 'Local user account',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-1001',
    enabled: true,
    passwordAge: 30,
    lastLogon: '2026-05-01T12:30:00Z',
    groups: ['Administrators', 'Users', 'Remote Desktop Users'],
    isAdmin: true,
    accountType: 'administrator',
  },
  {
    name: 'lisi',
    fullName: '李四',
    description: 'Standard user for daily work',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-1002',
    enabled: true,
    passwordAge: 90,
    lastLogon: '2026-04-30T17:45:00Z',
    groups: ['Users', 'Performance Log Users'],
    isAdmin: false,
    accountType: 'standard',
  },
  {
    name: 'devuser',
    fullName: 'Dev User',
    description: 'Development and testing account',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-1003',
    enabled: true,
    passwordAge: 15,
    lastLogon: '2026-05-01T09:00:00Z',
    groups: ['Users', 'Hyper-V Administrators', 'Remote Desktop Users'],
    isAdmin: false,
    accountType: 'standard',
  },
  {
    name: 'backup_svc',
    fullName: 'Backup Service Account',
    description: 'Service account for automated backups',
    sid: 'S-1-5-21-1004336348-1177238915-682003330-1004',
    enabled: true,
    passwordAge: 180,
    lastLogon: '2026-05-01T00:05:00Z',
    groups: ['Users', 'Backup Operators'],
    isAdmin: false,
    accountType: 'standard',
  },
];

const SIMULATED_GROUPS: LocalGroup[] = [
  { name: 'Administrators', description: 'Administrators have complete and unrestricted access to the computer/domain', sid: 'S-1-5-32-544', memberCount: 2, members: ['Administrator', 'zhangsan'] },
  { name: 'Users', description: 'Users are prevented from making accidental or intentional system-wide changes and can run most applications', sid: 'S-1-5-32-545', memberCount: 7, members: ['Administrator', 'DefaultAccount', 'WDAGUtilityAccount', 'zhangsan', 'lisi', 'devuser', 'backup_svc'] },
  { name: 'Guests', description: 'Guests have the same access as members of the Users group by default, except for the Guest account which is further restricted', sid: 'S-1-5-32-546', memberCount: 1, members: ['Guest'] },
  { name: 'Remote Desktop Users', description: 'Members in this group are granted the right to log on remotely', sid: 'S-1-5-32-555', memberCount: 2, members: ['zhangsan', 'devuser'] },
  { name: 'Performance Log Users', description: 'Members of this group may schedule logging of performance counters, enable trace providers, and collect event traces', sid: 'S-1-5-32-559', memberCount: 1, members: ['lisi'] },
  { name: 'Performance Monitor Users', description: 'Members of this group can access performance counter data locally and remotely', sid: 'S-1-5-32-558', memberCount: 0, members: [] },
  { name: 'Hyper-V Administrators', description: 'Members of this group have complete and unrestricted access to all features of Hyper-V', sid: 'S-1-5-32-578', memberCount: 1, members: ['devuser'] },
  { name: 'Backup Operators', description: 'Backup Operators can override security restrictions for the sole purpose of backing up or restoring files', sid: 'S-1-5-32-551', memberCount: 1, members: ['backup_svc'] },
  { name: 'Event Log Readers', description: 'Members of this group can read event logs from local machine', sid: 'S-1-5-32-573', memberCount: 0, members: [] },
  { name: 'Cryptographic Operators', description: 'Members are authorized to perform cryptographic operations', sid: 'S-1-5-32-569', memberCount: 0, members: [] },
  { name: 'Distributed COM Users', description: 'Members are allowed to launch, activate and use Distributed COM objects on this machine', sid: 'S-1-5-32-562', memberCount: 0, members: [] },
  { name: 'Network Configuration Operators', description: 'Members in this group can have some administrative privileges to manage configuration of networking features', sid: 'S-1-5-32-556', memberCount: 0, members: [] },
  { name: 'IIS_IUSRS', description: 'Built-in group used by Internet Information Services', sid: 'S-1-5-32-568', memberCount: 0, members: [] },
  { name: 'Power Users', description: 'Power Users are included for backwards compatibility and possess limited administrative powers', sid: 'S-1-5-32-547', memberCount: 0, members: [] },
  { name: 'Device Owners', description: 'Members of this group can change system-wide settings', sid: 'S-1-5-32-583', memberCount: 0, members: [] },
];

export class UserManager {
  listUsers(): LocalUser[] {
    return SIMULATED_USERS;
  }

  listGroups(): LocalGroup[] {
    return SIMULATED_GROUPS;
  }

  getUserDetail(name: string): LocalUser | null {
    return SIMULATED_USERS.find((u) => u.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  getGroupDetail(name: string): LocalGroup | null {
    return SIMULATED_GROUPS.find((g) => g.name.toLowerCase() === name.toLowerCase()) ?? null;
  }
}
