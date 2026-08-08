import { Router, type Request, type Response } from "express";
import crypto from "crypto";

const router = Router();

// Store connected SSE clients
let clients: { id: string; res: Response }[] = [];

// SSE Endpoint for the POS to connect to
router.get("/webhooks/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE

  // Send initial connected message
  res.write(`data: ${JSON.stringify({ type: "connected", message: "SSE connected" })}\n\n`);

  const clientId = crypto.randomUUID();
  clients.push({ id: clientId, res });

  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
  });
});

// Endpoint to simulate incoming Swiggy/Zomato orders
router.post("/webhooks/orders", (req: Request, res: Response) => {
  const { platform, customer_name, items, total } = req.body;

  if (!platform || !customer_name || !items || !total) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Create a structured order matching the POS expected format
  const incomingOrder = {
    id: crypto.randomUUID(),
    platform,
    customerName: customer_name,
    customerPhone: "Not Provided", // Typically masked by aggregators
    items: items.map((name: string, index: number) => ({
      id: crypto.randomUUID(),
      name,
      price: Math.round(total / items.length), // mock price
      quantity: 1,
      amount: Math.round(total / items.length),
    })),
    subtotal: total,
    discountType: "none",
    discountValue: 0,
    discountAmount: 0,
    total,
    paymentMethod: platform, // 'Swiggy' or 'Zomato'
    createdAt: new Date().toISOString(),
  };

  // Broadcast to all connected POS clients
  clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify({ type: "new_order", order: incomingOrder })}\n\n`);
  });

  return res.status(200).json({ success: true, message: "Webhook received and broadcasted", orderId: incomingOrder.id });
});

export default router;
