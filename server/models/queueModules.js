import PQueue from "p-queue";

const queue = new PQueue({
  concurrency: 1,
  carryoverConcurrencyCount: true,
  interval: 60000,
  intervalCap: 1
});
module.exports = queue;
