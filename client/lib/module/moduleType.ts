export type ModuleUI = {
  icon: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
};

export type Department = {
  name: string;
};

export type Module = {
  key: string;
  name: string;
  description: string;
  href: string;
  allowedDepartments: Department[] | string[];
  isActive: boolean;
  order: number;
  isSystem: boolean;
  ui: ModuleUI;
};

export type ModuleListResponse = {
  userName: string;
  modules: Module[];
};

export type ModuleResponse = {
  message: string;
  data: Module;
};
