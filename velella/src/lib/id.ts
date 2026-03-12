/**
 * Generates a stable UUID-like string for household members.
 * Used so yearly income can be keyed by id, not nickname.
 */
export function generateMemberId(): string {
  return crypto.randomUUID();
}
