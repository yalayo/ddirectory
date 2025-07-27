import { Container, getRandom } from "@cloudflare/containers";

export class Backend extends Container {
	defaultPort = 5000; // pass requests to port 5000 in the container
	sleepAfter = "1h"; // only sleep a container if it hasn't gotten requests in 2 hours
}

export interface Env {
	BACKEND: DurableObjectNamespace<Backend>;
}

const INSTANCE_COUNT = 2;

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api")) {
			// note: "getRandom" to be replaced with latency-aware routing in the near future
			// this is a temporary helper
			const containerInstance = await getRandom(env.BACKEND, INSTANCE_COUNT);
			return containerInstance.fetch(request);
		}
		return new Response("Not Found", { status: 404 });
	},
};