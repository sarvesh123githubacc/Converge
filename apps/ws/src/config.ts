if (!process.env.JWT_PASS) {
  throw new Error("JWT_PASS is not defined");
}

export const JWT_PASSWORD = process.env.JWT_PASS;