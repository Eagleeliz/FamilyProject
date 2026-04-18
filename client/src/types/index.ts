export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  description: string | null;
  rootPersonId: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  rootPerson?: Person;
  memberCount?: number;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  profileImageUrl: string | null;
  familyId: string | null;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  familyName?: string;
}

export interface Relationship {
  id: string;
  personId: string;
  relatedPersonId: string;
  relationshipType: 'parent' | 'child' | 'sibling' | 'spouse';
  createdBy: string;
  createdAt: string;
}

export interface TreeNode {
  person: Person;
  children: TreeNode[];
  parents: TreeNode[];
  siblings: Person[];
  spouse: Person | null;
  level: number;
}

export interface CousinResult {
  degree: number;
  cousins: Person[];
}

export interface Relatives {
  parents: Person[];
  children: Person[];
  siblings: Person[];
  spouses: Person[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    expiresIn: string;
  };
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalFamilies: number;
  approvedFamilies: number;
  pendingFamilies: number;
  totalPersons: number;
  approvedPersons: number;
  pendingPersons: number;
  recentSignups: { date: string; count: number }[];
  recentFamilies: { date: string; count: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'join_request' | 'member_approved' | 'member_rejected' | 'family_invite';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}
