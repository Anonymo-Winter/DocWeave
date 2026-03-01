// server/socket.js
import { Server } from "socket.io";
import * as Y from "yjs";
import jwt from "jsonwebtoken";
import Document from "./models/document.model.js";
import mongoose from "mongoose";
import { resolveUserRole } from "./controllers/doc.controller.js";
import { setRealtimeRefs } from "./realtime.js";

const tailwindBaseHexColors = [
  "#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981",
  "#14b8a6","#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7",
  "#d946ef","#ec4899","#f43f5e","#9ca3af",
];

function hashStringToIndex(str, arrayLength) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % arrayLength;
}

const docsMap = new Map();  // roomId -> { doc: Y.Doc }
const roomUsers = new Map(); // roomId -> Map(userId -> { user, sockets:Set })

function toUint8(update) {
  if (!update) return null;
  if (update instanceof Uint8Array) return update;
  if (update instanceof ArrayBuffer) return new Uint8Array(update);
  if (update?.type === "Buffer" && Array.isArray(update.data)) return Uint8Array.from(update.data);
  if (Array.isArray(update)) return Uint8Array.from(update);
  return null;
}

export function setupSocketIo(server) {
  const io = new Server(server, {
    // ⚠️ If you use credentials, don’t use '*' in production.
    cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
  });

  setRealtimeRefs({ io, roomUsers });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication Error"));
    try {
      socket.user = jwt.verify(token, process.env.JWT_KEY);
      next();
    } catch {
      next(new Error("Authentication Error"));
    }
  });

  io.on("connection", (socket) => {
    const authedUser = socket.user;
    const authedUserId = authedUser?.id ? String(authedUser.id) : null;
    const authedName = authedUser?.name || "Unknown";

    console.log("[User Connected]:", authedName);

    const getRoomState = (roomId) => {
      if (!docsMap.has(roomId)) {
        const doc = new Y.Doc();
        doc.getXmlFragment("default");
        docsMap.set(roomId, { doc });
      }
      return docsMap.get(roomId);
    };

    const emitActiveUsers = (roomId) => {
      const usersInRoom = roomUsers.get(roomId);
      io.to(roomId).emit(
        "active-users",
        usersInRoom ? Array.from(usersInRoom.values()).map((e) => e.user) : [],
      );
    };

    const handleLeaveRoom = (roomId) => {
      if (!roomId) return;

      const userId = socket.data.userId;
      const userName = socket.data.userName;

      if (roomUsers.has(roomId) && userId) {
        const usersInRoom = roomUsers.get(roomId);
        const entry = usersInRoom.get(userId);

        if (entry) {
          entry.sockets.delete(socket.id);
          if (entry.sockets.size === 0) usersInRoom.delete(userId);
        }

        if (entry && entry.sockets.size === 0) {
          socket.to(roomId).emit("message-notification", {
            roomId,
            type: "system",
            message: `${userName} has left the document`,
            sentAt: Date.now(),
          });
        }

        if (usersInRoom.size === 0) roomUsers.delete(roomId);
        emitActiveUsers(roomId);
      }

      socket.leave(roomId);

      if (io.sockets.adapter.rooms.get(roomId)?.size === 0) {
        docsMap.delete(roomId);
      }

      // Clear socket room state
      if (socket.data.docId === roomId) {
        socket.data.docId = null;
        socket.data.role = null;
      }
    };

    // Must be in room + have role (for reads)
    const getCtx = () => {
      const roomId = socket.data.docId;
      const role = socket.data.role; // "OWNER"|"EDITOR"|"VIEWER"|null
      if (!roomId) return null;
      if (!socket.rooms.has(roomId)) return null; // ✅ membership guard
      if (!role) return null; // ✅ read guard
      return { roomId, role };
    };

    // =========================
    // JOIN ROOM
    // =========================
    socket.on("join-room", async ({ roomId, clientID }, callback = () => {}) => {
      try {
        if (!roomId || typeof clientID !== "number" || !authedUserId) {
          callback({ error: "Invalid join-room payload" });
          return;
        }

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          callback({ error: "Invalid room ID" });
          return;
        }

        // Resolve role from server-side identity only
        const role = await resolveUserRole({ userId: authedUserId, docId: roomId });
        if (!role) {
          socket.emit("error", "ACCESS_DENIED");
          callback({ error: "ACCESS_DENIED" });
          return;
        }

        // leave previous doc if switching
        if (socket.data.docId && socket.data.docId !== roomId) {
          handleLeaveRoom(socket.data.docId);
        }

        socket.join(roomId);

        socket.data.docId = roomId;
        socket.data.role = role;
        socket.data.userId = authedUserId;
        socket.data.userName = authedName;

        const docMeta = await Document.findById(roomId);
        if (!docMeta) {
          socket.emit("error", "ROOM_NOT_FOUND");
          callback({ error: "ROOM_NOT_FOUND" });
          return;
        }

        // ensure Map exists + consistent key type
        if (!docMeta.userColors) docMeta.userColors = new Map();
        const key = authedUserId;

        let assignedColor = docMeta.userColors.get(key);
        if (!assignedColor) {
          const colorIndex = hashStringToIndex(key + roomId, tailwindBaseHexColors.length);
          assignedColor = tailwindBaseHexColors[colorIndex];
          docMeta.userColors.set(key, assignedColor);
          await docMeta.save();
        }

        // Track active users (server-trusted identity)
        if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
        const usersInRoom = roomUsers.get(roomId);

        if (!usersInRoom.has(key)) {
          usersInRoom.set(key, {
            user: { id: key, name: authedName, color: assignedColor },
            sockets: new Set(),
          });
        }

        usersInRoom.get(key).sockets.add(socket.id);

        emitActiveUsers(roomId);

        // Send doc state
        const { doc } = getRoomState(roomId);
        socket.emit("sync", Buffer.from(Y.encodeStateAsUpdate(doc)));
        socket.emit("assign-color", { color: assignedColor });

        callback({ color: assignedColor, role });
      } catch (e) {
        console.error("join-room error:", e);
        callback({ error: "join-room failed" });
      }
    });

    socket.on("disconnecting", () => {
      if (socket.data.docId) handleLeaveRoom(socket.data.docId);
    });

    // =========================
    // DOC UPDATES (write guarded)
    // =========================
    socket.on("update", (update) => {
      const ctx = getCtx();
      if (!ctx) return;

      if (ctx.role !== "EDITOR" && ctx.role !== "OWNER") {
        socket.emit("permission-denied", { action: "edit", role: ctx.role });
        return;
      }
      console.log("update from user name : ",authedName );
      try {
        const u8 = toUint8(update);
        if (!u8) return;

        const { doc } = getRoomState(ctx.roomId);
        Y.applyUpdate(doc, u8);

        socket.to(ctx.roomId).emit("update", Buffer.from(u8));
      } catch (e) {
        console.error("Error applying document update:", e);
      }
    });

    // =========================
    // SYNC (read guarded)
    // =========================
    socket.on("request-sync", (stateVector) => {
      const ctx = getCtx();
      if (!ctx) return;

      try {
        const { doc } = getRoomState(ctx.roomId);
        const sv = toUint8(stateVector);
        const diff = sv ? Y.encodeStateAsUpdate(doc, sv) : Y.encodeStateAsUpdate(doc);
        socket.emit("sync-update", Buffer.from(diff));
      } catch (e) {
        console.error("request-sync error:", e);
      }
    });

    socket.on("sync", () => {
      const ctx = getCtx();
      if (!ctx) return;

      try {
        const { doc } = getRoomState(ctx.roomId);
        socket.emit("sync", Buffer.from(Y.encodeStateAsUpdate(doc)));
      } catch (e) {
        console.error("sync error:", e);
      }
    });

    // =========================
    // AWARENESS (relay, but membership/read guarded)
    // =========================
    socket.on("awareness-update", (update) => {
      const ctx = getCtx();
      if (!ctx) return;

      // Optional: block viewers from sending awareness if you want
      // if (ctx.role === "VIEWER") return;

      socket.to(ctx.roomId).emit("awareness-update", update);
    });

    // =========================
    // CHAT (room + identity guarded)
    // =========================
    socket.on("message", (data, callback = () => {}) => {
      try {
        const ctx = getCtx();
        if (!ctx) {
          callback({ status: "error", error: "Not in a room" });
          return;
        }

        const message = data?.message;
        if (!message) {
          callback({ status: "error", error: "Invalid Message" });
          return;
        }

        // Server-trusted sender
        const payload = {
          roomId: ctx.roomId,
          message,
          senderUserId: authedUserId,
          user: { id: authedUserId, name: authedName },
          sentAt: Date.now(),
        };

        socket.to(ctx.roomId).emit("message", payload);
        callback({ status: "ok", receivedAt: Date.now() });
      } catch (err) {
        console.error("[Server Error]", err);
        callback({ status: "error", error: "Internal server error" });
      }
    });

    socket.on("message-notification", (data) => {
      const ctx = getCtx();
      if (!ctx) return;

      const message = data?.message;
      if (!message) return;

      // Prevent arbitrary-room spam; only current room
      socket.to(ctx.roomId).emit("message-notification", {
        roomId: ctx.roomId,
        message,
        sentAt: Date.now(),
      });
    });

    socket.on("leave-room", () => {
      if (socket.data.docId) handleLeaveRoom(socket.data.docId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", authedName);
      if (socket.data.docId) handleLeaveRoom(socket.data.docId);
    });
  });
}
