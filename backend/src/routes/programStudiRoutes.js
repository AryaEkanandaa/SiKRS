const express = require("express");
const router = express.Router();
const prodiController = require("../controllers/programStudiController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.get("/", auth, prodiController.index);
router.get("/:id", auth, prodiController.show);

router.post("/", auth, roleGuard("ADMIN"), prodiController.store);
router.put("/:id", auth, roleGuard("ADMIN"), prodiController.update);
router.delete("/:id", auth, roleGuard("ADMIN"), prodiController.destroy);

module.exports = router;
