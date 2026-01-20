# Chat App

A real-time chat application built with Next.js (client) and Express/Socket.IO (server).

## Project Structure

```
chat-app/
├── client/          # Next.js frontend
├── server/          # Express/Socket.IO backend
└── README.md
```

## Environment Setup

### Development Setup

1. **Install dependencies for all projects:**

   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**

   **Client (.env.local):**

   - Copy `client/env.local.txt` to `client/.env.local`
   - Update `NEXT_PUBLIC_SOCKET_SERVER_URL` if needed (defaults to `http://localhost:5002`)

   **Server (.env):**

   - Copy `server/env.development.txt` to `server/.env`
   - Update `PORT` and `CORS_ORIGIN` if needed

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This will start both client (port 3000) and server (port 5002) concurrently.

### Production Setup

1. **Build the client:**

   ```bash
   npm run build
   ```

2. **Configure production environment variables:**

   **Client:**

   - Copy `client/env.production.txt` to `client/.env.local`
   - Update `NEXT_PUBLIC_SOCKET_SERVER_URL` to your production server URL

   **Server:**

   - Copy `server/env.production.txt` to `server/.env`
   - Update `CORS_ORIGIN` to your production client URL
   - Update `PORT` if needed

3. **Start production servers:**
   ```bash
   npm start
   ```

## Environment Variables

### Client

| Variable                        | Description          | Default                 |
| ------------------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_SOCKET_SERVER_URL` | Socket.IO server URL | `http://localhost:5002` |

### Server

| Variable      | Description          | Default           |
| ------------- | -------------------- | ----------------- |
| `PORT`        | Server port          | `5002`            |
| `CORS_ORIGIN` | Allowed CORS origins | `*` (all origins) |
| `NODE_ENV`    | Environment mode     | `development`     |

## Available Scripts

### Root Level

- `npm run install:all` - Install dependencies for all projects
- `npm run dev` - Start both client and server in development
- `npm run build` - Build client for production
- `npm start` - Start both client and server in production

### Client (in client/ directory)

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Server (in server/ directory)

- `npm run dev` - Start with nodemon (auto-restart)
- `npm run start` - Start production server

## Development vs Production

### Development

- Hot reloading enabled
- CORS allows all origins (`*`)
- Client connects to `localhost:5002`
- Detailed error messages and logging

### Production

- Optimized builds
- Restricted CORS origins
- Client connects to production server URL
- Minimal error exposure
- Better performance

## Deployment Notes

1. **Environment Variables:** Never commit `.env` files to version control
2. **CORS:** In production, set `CORS_ORIGIN` to your actual client domain(s)
3. **HTTPS:** Use HTTPS in production for secure WebSocket connections
4. **Load Balancing:** If deploying server behind a load balancer, configure sticky sessions for Socket.IO

## Troubleshooting

- **Connection Issues:** Check that both client and server are running and environment variables are set correctly
- **CORS Errors:** Verify `CORS_ORIGIN` matches your client URL in production
- **Port Conflicts:** Ensure the configured ports are available
