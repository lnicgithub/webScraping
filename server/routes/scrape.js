import express, { response } from "express";
import axios from "axios";
import cheerio from "cheerio";

const router = express.Router();

/* GET scrape values. */
router.get("/", (req, res, next) => {
  res.send("scrape site");
});

export default router;
