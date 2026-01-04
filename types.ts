
export type ProjectType = 'PYTHON' | 'HTML';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  price: number;
  description: string;
  longDescription: string;
  imageUrl: string;
  demoUrl?: string;
  features: string[];
}

export enum PurchaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED'
}

export interface Purchase {
  id: string;
  projectId: string;
  userId: string;
  userEmail: string;
  priceAtPurchase: number;
  status: PurchaseStatus;
  timestamp: number;
  projectName: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isAdmin: boolean;
}

export interface MarketplaceConfig {
  isBlackFriday: boolean;
  discountPercentage: number;
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  accentColor: string;
  contactEmail: string;
}

export interface Notification {
  id: string;
  subject: string;
  body: string;
  timestamp: number;
  isRead: boolean;
  recipient: string;
}

export interface AppState {
  projects: Project[];
  purchases: Purchase[];
  currentUser: User | null;
  config: MarketplaceConfig;
  notifications: Notification[];
}
