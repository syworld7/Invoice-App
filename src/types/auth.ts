export interface User {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Company {
  companyID: number;
  companyName: string;
  currencySymbol: string;
}

export interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  logoUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, company: Company, rememberMe: boolean) => void;
  logout: () => void;
  updateCompanyDetails: (newCompany: Company) => void;
  refreshLogo: () => Promise<void>;
}
