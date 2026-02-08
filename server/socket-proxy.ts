import { Server as HttpServer } from "node:http";
import { Server as SocketServer } from "socket.io";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import { getAuthHeaders, getTenantId } from "./ecosystem-client";

let upstreamSocket: ClientSocket | null = null;
let ioServer: SocketServer | null = null;

const UPSTREAM_URL = "https://paintpros.io";
const UPSTREAM_PATH = "/socket.io";

export function setupSocketProxy(httpServer: HttpServer): SocketServer {
  ioServer = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/ws",
  });

  connectUpstream();

  ioServer.on("connection", (clientSocket) => {
    const tenantId = getTenantId();
    console.log(`[Socket] Client connected: ${clientSocket.id}, tenant: ${tenantId}`);

    clientSocket.emit("connected", { tenantId, status: "ok" });

    clientSocket.on("send-message", (data) => {
      if (upstreamSocket?.connected) {
        upstreamSocket.emit("send-message", { ...data, tenantId });
      }
      ioServer?.emit("new-message", { ...data, tenantId, timestamp: new Date().toISOString() });
    });

    clientSocket.on("join-room", (room: string) => {
      clientSocket.join(room);
      console.log(`[Socket] ${clientSocket.id} joined room: ${room}`);
    });

    clientSocket.on("leave-room", (room: string) => {
      clientSocket.leave(room);
      console.log(`[Socket] ${clientSocket.id} left room: ${room}`);
    });

    clientSocket.on("typing", (data) => {
      clientSocket.broadcast.emit("user-typing", { ...data, tenantId });
    });

    clientSocket.on("disconnect", (reason) => {
      console.log(`[Socket] Client disconnected: ${clientSocket.id}, reason: ${reason}`);
    });
  });

  console.log("[Socket] Socket.IO proxy initialized on /ws");
  return ioServer;
}

function connectUpstream() {
  try {
    const headers = getAuthHeaders();
    upstreamSocket = ioClient(UPSTREAM_URL, {
      path: UPSTREAM_PATH,
      transports: ["websocket", "polling"],
      extraHeaders: {
        Authorization: headers["Authorization"],
        "X-App-Name": headers["X-App-Name"],
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
    });

    upstreamSocket.on("connect", () => {
      console.log("[Socket] Connected to upstream PaintPros.io");
      upstreamSocket?.emit("register", { tenantId: getTenantId(), app: "TrustHome" });
    });

    upstreamSocket.on("new-message", (data) => {
      ioServer?.emit("new-message", data);
    });

    upstreamSocket.on("notification", (data) => {
      ioServer?.emit("notification", data);
    });

    upstreamSocket.on("lead-update", (data) => {
      ioServer?.emit("lead-update", data);
    });

    upstreamSocket.on("job-update", (data) => {
      ioServer?.emit("job-update", data);
    });

    upstreamSocket.on("connect_error", (err) => {
      console.warn(`[Socket] Upstream connection error: ${err.message}`);
    });

    upstreamSocket.on("disconnect", (reason) => {
      console.log(`[Socket] Upstream disconnected: ${reason}`);
    });
  } catch (err) {
    console.warn("[Socket] Failed to connect to upstream:", err);
  }
}

export function getSocketServer(): SocketServer | null {
  return ioServer;
}
