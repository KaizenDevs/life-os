export interface Group {
  id: number;
  name: string;
  group_type: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: number;
  name: string;
  category: { id: number; name: string };
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}
