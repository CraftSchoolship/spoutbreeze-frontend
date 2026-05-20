import axiosInstance from "@/lib/axios";

export interface RecentUser {
  id: string;
  username: string;
  email: string;
  roles: string;
  created_at: string;
  is_active: boolean;
}

export interface RecentEvent {
  id: string;
  title: string;
  status: string;
  start_date: string;
  creator_id: string;
  created_at: string;
}

export interface RecentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

export interface RecentStream {
  id: string;
  stream_id: string;
  user_id: string;
  platform: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
}

export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  new_7d: number;
  new_30d: number;
  by_role: Record<string, number>;
  latest: RecentUser[];
}

export interface EventsStats {
  total: number;
  by_status: Record<string, number>;
  created_7d: number;
  created_30d: number;
  bbb_meetings_total: number;
  bbb_meetings_30d: number;
  latest: RecentEvent[];
}

export interface StreamingStats {
  sessions_total: number;
  sessions_24h: number;
  sessions_30d: number;
  active_now: number;
  by_platform: Record<string, number>;
  connections_by_provider: Record<string, number>;
  latest: RecentStream[];
}

export interface RevenueStats {
  subs_by_plan: Record<string, number>;
  subs_by_status: Record<string, number>;
  active_subscriptions: number;
  revenue_30d_usd: number;
  transactions_30d_count: number;
  failed_payments_7d: number;
  latest_transactions: RecentTransaction[];
}

export interface OrganizationStats {
  id: string | null;
  name: string;
  user_count: number;
  active_users: number;
  events_total: number;
  bbb_meetings_total: number;
  streams_30d: number;
  active_subscriptions: number;
  revenue_30d_usd: number;
}

export interface AnalyticsOverview {
  generated_at: string;
  users: UsersStats;
  events: EventsStats;
  streaming: StreamingStats;
  revenue: RevenueStats;
  organizations: OrganizationStats[];
}

// Filter value passed to fetchAdminAnalyticsOverview:
//   null         -> platform-wide (no filter)
//   "unassigned" -> users with no organization
//   <org uuid>   -> scope to that organization
export type OrgFilterValue = string | null;

export const fetchAdminAnalyticsOverview = async (
  organizationId: OrgFilterValue = null
): Promise<AnalyticsOverview> => {
  const params = organizationId ? { organization_id: organizationId } : undefined;
  const response = await axiosInstance.get<AnalyticsOverview>(
    "/api/admin/analytics/overview",
    { params }
  );
  return response.data;
};
