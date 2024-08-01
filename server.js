/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name:Darshan Kalpeshbhai Prajapati Student ID: 112908215 Date: 5th July 2024
*
* Vercel Web App URL: https://vercel.com/darshannnnnnnnnns-projects/web322-app
*
* GitHub Repository URL: https://github.com/Darshannnnnnnnnn/web322-app
*
********************************************************************************/

const express = require("express");
const { Item, Category } = require("./models"); // Sequelize models
const path = require("path");

// 3 new modules, multer, cloudinary, streamifier
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// AS4, Setup handlebars
const exphbs = require("express-handlebars");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dh453rnwm",
  api_key: "623722143492837",
  api_secret: "MMbPRCMxYwswR9YIfhK_pL5vBMA",
  secure: true,
});

// "upload" variable without any disk storage
const upload = multer(); // no { storage: storage }

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

// Middleware to set active route and category for views
app.use((req, res, next) => {
  let route = req.path.substring(1);

  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));

  app.locals.viewingCategory = req.query.category;

  next();
});

// Handlebars Setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: (url, options) => {
        return (
          '<li class="nav-item"><a ' +
          (url === app.locals.activeRoute
            ? ' class="nav-link active" '
            : ' class="nav-link" ') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: (lvalue, rvalue, options) => {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue !== rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      }
    },
  })
);

app.set("view engine", ".hbs");

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", async (req, res) => {
  let viewData = {};

  try {
    let items = [];
    if (req.query.category) {
      items = await Item.findAll({ where: { category: req.query.category, published: true } });
    } else {
      items = await Item.findAll({ where: { published: true } });
    }
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.items = items;
    viewData.item = items[0];
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.categories = await Category.findAll();
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData });
});

app.get("/items", async (req, res) => {
  try {
    let data;
    if (req.query.category) {
      data = await Item.findAll({ where: { category: req.query.category } });
    } else if (req.query.minDate) {
      data = await Item.findAll({ where: { postDate: { [Op.gte]: new Date(req.query.minDate) } } });
    } else {
      data = await Item.findAll();
    }
    res.render("items", { items: data });
  } catch (err) {
    res.render("items", { message: "no results" });
  }
});

app.get("/items/add", (req, res) => {
  res.render("addItem");
});

app.post("/items/add", upload.single("featureImage"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result.url);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      imageUrl = result;
    }

    req.body.featureImage = imageUrl;

    await Item.create(req.body);
    res.redirect("/items");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/item/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    res.json(item);
  } catch (err) {
    res.json({ message: err.message });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render("categories", { categories: categories });
  } catch (err) {
    res.render("categories", { message: "no results" });
  }
});

app.get('/shop/:id', async (req, res) => {
  let viewData = {};

  try {
    let items = [];
    if (req.query.category) {
      items = await Item.findAll({ where: { category: req.query.category, published: true } });
    } else {
      items = await Item.findAll({ where: { published: true } });
    }
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.item = await Item.findByPk(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.categories = await Category.findAll();
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData });
});

app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(HTTP_PORT, () => {
  console.log("Server listening on: " + HTTP_PORT);
});
