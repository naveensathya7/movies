const path = require("path");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertMoviesListCase = (dbRes) => {
  return {
    movieName: dbRes.movie_name,
  };
};
//GET movies API

app.get("/movies/", async (request, response) => {
  const searchMoviesQuery = `SELECT movie_name FROM movie`;
  const dbResult = await db.all(searchMoviesQuery);
  response.send(dbResult.map((each) => convertMoviesListCase(each)));
});

//Add new movie in the table
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}')`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET movie in the table API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const searchMoviesQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const dbResult = await db.get(searchMoviesQuery);

  response.send(convertDbObjectToResponseObject(dbResult));
});

//UPDATE movie details in the table
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateQuery = `UPDATE movie SET director_id='${directorId}',
        movie_name='${movieName}',lead_actor='${leadActor}'
        WHERE movie_id=${movieId}
        `;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//DELETE  a movie in table API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

const convertDirectorsCase = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

//
app.get("/directors/", async (request, response) => {
  const searchMoviesQuery = `SELECT * FROM director `;
  const dbResult = await db.all(searchMoviesQuery);

  response.send(dbResult.map((eachObj) => convertDirectorsCase(eachObj)));
});

const directorMoviesCaseChange = (dbObj) => {
  return {
    movieName: dbObj.movie_name,
  };
};
//GETTING movies of directors

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const searchMoviesQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const dbResult = await db.all(searchMoviesQuery);
  response.send(dbResult.map((eachObj) => directorMoviesCaseChange(eachObj)));
});

module.exports = app;
