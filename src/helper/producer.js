const {Kafka} = require('kafkajs');
const kafka = new Kafka({
    clientId: 'my-producer',
    brokers: ['localhost:9092']
  });
  const producer = kafka.producer();

  const run = async () => {
    // Producing
    console.log("running kafka =============+>")
    await producer.connect()
    await producer.send({
      topic: 'test-topic',
      messages: [
        { value: 'Hello KafkaJS user!' },
      ],
    })
}

run().catch(console.error)
