const supertest = require("supertest");
const server = require("../app.js");

before(done => {
  server.on("listened", done());
});

describe("GET /booking_com dir", function() {
  it("it should has status code 200", function(done) {
    supertest("http://localhost:3000")
      .get("/booking_com")
      .expect(200)
      .end(function(err, res) {
        if (err) done(err);
        done();
      });
  });
});

after(done => {
  done();
});
