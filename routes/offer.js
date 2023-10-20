const express = require("express");
const router = express.Router();

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,

  async (req, res) => {
    try {
      const picture = req.files.picture;
      // console.log(picture);
      // console.log(req.user);
      const convertToBase64 = (file) => {
        return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
      };
      const transformedPicture = convertToBase64(req.files.picture);
      // console.log(transformedPicture);
      const result = await cloudinary.uploader.upload(transformedPicture);
      // console.log(result);
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        product_image: result,
        owner: req.user,
      });

      await newOffer.save();
      res.status(200).json({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],
        product_image: result,
        owner: req.user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offer", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    // Je crée un objet que je donerai en argument au find
    const filter = {};

    // En fonction des queries que je reçois, je vais modifier mon objet filter
    if (title) {
      filter.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filter.product_price = {
        $gte: priceMin,
      };
    }

    if (priceMax) {
      // Si la clef product_price existe déjà, je ne l'écrase pas, je lui rajoute juste une clef
      if (filter.product_price) {
        filter.product_price.$lte = priceMax;
      } else {
        filter.product_price = {
          $lte: priceMax,
        };
      }
    }

    // Je crée un objet que je donerai en argument à sort
    const sortFilter = {};

    // En fonction des queries reçus, je construit mon objet
    if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    } else if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    }

    // 5 résultats par page : 1 skip = 0 ---- 2 skip = 5  ----- 3 skip = 10 ---- 4 skip = 15
    // 3 résultats par page : 1 skip = 0 ---- 2 skip = 3  ----- 3 skip = 6

    // skip = (n°page - 1) * nb de résultats par page

    let pageToSend = 1;
    if (page) {
      pageToSend = page;
    }

    // Je calcule skip en fonction du query page que j'ai reçu
    const skip = (pageToSend - 1) * 5; // 5 * pageToSend -5
    // console.log(skip);

    // Je vais chercher mes offres
    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .limit(5)
      .skip(skip)
      .select("product_name product_price");

    // Je regarde combien d'offres corespondent à mes recherches
    const numberOfOffers = await Offer.countDocuments(filter);

    res.json({ count: numberOfOffers, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
