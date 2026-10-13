import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createGalleryServer } from "../server.mjs";

const examples = ["raptor-engine", "ripple-tank", "desk-computer", "arcade-cabinet", "dial-indicator", "turning-dial"];

async function withServer(check) {
  const server = createGalleryServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await check(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("gallery includes six original examples in both themes", async () => {
  const script = await readFile(new URL("../gallery.js", import.meta.url), "utf8");
  for (const id of examples) {
    assert.ok(script.includes(`id: "${id}"`));
    for (const suffix of ["", "-light"]) {
      const page = await readFile(new URL(`../examples/${id}/${id}${suffix}.html`, import.meta.url), "utf8");
      assert.match(page, /<svg/);
    }
  }
});

test("server serves gallery and original examples with correct content types", () => withServer(async (base) => {
  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.match(await home.text(), /lang="ru"/);
  for (const id of examples) {
    const response = await fetch(`${base}/examples/${id}/${id}-light.html`);
    assert.equal(response.status, 200);
  }
  const script = await fetch(`${base}/gallery.js`);
  assert.match(script.headers.get("content-type"), /javascript/);
}));

test("server rejects private files and traversal without leaking source", () => withServer(async (base) => {
  for (const path of ["/.git/config", "/.env", "/server.mjs", "/scripts/gallery.test.mjs", "/%2e%2e%5cREADME.md", "/examples/%2e%2e/%2e%2e/.git/config"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
  }
}));

test("server handles missing files and unsupported methods", () => withServer(async (base) => {
  assert.equal((await fetch(`${base}/missing.html`)).status, 404);
  assert.equal((await fetch(base, { method: "POST" })).status, 405);
  const head = await fetch(base, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
}));

test("server serves image assets used by the gallery", () => withServer(async (base) => {
  const response = await fetch(`${base}/.github/assets/raptor-engine-firing.webp`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/webp");
}));
