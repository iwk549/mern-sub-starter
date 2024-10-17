enum UserRoles {
  owner = "Organization Owner",
  admin = "Organization Admin",
  standard = "User",
  readonly = "Read Only",
}

export function translateRole(role: string) {
  return UserRoles[role as keyof typeof UserRoles] || "Unknown Role";
}
