const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.use(auth, roleGuard("ADMIN"));

router.get("/", userController.index);
router.get("/:id", userController.show);
router.put("/:id", userController.update);
router.delete("/:id", userController.destroy);
router.put("/:id/link", userController.link);
router.post("/:id/unlink", userController.unlink);

module.exports = router;
