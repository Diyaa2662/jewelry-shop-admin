export const STATIC_ADMIN = {
  username: "admin",
  password: "admin123",
  user: {
    id: 0,
    name: "Admin",
    username: "admin",
    email: "admin@farfasha.com",
  },
};

// تحقق بسيط — يرجّع user أو null
export function verifyCredentials(username, password) {
  if (
    username.trim() === STATIC_ADMIN.username &&
    password === STATIC_ADMIN.password
  ) {
    return STATIC_ADMIN.user;
  }
  return null;
}
