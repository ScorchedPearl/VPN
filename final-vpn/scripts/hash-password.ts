/**
 * Prints an ARCHIVE_PASSWORD_HASH value for .env.local.
 * Usage: npm run hash-password   (then type the password and press Enter)
 * The password is read from stdin so it never lands in shell history.
 */
import { hashPassword, MAX_PASSWORD_LENGTH } from "../src/utils/password.ts";

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", async () => {
  const password = input.replace(/\r?\n$/, "");
  if (password.length < 12 || password.length > MAX_PASSWORD_LENGTH) {
    console.error(`Use a password between 12 and ${MAX_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }
  console.log(`ARCHIVE_PASSWORD_HASH=${await hashPassword(password)}`);
});
