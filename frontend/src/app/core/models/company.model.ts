export interface HRContact {
  name: string;
  email: string;
  phone?: string;
  designation?: string;
}

export interface Company {
  _id: string;
  name: string;
  website?: string;
  industry: string;
  description?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  hrContacts?: HRContact[]; // Restricted to Admin role
  status: 'Active' | 'Inactive' | 'Blacklisted';
  createdAt?: string;
  updatedAt?: string;
}
