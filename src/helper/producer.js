const { Kafka, logLevel } = require("kafkajs");
const kafka = new Kafka({
  brokers: ["localhost:9092"],
});
const producer = kafka.producer();

const run = async (type, record) => {
  // Producing
  console.log("running kafka =============+>");
  await producer.connect();
  switch (type) {
    case "time":
      await producer.send({
        topic: "time-topic",
        messages: [{ value: record }],
      });
      break;
    case "depth":
      await producer.send({
        topic: "depth-topic",
        messages: [{ value: record }],
      });
      break;
    default:
      break;
  }
};

module.exports = {
  run: run,
};
