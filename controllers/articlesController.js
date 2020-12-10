const express = require("express");
const router = express.Router();

// Database
const db = require("../models");

// Current Path = '/articles'

// GET index
router.get("/", (req, res) => {
  // Get data for all articles
  db.Article.find({}, (err, allArticles) => {
    if (err) return console.log(err);

    const context = { allArticles };

    console.log("allArticles:", allArticles);
    // render template
    res.render("articles/index", context);
  });
});

// GET new
router.get("/new", (req, res) => {
  db.Author.find({}, (err, allAuthors) => {
    const context = { authors: allAuthors };
    res.render("articles/new", context);
  });
});

// GET show
router.get("/:id", (req, res) => {
  db.Author.findOne({ articles: req.params.id })
    .populate({
      path: "articles",
      match: { _id: req.params.id },
    })
    .exec((err, foundAuthor) => {
      if (err) return console.log(err);
      console.log("foundAuthor: ", foundAuthor);
      res.render("articles/show", {
        author: foundAuthor,
        article: foundAuthor.articles[0],
      });
    });
});

// GET Edit
router.get("/:id/edit", (req, res) => {
  db.Author.find({}, (err, allAuthors) => {
    db.Author.findOne({ articles: req.params.id })
      .populate({ path: "articles", match: { _id: req.params.id } })
      .exec((err, foundArticleAuthor) => {
        if (err) return console.log(err);

        const context = {
          article: foundArticleAuthor.articles[0],
          authors: allAuthors,
          articleAuthor: foundArticleAuthor,
        };

        res.render("articles/edit", context);
      });
  });
});

// PUT
router.put("/:id", (req, res) => {
  db.Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, updatedArticle) => {
      if (err) return console.log(err);

      db.Author.findOne(
        { "articles._id": req.params.id },
        (err, foundAuthor) => {
          if (err) return console.log(err);
          else if (foundAuthor._id.toString() !== req.body.authorId) {
            foundAuthor.articles.remove(req.params.id);
            foundAuthor.save((err, savedFoundAuthor) => {
              if (err) return console.log(err);

              db.Author.findById(req.body.authorId, (err, newAuthor) => {
                if (err) return console.log(err);
                newAuthor.articles.push(updatedArticle);
                newAuthor.save((err, savedNewAuthor) => {
                  if (err) return console.log(err);
                  res.redirect("/articles" + req.params.id);
                });
              });
            });
          } else {
            res.redirect('/articles/' + req.params.id);
          }
        }
      );
    }
  );
});

// DELETE
router.delete("/:id", (req, res) => {
  db.Article.findByIdAndDelete(req.params.id, (err, deletedArticle) => {
    if (err) return console.log(err);
    db.Author.findOne({ articles: req.params.id }, (err, foundAuthor) => {
      if (err) return console.log(err);

      foundAuthor.articles.remove(req.params.id);
      foundAuthor.save((err, updatedAuthor) => {
        if (err) return console.log(err);

        console.log(updatedAuthor);
        res.redirect("/articles");
      });
    });
  });
});

// POST Create
router.post("/", (req, res) => {
  console.log("hit post route");
  console.log(req.body);

  db.Article.create(req.body, (err, newArticle) => {
    if (err) return console.log(err);
    // console.log(newArticle);

    db.Author.findById(req.body.authorId, (err, foundAuthor) => {
      console.log("foundAuthor: ", foundAuthor);
      foundAuthor.articles.push(newArticle);
      foundAuthor.save((err, savedAuthor) => {
        if (err) return console.log(err);
        console.log(savedAuthor, "savedAuthor");

        res.redirect(`/articles/${newArticle.id}`);
      });
    });
  });
});

module.exports = router;
