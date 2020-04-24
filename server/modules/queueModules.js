import PQueue from "p-queue";

const intervalBetweenCallsMs = 60000;

const queue = new PQueue({
  concurrency: 1,
  carryoverConcurrencyCount: true,
  interval: intervalBetweenCallsMs,
  intervalCap: 1
});
module.exports = queue;
