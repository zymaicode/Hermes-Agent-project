export interface PowerSetting {
  name: string;
  currentValue: string;
  possibleValues: string[];
  description: string;
  isBatterySetting: boolean;
  isCritical: boolean;
}

export interface PowerSettingGroup {
  category: string;
  settings: PowerSetting[];
}

export interface PowerPlan {
  guid: string;
  name: string;
  description: string;
  isActive: boolean;
  isHighPerformance: boolean;
  isBalanced: boolean;
  isPowerSaver: boolean;
  settings: PowerSettingGroup[];
}

export interface PowerReport {
  activePlan: string;
  batteryLifeRemaining: string;
  estimatedBatteryLife: string;
  estimatedBatteryLifeOptimized: string;
}

function makeBalancedSettings(): PowerSettingGroup[] {
  return [
    {
      category: 'Processor power management',
      settings: [
        { name: 'Minimum processor state', currentValue: '5%', possibleValues: ['0%', '5%', '10%', '20%', '50%', '100%'], description: 'Minimum processor performance state when idle', isBatterySetting: true, isCritical: false },
        { name: 'Maximum processor state', currentValue: '100%', possibleValues: ['50%', '75%', '90%', '99%', '100%'], description: 'Maximum processor performance state when active', isBatterySetting: true, isCritical: false },
        { name: 'System cooling policy', currentValue: 'Active', possibleValues: ['Active', 'Passive'], description: 'How the system cools the processor under load', isBatterySetting: true, isCritical: true },
        { name: 'Processor performance increase threshold', currentValue: '90%', possibleValues: ['60%', '70%', '80%', '90%', '95%'], description: 'Utilization at which the processor boosts clock speed', isBatterySetting: false, isCritical: false },
      ],
    },
    {
      category: 'Hard disk',
      settings: [
        { name: 'Turn off hard disk after', currentValue: '20 minutes', possibleValues: ['Never', '1 minute', '5 minutes', '10 minutes', '20 minutes', '30 minutes', '1 hour'], description: 'Time before inactive hard disk spins down', isBatterySetting: true, isCritical: true },
      ],
    },
    {
      category: 'Sleep',
      settings: [
        { name: 'Sleep after', currentValue: '30 minutes', possibleValues: ['Never', '1 minute', '5 minutes', '15 minutes', '30 minutes', '1 hour', '2 hours'], description: 'Time before system enters sleep mode', isBatterySetting: true, isCritical: false },
        { name: 'Allow hybrid sleep', currentValue: 'On', possibleValues: ['On', 'Off'], description: 'Combine sleep and hibernation for faster resume', isBatterySetting: false, isCritical: false },
        { name: 'Allow wake timers', currentValue: 'Important Wake Timers Only', possibleValues: ['Disable', 'Enable', 'Important Wake Timers Only'], description: 'Allow scheduled tasks to wake the computer', isBatterySetting: false, isCritical: false },
      ],
    },
    {
      category: 'USB settings',
      settings: [
        { name: 'USB selective suspend setting', currentValue: 'Enabled', possibleValues: ['Enabled', 'Disabled'], description: 'Allow USB ports to enter low power state', isBatterySetting: true, isCritical: false },
      ],
    },
    {
      category: 'PCI Express',
      settings: [
        { name: 'Link State Power Management', currentValue: 'Moderate power savings', possibleValues: ['Off', 'Moderate power savings', 'Maximum power savings'], description: 'PCIe link power state for idle devices', isBatterySetting: true, isCritical: false },
      ],
    },
    {
      category: 'Wireless Adapter Settings',
      settings: [
        { name: 'Power Saving Mode', currentValue: 'Medium Power Saving', possibleValues: ['Maximum Performance', 'Low Power Saving', 'Medium Power Saving', 'Maximum Power Saving'], description: 'Balance wireless performance and power usage', isBatterySetting: true, isCritical: false },
      ],
    },
  ];
}

