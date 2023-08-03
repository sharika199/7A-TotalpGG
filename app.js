const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3007, () =>
      console.log("Server Running at http://localhost:3007/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//1 Get Books API

const qq = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
app.get("/players/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      player_details;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray.map((state) => qq(state)));
});

//2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
    player_details
    WHERE
      player_id=${playerId};`;
  const booksArray = await db.get(getBooksQuery);
  response.send(qq(booksArray));
});

//3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const updateBookQuery = `
    UPDATE
      player_details
    SET
      player_name='${playerName}'
     
    WHERE
      player_id = ${playerId};`;

  await db.run(updateBookQuery);
  response.send("Player Details Updated");
});

//4

const matchD = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getBooksQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE
    match_id=${matchId};`;
  const booksArray = await db.get(getBooksQuery);
  response.send(matchD(booksArray));
});

//5

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getBook = `
  SELECT 
  *
   FROM
  player_match_score
   NATURAL JOIN 
   match_details
    WHERE
     player_id=${playerId};`;
  const book = await db.all(getBook);
  response.send(book.map((eachMatch) => matchD(eachMatch)));
});

//6

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getBook = `
  SELECT 
  *
   FROM
  player_match_score
   NATURAL JOIN 
   player_details
    WHERE
     match_id=${matchId};`;
  const book = await db.all(getBook);
  response.send(book.map((eachMatch) => qq(eachMatch)));
});

//7

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getBook = `
  SELECT 
    player_id AS playerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
   FROM
  player_match_score
   NATURAL JOIN 
   player_details
    WHERE
     player_id=${playerId};`;
  const book = await db.get(getBook);
  response.send(book);
});

module.exports = app;
