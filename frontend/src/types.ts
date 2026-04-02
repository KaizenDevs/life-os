export interface Group {
  id: number;
  name: string;
  group_type: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Provider {
  id: number;
  name: string;
  category: Category;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LifeOsModule {
  id: number;
  name: string;
  key: string;
  enabled: boolean;
}

export interface GroupModule {
  id: number;
  enabled: boolean;
  module: LifeOsModule;
}

export interface Membership {
  id: number;
  role: string;
  accepted_at: string | null;
  user: { id: number; email: string };
  invited_by: { id: number; email: string } | null;
  created_at: string;
  updated_at: string;
}
