export interface MeetingPreview {
  _id: string;
  title: string;
  date: string;
  department: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export interface MeetingPreviewResponse {
  meetings: MeetingPreview[];
  nextCursor: string | null;
}

export type ActionItemStatus = "pending" | "completed";

// export interface ActionItem {
//   _id: string;
//   meetingId: string;
//   desc: string;
//   owner: string;
//   due: string; // ISO date string
//   status: ActionItemStatus;
//   createdAt: string;
//   updatedAt: string;
// }

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

// export interface Meeting {
//   _id: string;
//   title: string;
//   department: string;
//   date: string; // ISO date string
//   attendees: string[];
//   agenda?: string;
//   minutes?: string;
//   actionItems: ActionItem[]; // when NOT populated
//   status: MeetingStatus;
//   createdAt: string;
//   updatedAt: string;
// }

export type Owner = { user: string; username: string; _id: string };

export type ActionItem = {
  _id: string;
  desc: string;
  owner: Owner[];
  due: string;
  status: string;
  penalty?: string;
  createdAt: string;
};

export type Meeting = {
  _id: string;
  title: string;
  department: string;
  date: string;
  attendees: Owner[];
  status: string;
};

export type DeptBreakdown = {
  department: string;
  meetingCount: number;
  totalActions: number;
  completedActions: number;
  overdueActions: number;
};

export type TopOwner = {
  _id: string;
  overdueCount: number;
  penaltyCount: number;
};

export type DashboardData = {
  meetings: number;
  actions: { total: number; completed: number; overdue: number };
  topOwners: TopOwner[];
  departmentBreakdown: DeptBreakdown[];
  recentActivity: {
    meetings: Meeting[];
    actionItems: ActionItem[];
  };
};