function makeHighPerfSettings(): PowerSettingGroup[] {
  const groups = makeBalancedSettings();
  // Modify key settings for high performance
  const processor = groups.find((g) => g.category === 'Processor power management')!;
  (processor.settings.find((s) => s.name === 'Minimum processor state')!).currentValue = '100%';
  (processor.settings.find((s) => s.name === 'System cooling policy')!).currentValue = 'Active';
  const pcie = groups.find((g) => g.category === 'PCI Express')!;
  (pcie.settings.find((s) => s.name === 'Link State Power Management')!).currentValue = 'Off';
  const wireless = groups.find((g) => g.category === 'Wireless Adapter Settings')!;
  (wireless.settings.find((s) => s.name === 'Power Saving Mode')!).currentValue = 'Maximum Performance';
  const disk = groups.find((g) => g.category === 'Hard disk')!;
  (disk.settings.find((s) => s.name === 'Turn off hard disk after')!).currentValue = 'Never';
  return groups;
}

function makePowerSaverSettings(): PowerSettingGroup[] {
  const groups = makeBalancedSettings();
  const processor = groups.find((g) => g.category === 'Processor power management')!;
  (processor.settings.find((s) => s.name === 'Maximum processor state')!).currentValue = '75%';
  (processor.settings.find((s) => s.name === 'System cooling policy')!).currentValue = 'Passive';
  const pcie = groups.find((g) => g.category === 'PCI Express')!;
  (pcie.settings.find((s) => s.name === 'Link State Power Management')!).currentValue = 'Maximum power savings';
  const wireless = groups.find((g) => g.category === 'Wireless Adapter Settings')!;
  (wireless.settings.find((s) => s.name === 'Power Saving Mode')!).currentValue = 'Maximum Power Saving';
  const disk = groups.find((g) => g.category === 'Hard disk')!;
  (disk.settings.find((s) => s.name === 'Turn off hard disk after')!).currentValue = '10 minutes';
  const sleep = groups.find((g) => g.category === 'Sleep')!;
  (sleep.settings.find((s) => s.name === 'Sleep after')!).currentValue = '15 minutes';
  return groups;
}

const PLANS: PowerPlan[] = [
  {
    guid: '381b4222-f694-41f0-9685-ff5bb260df2e',
    name: 'Balanced',
    description: 'Automatically balances performance with energy consumption on capable hardware.',
    isActive: true,
    isHighPerformance: false,
    isBalanced: true,
    isPowerSaver: false,
    settings: makeBalancedSettings(),
  },
  {
    guid: '8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
    name: 'High Performance',
    description: 'Favors performance, but may use more energy. On laptops, battery life may be reduced.',
    isActive: false,
    isHighPerformance: true,
    isBalanced: false,
    isPowerSaver: false,
    settings: makeHighPerfSettings(),
  },
  {
    guid: 'a1841308-3541-4fab-bc81-f71556f20b4a',
    name: 'Power Saver',
    description: 'Saves power by reducing system performance and screen brightness, helping laptops run longer on battery.',
    isActive: false,
    isHighPerformance: false,
    isBalanced: false,
    isPowerSaver: true,
    settings: makePowerSaverSettings(),
  },
];

export class PowerPlanManager {
  getPlans(): PowerPlan[] {
    return PLANS;
  }

  setActivePlan(guid: string): { success: boolean; message: string } {
    const plan = PLANS.find((p) => p.guid === guid);
    if (!plan) return { success: false, message: `Power plan ${guid} not found` };
    PLANS.forEach((p) => { p.isActive = false; });
    plan.isActive = true;
    return { success: true, message: `Switched to ${plan.name}` };
  }

  getReport(): PowerReport {
    return {
      activePlan: 'Balanced',
      batteryLifeRemaining: '2h 34m',
      estimatedBatteryLife: '3h 45m',
      estimatedBatteryLifeOptimized: '5h 12m',
    };
  }
}
