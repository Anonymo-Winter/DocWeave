// server/realtime.js
export let ioRef = null;

// roomUsers is already in socket.js; we’ll inject it
export let roomUsersRef = null;

export function setRealtimeRefs({ io, roomUsers }) {
	ioRef = io;
	roomUsersRef = roomUsers;
}

export function emitToUserInRoom(roomId, userId, event, payload) {
	if (!ioRef || !roomUsersRef) return;

	const usersInRoom = roomUsersRef.get(roomId);
	const entry = usersInRoom?.get(String(userId));
	if (!entry) return;

	for (const socketId of entry.sockets) {
		const s = ioRef.sockets.sockets.get(socketId);
		if (s) s.emit(event, payload);
	}
}

export function setRoleForUserSockets(roomId, userId, role) {
	if (!ioRef || !roomUsersRef) return;

	const usersInRoom = roomUsersRef.get(roomId);
	const entry = usersInRoom?.get(String(userId));
	if (!entry) return;

	for (const socketId of entry.sockets) {
		const s = ioRef.sockets.sockets.get(socketId);
		if (s) s.data.role = role;
	}
}

export function kickUserFromRoom(roomId, userId, reason = "ACCESS_DENIED") {
	if (!ioRef || !roomUsersRef) return;

	const usersInRoom = roomUsersRef.get(roomId);
	const key = String(userId);
	const entry = usersInRoom?.get(key);
	if (!entry) return;

	for (const socketId of entry.sockets) {
		const s = ioRef.sockets.sockets.get(socketId);
		if (!s) continue;

		s.data.role = null;
		s.data.docId = null;

		s.emit("access-denied", { docId: roomId, reason });
		s.leave(roomId);
	}

	usersInRoom.delete(key);

	// 🔥 update active users for remaining clients
	ioRef.to(roomId).emit("active-users", usersInRoom ? Array.from(usersInRoom.values()).map((e) => e.user) : []);

	if (usersInRoom.size === 0) roomUsersRef.delete(roomId);
}
