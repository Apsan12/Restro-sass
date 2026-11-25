import { io } from "socket.io-client";

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YjA1OWI0NWYzOGRmNThkMTVhODk2ZWIiLCJyb2xlIjoiQlVTSU5FU1NfQURNSU4iLCJyZXN0YXVyYW50SWQiOiI2YjA1OWI0NWYzOGRmNThkMTVhODk2ZWEiLCJpYXQiOjE3OTU2MTcyNTEsImV4cCI6MTc5NTYxODE1MX0.CF7AiU3M5A5aSPB1IMHxFRWRQtBbofFV_1U4xVEgI2Q"

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