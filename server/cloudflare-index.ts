// Cloudflare Workers entry point for D Directory
import type { Env } from './d2-db';
import { initializeDatabase } from './d2-db';
import { D2Storage } from './d2-storage';
import { registerCloudflareRoutes } from './cloudflare-routes';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Initialize database connection
      const db = initializeDatabase(env.DB);
      
      // Initialize storage
      const storage = new D2Storage();
      
      // Create a simple Express-like app for Cloudflare Workers
      const app = new CloudflareApp(storage, env);
      
      // Register routes
      await registerCloudflareRoutes(app);
      
      // Handle the request
      return await app.handleRequest(request);
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

// Simple Express-like application for Cloudflare Workers
class CloudflareApp {
  private routes: Map<string, (request: Request, params: Record<string, string>) => Promise<Response>> = new Map();
  
  constructor(public storage: D2Storage, public env: Env) {}
  
  get(path: string, handler: (request: Request, params: Record<string, string>) => Promise<Response>) {
    this.routes.set(`GET:${path}`, handler);
  }
  
  post(path: string, handler: (request: Request, params: Record<string, string>) => Promise<Response>) {
    this.routes.set(`POST:${path}`, handler);
  }
  
  put(path: string, handler: (request: Request, params: Record<string, string>) => Promise<Response>) {
    this.routes.set(`PUT:${path}`, handler);
  }
  
  delete(path: string, handler: (request: Request, params: Record<string, string>) => Promise<Response>) {
    this.routes.set(`DELETE:${path}`, handler);
  }
  
  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;
    
    // Handle CORS
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Find matching route
    for (const [routeKey, handler] of this.routes) {
      const [routeMethod, routePath] = routeKey.split(':');
      
      if (method === routeMethod) {
        const params = this.matchRoute(pathname, routePath);
        if (params !== null) {
          try {
            const response = await handler(request, params);
            
            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            return response;
          } catch (error) {
            console.error('Route handler error:', error);
            return Response.json({ message: 'Internal server error' }, { status: 500 });
          }
        }
      }
    }
    
    // Serve static files or return 404
    if (pathname === '/' || pathname.startsWith('/static/')) {
      return this.serveStatic(pathname);
    }
    
    return Response.json({ message: 'Not found' }, { status: 404 });
  }
  
  private matchRoute(pathname: string, routePath: string): Record<string, string> | null {
    const pathParts = pathname.split('/').filter(Boolean);
    const routeParts = routePath.split('/').filter(Boolean);
    
    if (pathParts.length !== routeParts.length) return null;
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const pathPart = pathParts[i];
      
      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = pathPart;
      } else if (routePart !== pathPart) {
        return null;
      }
    }
    
    return params;
  }
  
  private async serveStatic(pathname: string): Promise<Response> {
    // For now, return a simple HTML page
    // In production, you'd serve the built React app
    if (pathname === '/') {
      return new Response(/* HTML content */, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    return Response.json({ message: 'Static file not found' }, { status: 404 });
  }
}