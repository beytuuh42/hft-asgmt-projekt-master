// imports

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// connection to database

const db = new sqlite3.Database('./db/data.db', (err) => {
  if (err) {
    console.err("Couldn't load database!");
  }
  console.log("Database loaded.");
});

// define port

const port = process.env.PORT || 3000;
const app = express();

// define, which middleware our app should use

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));


// Below are all the routes

app.get('/', async (req, res) => {
  res.render('pages/index');
});

app.get('/linkVorschlag', async (req, res) => {
  res.render('pages/linkVorschlag');
});

app.get('/impressum', async (req, res) => {
  res.render('pages/impressum');
});

app.get('/adminz3erhzwtfnwg74fzw3gjwzdgwjehfzg', async (req, res) => {
    res.render('pages/admin');
});

app.post('/adminTable', async (req, res) => {
console.log("48");
  if (req.body.para == 0){
  console.log("Server received para (" + req.body.para + ")");
  db.all("SELECT DISTINCT rowid, * FROM links WHERE approved = ?;", [req.body.para], (err, rows) => {
    if(err){
      console.log("Couldn't select admin-links from database!");
    }
    console.log("Got admin-links from database.");
    res.json(rows);
  });
  }

  else {
    console.log("61 Server received para (" + req.body.para + ")" + req.body.carbrand + req.body.model);
    db.all("SELECT DISTINCT rowid, * FROM links WHERE approved = ? AND carbrand = ? AND model = ?;", [req.body.para,req.body.carbrand,req.body.model], (err, rows) => {
      if(err){
        console.log("Couldn't select admin-links from database!");
      }
      console.log("Got admin-links from database.");
      res.json(rows);
    });
    }
});

app.get('/carbrands', (req, res) => {
  db.all("SELECT DISTINCT carbrand FROM scene_links ORDER BY carbrand", (err, rows) => {
    if (err) {
      console.log("Couldn't select carbrands from database!");
    }
    console.log("Got carbrands from database.");
    res.json(rows);
  });
});

/* 
 ========================
 ========================
  Melike, hier wird ein neuer Endpoint erstellt, der auf '/links reagiert, d.h. wenn du eine Abfrage auf localhost:3000/links machst, wird das hier ausgeführt
 ========================
 ========================
*/
app.get('/links', (req, res) => {
  db.all("SELECT * FROM links ORDER BY carbrand, model;", (err, rows) => {
    if (err) {
      console.log("Couldn't select links from database!");
    }
    console.log("Got links from database.");
    res.json(rows);
  });
});


app.post('/models', async (req, res) => {
  console.log("Server received car brand (" + req.body.carbrand + ")");
  db.all("SELECT model FROM scene_links WHERE carbrand LIKE ? ORDER BY model", [req.body.carbrand], (err, rows) => {
    if(err){
      console.log("Couldn't select models from database!");
    }
    console.log("Got models from database.");
    rows.forEach( row => console.log(row.model));
    res.json(rows);
  });
});

// Post for categorys

app.post('/categorys', async (req, res) => {
  db.all("SELECT DISTINCT category FROM links WHERE carbrand = ? AND model = ?;", [req.body.carbrand, req.body.model], (err, rows) => {
    if(err){
      console.log("Couldn't select categorys from database!");
    }
    console.log("Got categorys from database.");
    rows.forEach( row => console.log(row.category));
    res.json(rows);
  });
});


// Providing path for choosen carbrand and model

app.post('/carScene', async (req, res) => {
  //get Scene Link from Database and give it back with response
  db.get("SELECT scene_link path FROM scene_links WHERE carbrand = ? AND model = ?;", [req.body.carbrand, req.body.model], (err, row) => {
    if (err) {
      throw err;
    }
    const pathWithParam = '/car_scenes/car_scene_iframe?scene=' + row.path + '&model=' + req.body.model + '&carbrand=' + req.body.carbrand;
    console.log("carScene path: " + pathWithParam);
    res.json({ "path": pathWithParam });
  });
});

// GET-Routes for carScenes

app.get('/car_scenes/car_scene_iframe', async (req, res) => {
  console.log("scene=" + req.query.scene);
  db.all("SELECT link,category FROM links WHERE model=? AND carbrand=? AND approved=1 ORDER BY link", [req.query.model, req.query.carbrand], (err, rows) => {
    if(err){
      console.log("Couldn't select links from database!");
      console.log(err);
      return;
    }
    console.log("I got the following links: ");
    console.log(rows);
    rows.forEach( row => console.log(row.link));
    //console.log("Got links from database.");
    res.render("." + req.query.scene,{
      links_Motor: rows.filter( row => row.category == "Motor"),
      links_Rad: rows.filter( row => row.category == "Rad"),
      links_Lampe: rows.filter( row => row.category == "Lampe"),
      links_Innenraum: rows.filter( row => row.category == "Innenraum"),
    });
  });
});


// Let app listen to choosen port
// -> so we can send requests to it, using this port

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}…`)
});

module.exports = server


// ******************************************************  ADMIN
//Insert Suggested Links
app.post("/suggest", async (req, res) => {
  console.log("New Link Suggestion");
  db.run("INSERT INTO links(carbrand, model, category, link, approved) VALUES (?, ?, ?, ?, ?);", 
  [req.body.carbrand, req.body.model, req.body.category, req.body.link, "0"], function(err) {
    if(err) {
      console.log("suggestion error");
    } else {
      console.log("suggestion successful")
    }
  });
});

// Passwort request
app.post('/login', async (req, res) => {
  //get Login_Link from Database and give it back with respons
    
    db.get("SELECT link FROM login WHERE username = ? AND passwort = ?" , [req.body.username, req.body.passwort], (err, row) => {
    if (err) {
      throw err;
     } 
     res.json({ "row" : row});
  });
});

// Daten für Admin Table
// app.post('/admindata', async (req, res) => {
//   db.all("SELECT rowid, * FROM links WHERE approved = 1;", (err, rows) => {
//     if (err) {
//       throw err;
//     }
    
//     res.json({"rows": rows });
//   });
// });

// Delete Admin,
app.post('/deleteRow', async (req, res) => {
  db.run("DELETE FROM links WHERE rowid=?;", [req.body.rowid], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json({"Done": rows});
  });
});

// publish Admin
app.post('/saveRow', function(req, res){
  db.run("UPDATE links SET approved = 1 WHERE rowid=?;", [req.body.rowid], function(err, row){
    if (err){
        console.err(err);
        res.status(500);
}
res.end();
});
});
 
