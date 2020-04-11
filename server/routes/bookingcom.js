import express, { response } from "express";
import axios from "axios";
import cheerio from "cheerio";

const router = express.Router();

/* GET scrape values. */
router.get("/", (req, res, next) => {
  res.send("booking.com scrape");
});

export default router;
