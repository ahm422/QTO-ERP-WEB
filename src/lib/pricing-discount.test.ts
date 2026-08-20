import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { annualDiscountPercent } from "./pricing-discount";

describe("annualDiscountPercent", () => {
  it("derives seed Starter 29 → 24 as 17%", () => {
    assert.equal(annualDiscountPercent(29, 24), 17);
  });

  it("derives seed Growth 79 → 66 as 16%", () => {
    assert.equal(annualDiscountPercent(79, 66), 16);
  });

  it("derives seed Enterprise 149 → 124 as 17%", () => {
    assert.equal(annualDiscountPercent(149, 124), 17);
  });

  it("returns null when monthly is missing, zero, or non-finite", () => {
    assert.equal(annualDiscountPercent(null, 24), null);
    assert.equal(annualDiscountPercent(undefined, 24), null);
    assert.equal(annualDiscountPercent(0, 24), null);
    assert.equal(annualDiscountPercent(-10, 24), null);
    assert.equal(annualDiscountPercent(Number.NaN, 24), null);
    assert.equal(annualDiscountPercent(Number.POSITIVE_INFINITY, 24), null);
  });

  it("returns null when yearly is missing, zero, or non-finite", () => {
    assert.equal(annualDiscountPercent(29, null), null);
    assert.equal(annualDiscountPercent(29, undefined), null);
    assert.equal(annualDiscountPercent(29, 0), null);
    assert.equal(annualDiscountPercent(29, -5), null);
    assert.equal(annualDiscountPercent(29, Number.NaN), null);
    assert.equal(annualDiscountPercent(29, Number.POSITIVE_INFINITY), null);
  });

  it("returns null when yearly is not cheaper than monthly", () => {
    assert.equal(annualDiscountPercent(29, 29), null);
    assert.equal(annualDiscountPercent(29, 30), null);
  });

  it("never returns NaN or 0", () => {
    const cases: Array<[number | null | undefined, number | null | undefined]> =
      [
        [29, 24],
        [79, 66],
        [0, 0],
        [10, 0],
        [0, 10],
        [Number.NaN, 10],
        [10, Number.NaN],
        [null, 10],
        [10, undefined],
      ];
    for (const [monthly, yearly] of cases) {
      const result = annualDiscountPercent(monthly, yearly);
      assert.notEqual(Number.isNaN(result as number), true);
      assert.notEqual(result, 0);
    }
  });
});
