const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let database = null;

const initializeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DataBase error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// get the list of all the movies
// API 1

const ConvertAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = "SELECT movie_name FROM movie; ";
  const moviesArray = await database.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => ConvertAPI1(eachMovie)));
});

// creates a new movie
// API2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMoviesQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const createMovieResponse = await database.run(addMoviesQuery);
  response.send(`Movie Successfully Added`);
});

//Returns a movie based on movie id
//API 3
const convertMovieAPI = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const getMovieQueryResponse = await database.get(getMovieQuery);
  response.send(convertMovieAPI(getMovieQueryResponse));
});

//updates the details of a movie
//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId}, 
    movie_name = '${movieName}' , lead_actor = '${leadActor}' WHERE 
    movie_id = ${movieId};`;
  await database.run(updateMovieQuery);
  response.send(`Movie Details Updated`);
});

//deletes a movie
//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send(`Movie Removed`);
});

//returns a list of all the directors
//API 6
const ConvertDirectorDbAPI1 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = "SELECT * FROM director; ";
  const directorsArray = await database.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => ConvertDirectorDbAPI1(eachDirector))
  );
});

//returns a list of all movies directed  by a specific director
// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `SELECT movie_name as movieName FROM movie where
    director_id = ${directorId};`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
