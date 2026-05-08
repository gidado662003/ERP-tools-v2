export type ModuleUI = {
  icon: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
};

export type Module = {
  key: string;
  name: string;
  description: string;
  href: string;
  allowedDepartments: string[];
  isActive: boolean;
  order: number;
  isSystem: boolean;
  ui: ModuleUI;
};
export type Activity = {
  type: string;
  text: string;
  label: string;
  createdAt: string;
  time: string;
};
export type Stats = {
  unreadMessages: number;
  requisitions: number;
  meetings: number;
  documents: number;
  suppliers: number;
  pendingActionItems: number;
};
export type ModuleListResponse = {
  userName: string;
  modules: Module[];
  activity: Activity[];
  stats: Stats;
};

export type ModuleResponse = {
  message: string;
  data: Module;
};
