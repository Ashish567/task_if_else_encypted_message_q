import express, { Express, Request, Response, query } from "express";
import { encodeText, decodeText, customLogger } from "./Utils";
import { DB } from "./DB";
const db = new DB();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const amqp = require("amqplib");
var channel: any, connection: any;

const exchange_name = "test-exchange";
const exchange_type = "direct";

connectQueue(); // call connectQueue function
async function connectQueue() {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();
    await channel.assertExchange(exchange_name, exchange_type, {
      durable: false,
    });
  } catch (error) {
    console.log(error);
  }
}

const sendMessageToQueue = async (message: String, queue_name: String) => {
  await channel.publish(exchange_name, queue_name, Buffer.from(message), {});
};

app.use(customLogger);
app.get(
  "/port/api/earth-mars-comm/message-logs",
  (req: Request, res: Response) => db.getLogs(res)
);

app.post("/port/api/earth-mars-comm/message", (req: Request, res: Response) => {
  let message = {} as any;
  let queue_name = "";
  if (
    req.headers["x-sender"] === "Earth" &&
    req.headers["x-reciever"] === "Mars"
  ) {
    queue_name = "mars-queue";
    message["Response From Earth"] = req.body.message;
    message["Nokia Translation"] = encodeText(req.body.message);
  } else if (
    req.headers["x-sender"] === "Mars" &&
    req.headers["x-reciever"] === "Earth"
  ) {
    queue_name = "earth-queue";
    message["Response From Mars"] = req.body.message;
    message["Nokia Translation"] = decodeText(req.body.message);
  }
  sendMessageToQueue(JSON.stringify(message), queue_name);

  db.saveLogs(message, req, res);
  console.log("Message sent to the exchange");
  res.send("Message Sent!");
});

const server = app.listen(PORT, () =>
  console.log("Server listening at port " + PORT)
);

process.on("unhandledRejection", async (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err);
  console.log(err.name, err.message);
  await channel.close();
  await connection.close();
  db.close();
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", async () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  await channel.close();
  await connection.close();
  db.close();
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
