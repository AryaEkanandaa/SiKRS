const express = require("express");
const router = express.Router();
const dosenController = require("../controllers/dosenController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.get("/me/mahasiswa", auth, dosenController.mahasiswa);
router.get("/me", auth, dosenController.me);

router.get("/", auth, dosenController.index);
router.get("/:id", auth, dosenController.show);

router.post("/", auth, roleGuard("ADMIN"), dosenController.store);
router.put("/:id", auth, roleGuard("ADMIN"), dosenController.update);
router.delete("/:id", auth, roleGuard("ADMIN"), dosenController.destroy);

module.exports = router;
