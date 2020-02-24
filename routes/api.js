
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) {
    
//   app.get("/", function (req, res) {
//     db.Article.find({}).sort({
//         "_id": -1
//     }).then(function (dbArticle) {
//         res.render("index", {
//             data: dbArticle
//         });
        
//     }).catch(function (err) {
//         res.json(err)
//     });
// });
  app.get("/", function(req, res){
    db.Article.find({saved:false})
          .then(function(data) {
          var hbsObject = {
              articles: data
              };
              res.render("index",hbsObject);
          })
          .catch(function(err) {
              res.json(err);
          });
         
  });
  app.get("/saved", function(req, res) {
      db.Article.find({saved:true})
        .then(function(data) {
        var hbsObject = {
          articles: data
          };
          res.render("saved",hbsObject);
          console.log(hbsObject);
        })
          .catch(function(err) {
            res.json(err);
 
      });
  });
  
  
  
  app.get("/scrape", function(req, res) {
        axios.get("http://www.nytimes.com/").then(function(response) {
      console.log("scraper run")
    var $ = cheerio.load(response.data);
    $("article").each(function(i, element) {
  
      var result = {};
  
      var summary;
      if ($(this).find("ul").length) {
        summary = $(this).find("li").first().text();
      } else {
        summary = $(this).find("p").text();
      };
      
      result.headline = $(this).find("h2").text();
      result.summary = summary;
      result.url = "https://www.nytimes.com" + $(this).find("a").attr("href");
      
      db.Article.findOne({
        headline: result.headline,
        summary: result.summary,
        url: result.url 
      }).then(function (dbArticle) {
        if (dbArticle) {
            console.log(dbArticle.headline + " already in db!")
        } else {
            //create new one
            db.Article.create(result).then(function (dbArticle) {
              
            })
                
            
        }
      }).catch(function (err) {
        
        console.log(err)
      })
    })
      res.send("scrape complete")
  });

});
    
  app.delete("/delete/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.deleteOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  app.put("/saved/:id", function (req, res) {
    db.Article.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                saved: true
            }
        })
        .then(function (dbArticle) {
            res.render("saved", {
                data: dbArticle
            })
            console.log(dbArticle)
        }).catch(function (err) {
            res.json(err)
        });
  });
  app.get("/:id", function (req,res) {
    db.Article.findByIdAndUpdate({
      _id: req.params.id
    }) 
    .populate("note")
    .then(function (dbArticle) {

      res.json(dbArticle);
    })
    .catch(function (err) {
        res.json(err);
    });
  });

  app.post("/:id", function(req, res) {
    console.log('posting....')
    db.Note.create(req.body)
      .then(function(dbNote) {
            console.log(dbNote);
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query

        // error is happening ehere
        return db.Article.findOneAndUpdate({ _id: dbNote._id},{$push: { note: dbNote._id }}, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.get("/note/:id", (req, res) => {
    db.Note.find({articleId: req.params.id}).then(data => {
      console.log("Found " + data.length + " notes!")
      res.json(data)
    })
  })
}