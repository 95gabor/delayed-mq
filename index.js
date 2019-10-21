const {connect} = require('amqplib');

const queue = process.env.QUEUE || 'test';
const exchange = process.env.EXCHANGE || 'delay-exchange';
const username = process.env.RABBITMQ_USERNAME || '';
const password = process.env.RABBITMQ_PASSWORD || '';
const host = process.env.RABBITMQ_HOST || 'localhost';
const port = +process.env.RABBITMQ_PORT || 5672;
const vhost = process.env.RABBITMQ_VHOST || 'default';


async function connectMQ() {
  const connection = await connect(`amqp://${username}:${password}@${host}:${port}/${vhost}`);
  const channel = await connection.createChannel();

  channel.assertQueue(queue);

  return channel;
}

async function publisher() {
  const channel = await connectMQ();

  channel.assertExchange(exchange, "x-delayed-message", {autoDelete: false, durable: true, passive: true,  arguments: {'x-delayed-type':  "direct"}});
  channel.bindQueue(queue, exchange, queue);

  await channel.publish(exchange, queue, Buffer.from('something to do'), {
    headers: { "x-delay": 5000 }
  });
  console.log('[PUBLISHER]', 'published');
}

async function consumer(idx) {
  const channel = await connectMQ();
  await channel.consume(queue, msg => {
    if (!msg) {
      return channel.reject(msg);
    }
    console.log('[CONSUMER]', idx, msg.content.toString());
    channel.ack(msg);
  });
  console.log('[CONSUMER]', idx, 'ready');
}

async function main(consumers = 3) {
  await Promise.all(Array(consumers).fill('').map((_, idx) => consumer(idx)));
  await publisher();
}

main().catch(err => console.error('[ERROR]', err));
