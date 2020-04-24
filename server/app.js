// app.js
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index";
import scrapeRouter from "./routes/scrape";

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/index", indexRouter);
app.use("/scrape", scrapeRouter);
app.set("port", process.env.PORT || 3000);
app.set("chromePath", process.env.CHROME_BIN || "");
global.chromePath = app.get("chromePath");
module.export = app;
app.listen(app.get("port"), () => {
  app.emit("listened", null);
  console.log(`Server started at: http://localhost:${app.get("port")}`);
});
