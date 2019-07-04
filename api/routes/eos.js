const express = require("express");
const router = express.Router();

const eosController = require('../controllers/eos');

router.post("/createcorporate", eosController.tn_createCorporate);
router.post("/createcertificate", eosController.tn_createCertificate);
router.post("/signcertificate", eosController.tn_signCertificate);
router.get("/getcertificate", eosController.tn_getCertificate);
router.get("/getcorporate", eosController.tn_getCorporate);
module.exports = router;
