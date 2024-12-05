export interface user {
  Email: string;
  Password: string;
  Orders?: any[];
  Type: userType;
  Verify: boolean;
}

export enum userType {
  CUSTOMER = "CUSTOMER",
  COLLABORATOR = "COLLABORATOR",
  ADMIN = "ADMIN",
}

export enum stateType {
  PENDING = "PENDING",
  CAUGHT = "CAUGHT",
}
