/**
 * Super Admins Configuration & Protection Utility
 * 
 * Defines immutable super-admin accounts that can never be demoted, deleted, or changed to regular/test users.
 */

export const PROTECTED_SUPER_ADMIN_IDS = [
  '07b2770b-adb4-48b3-916c-b6db28d67348',
  'a4e91e44-01e3-477f-8afa-a4ce7b3e33cf',
  '07b2770b',
  'a4e91e44',
] as const;

export const PROTECTED_SUPER_ADMIN_EMAILS = [
  'admin@growix.com',
  'belalkaram50@gmail.com',
] as const;

/**
 * Checks if a given user ID, prefix, or email belongs to a protected super-admin account.
 */
export function isProtectedSuperAdmin(userIdentifier?: string | null): boolean {
  if (!userIdentifier) return false;
  const val = userIdentifier.toLowerCase().trim();

  // 1. Match by full UUID or prefix (e.g. "07b2770b" or "a4e91e44")
  const isMatchById = PROTECTED_SUPER_ADMIN_IDS.some((id) => {
    const target = id.toLowerCase();
    return val === target || val.startsWith(target) || (target.length >= 8 && target.startsWith(val) && val.length >= 8);
  });

  if (isMatchById) return true;

  // 2. Match by email
  const isMatchByEmail = PROTECTED_SUPER_ADMIN_EMAILS.some((email) => val === email.toLowerCase());
  return isMatchByEmail;
}
