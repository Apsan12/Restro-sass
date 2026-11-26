import { io } from "socket.io-client";

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjA4NWY1MTUzZWRmZmFiNzBiYzM2YzEiLCJyb2xlIjoiS0lUQ0hFTl9TVEFGRiIsInJlc3RhdXJhbnRJZCI6IjZiMDU5YjQ1ZjM4ZGY1OGQxNWE4OTZlYSIsImlhdCI6MTc5NTcxMDgyNywiZXhwIjoxNzk1NzExNzI3fQ.Owv8RupXoBQctC_-2rcBmoea8jCVhF03uxEZAgjjmdQ"; // Replace with a valid access token 
const socket = io("http://localhost:5001", {
  transports: ["websocket"],
  auth: {
    token: accessToken,
  },
});

socket.on("connect", () => {
  console.log("Connected to Socket.IO:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("order:created", (order) => {
  console.log("🔥 ORDER CREATED:", order);
});

socket.on("order:status_updated", (order) => {
  console.log("🔄 ORDER STATUS UPDATED:", order);
});

socket.on("order:cancelled", (order) => {
  console.log("❌ ORDER CANCELLED:", order);
});

socket.on("kitchen:order_status_updated", (order) => {
  console.log(
    "🍳 KITCHEN ORDER STATUS UPDATED:",
    order
  );
});