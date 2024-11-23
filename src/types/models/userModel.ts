export interface user {
  Email: string;
  Password: string;
  Orders: any[];
  Type: userType;
  Verify: boolean;
}

enum userType {
  CUSTOMER = "CUSTOMER",
  COLLABORATOR = "COLLABORATOR",
  ADMIN = "ADMIN",
}
