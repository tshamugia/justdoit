export type EventStatus = "pending" | "happening" | "at_risk" | "expired";
export type RsvpStatus = "in" | "maybe";
export type MemberRole = "owner" | "admin" | "member";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  is_default: boolean;
}

export interface Membership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role: MemberRole;
  joined_at: string;
}

export interface Event {
  id: string;
  workspace_id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_time: string;
  min_attendees: number;
  max_attendees: number | null;
  status: EventStatus;
  category: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  created_at: string;
  updated_at: string;
}

export interface EventWithCounts extends Event {
  in_count: number;
  maybe_count: number;
  current_user_rsvp: RsvpStatus | null;
  creator_name: string;
  creator_avatar: string | null;
}
