import express, { Express, Request, Response } from "express";
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

const amqp = require("amqplib");
var channel: any, connection: any;

const exchange_name = "test-exchange";
const exchange_type = "direct";
const queue_name = "mars-queue";

connectToRabbitMQ();
async function connectToRabbitMQ() {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();

    connectToQueue();
  } catch (error) {
    console.log(error);
  }
}

async function connectToQueue() {
  await channel.assertExchange(exchange_name, exchange_type, {
    durable: false,
  });

  const q = await channel.assertQueue(queue_name, { exclusive: true });

  console.log("Waiting for messages....");

  // binding the queue
  const binding_key = "";
  channel.bindQueue(q.queue, exchange_name, queue_name);

  console.log("consuming messages from queue: ", q.queue);
  channel.consume(q.queue, (msg: any) => {
    if (msg.content) console.log("Received message: ", msg.content.toString());
    channel.ack(msg);
  });
}

app.listen(PORT, () => console.log("Server running at port " + PORT));
