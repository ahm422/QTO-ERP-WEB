import { roles } from "../src/db/enums";
import type { Role } from "../src/db/enums";
import {
  ROLE_PERMISSIONS,
  capabilities,
  hasCapability,
  type Capability,
} from "../src/lib/permission-matrix";

const expected: Record<Role, ReadonlySet<Capability>> = {
  SUPER_ADMIN: new Set(capabilities),
  ADMIN: new Set([
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "settings:edit",
  ]),
  EDITOR: new Set(["content:view", "content:create", "content:edit"]),
};

function main() {
  let failures = 0;

  for (const role of roles) {
    for (const capability of capabilities) {
      const got = hasCapability(role, capability);
      const want = expected[role].has(capability);
      if (got !== want) {
        console.error(`${role} × ${capability}: expected ${want}, got ${got}`);
        failures += 1;
      }
    }

    const listed = ROLE_PERMISSIONS[role];
    if (listed.length !== expected[role].size) {
      console.error(`${role}: ROLE_PERMISSIONS length mismatch`);
      failures += 1;
    }
    for (const cap of listed) {
      if (!expected[role].has(cap)) {
        console.error(
          `${role}: unexpected capability ${cap} in ROLE_PERMISSIONS`,
        );
        failures += 1;
      }
    }
  }

  if (failures > 0) {
    console.error(`${failures} permission matrix check(s) failed.`);
    process.exit(1);
  }

  console.log("All permission matrix checks passed.");
}

main();
