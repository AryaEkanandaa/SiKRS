const express = require("express");
const router = express.Router();
const mahasiswaController = require("../controllers/mahasiswaController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.get("/me/dosen-pa", auth, mahasiswaController.dosenPa);
router.get("/me", auth, mahasiswaController.me);
router.put("/me", auth, mahasiswaController.updateMe);

router.get("/", auth, mahasiswaController.index);
router.get("/:id", auth, mahasiswaController.show);

router.post("/", auth, roleGuard("ADMIN"), mahasiswaController.store);
router.put("/:id", auth, roleGuard("ADMIN"), mahasiswaController.update);
router.delete("/:id", auth, roleGuard("ADMIN"), mahasiswaController.destroy);
router.put("/:id/pa", auth, roleGuard("ADMIN"), mahasiswaController.assignPa);

module.exports = router;
