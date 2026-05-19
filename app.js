const express = require("express");
const app = express();
const path = require("path");
const methodOveride = require("method-override");
const ejsMate = require("ejs-mate"); // for boilerplate
const Quagga = require("@ericblade/quagga2").default;
const axios = require("axios");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
require("dotenv").config();
const OpenAI = require("openai");
// //const variable = require(".env").config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionOption = {
  secret: "126",
  resave: false,
  saveUninitialized: true,
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOveride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/home/tools", (req, res) => {
  res.render("tools.ejs");
});

app.get("/home/tools/barcode", (req, res) => {
  res.render("barcode");
});
0;

app.get("/home/tools/image", (req, res) => {
  res.render("/image");
});

app.post("/profile", upload.single("avatar"), function (req, res, next) {
  const imagePath = path.join(__dirname, req.file.path);

  Quagga.decodeSingle(
    {
      src: imagePath, // uploaded image path
      numOfWorkers: 0, // needs to be 0 when running on server
      inputStream: {
        size: 800, // resize image for better detection
      },
      decoder: {
        readers: ["ean_reader", "code_128_reader"], // add more if needed
      },
    },
    (result) => {
      if (result && result.codeResult) {
        const barcode = result.codeResult.code;
        console.log("Detected barcode:", barcode);

        // Redirect to product fetch route
        res.redirect(`/home/tools/bar/${barcode}`);
      } else {
        res.status(400).send("No barcode detected in image");
      }

      // Clean up uploaded file
      fs.unlinkSync(imagePath);
    },
  );

  res.redirect("/product");
});
//Fetch product by barcode
app.get("/home/tools/bar/:barcode", async (req, res) => {
  const { barcode } = req.params;
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
    );
    const product = response.data.product;

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Step 2: Send product data to ChatGPT
    const chatResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes food product data.",
        },
        {
          role: "user",
          content: `Analyze this product:

Name: ${product.product_name}
Ingredients: ${product.ingredients_text}

Find:
- Health risks
- Ingredient quality
- Safety concerns
- Overall trust score (0-5)
- Allergic contents
- Whether it has BIS marks or any FSSAI mark`,
        },
      ],
    });

    const summary = chatResponse.choices[0].message.content;

    // Step 3: Return both raw product and AI summary
    res.render("/product", { product, summary });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error fetching product");
  }
});

app.get("/tools/product", (req, res) => {
  res.send("product");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/services", (req, res) => {
  res.send("product");
});

app.get("/contact", (req, res) => {
  res.send("product");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
