import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default {
	...defineCloudflareConfig({
		incrementalCache: r2IncrementalCache,
		queue: doQueue,
		tagCache: d1NextTagCache,
	}),
	// `npm run build` runs the OpenNext build (so Workers Builds always emits
	// `.open-next/`). OpenNext defaults to `npm run build` for the Next step,
	// which would recurse — point it at the plain `next build` script instead.
	buildCommand: "npm run build:next",
};
