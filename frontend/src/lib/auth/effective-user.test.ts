import { describe, expect, mock, test } from "bun:test";
import type { User } from "@/lib/db/schema";
import { resolveEffectiveUser } from "./effective-user";

const admin = { id: "admin", isAdmin: true } as User;
const customer = {
  id: "customer",
  isAdmin: false,
  organization: { id: "customer-organization" },
} as User;

describe("resolveEffectiveUser", () => {
  test("uses invoice owner's identity and wallet during admin impersonation", async () => {
    const loadUser = mock(async () => customer);
    const user = await resolveEffectiveUser(admin, customer.id, loadUser);

    expect(user.id).toBe(customer.id);
    expect(user.organization).toBe(customer.organization);
    expect(user.impersonatedBy).toBe(admin.id);
    expect(loadUser).toHaveBeenCalledWith(customer.id);
    expect(customer.impersonatedBy).toBeUndefined();
  });

  test("ignores impersonation cookie for a non-admin", async () => {
    const loadUser = mock(async () => admin);
    expect(await resolveEffectiveUser(customer, admin.id, loadUser)).toBe(
      customer
    );
    expect(loadUser).not.toHaveBeenCalled();
  });

  test("keeps principal when cookie is absent or points to self", async () => {
    const loadUser = mock(async () => customer);
    expect(await resolveEffectiveUser(admin, undefined, loadUser)).toBe(admin);
    expect(await resolveEffectiveUser(admin, admin.id, loadUser)).toBe(admin);
    expect(loadUser).not.toHaveBeenCalled();
  });

  test("keeps principal when target is missing or has no organization", async () => {
    expect(
      await resolveEffectiveUser(admin, customer.id, async () => null)
    ).toBe(admin);
    expect(
      await resolveEffectiveUser(
        admin,
        customer.id,
        async () => ({ ...customer, organization: null }) as unknown as User
      )
    ).toBe(admin);
  });
});
