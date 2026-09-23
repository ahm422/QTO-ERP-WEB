import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapWorkerResponse } from "./chat";

describe("mapWorkerResponse", () => {
  it("passes through 200 with the answer/sources body", () => {
    const body = { answer: "QTO ERP is an all-in-one platform.", sources: [] };
    const mapped = mapWorkerResponse(200, body, null);
    assert.equal(mapped.status, 200);
    assert.deepEqual(mapped.body, body);
  });

  it("passes through 400 as-is", () => {
    const mapped = mapWorkerResponse(400, { error: "Request rejected" }, null);
    assert.equal(mapped.status, 400);
    assert.deepEqual(mapped.body, { error: "Request rejected" });
  });

  it("passes through 413 as-is", () => {
    const mapped = mapWorkerResponse(413, { error: "too_long" }, null);
    assert.equal(mapped.status, 413);
  });

  it("passes through 500 as-is", () => {
    const mapped = mapWorkerResponse(500, { error: "Internal server error" }, null);
    assert.equal(mapped.status, 500);
  });

  it("passes through 429 and forwards retry-after", () => {
    const mapped = mapWorkerResponse(429, { error: "Too many requests" }, "12");
    assert.equal(mapped.status, 429);
    assert.equal(mapped.headers?.["retry-after"], "12");
  });

  it("omits the retry-after header when the Worker didn't send one", () => {
    const mapped = mapWorkerResponse(429, { error: "Too many requests" }, null);
    assert.equal(mapped.status, 429);
    assert.equal(mapped.headers?.["retry-after"], undefined);
  });

  it("maps the Worker's 401 (proxy-secret failure) to a generic 502, never leaking it", () => {
    const mapped = mapWorkerResponse(401, { error: "Unauthorized" }, null);
    assert.equal(mapped.status, 502);
    assert.notDeepEqual(mapped.body, { error: "Unauthorized" });
  });

  it("maps any other unexpected status to a generic 502", () => {
    const mapped = mapWorkerResponse(418, { error: "teapot" }, null);
    assert.equal(mapped.status, 502);
  });
});
