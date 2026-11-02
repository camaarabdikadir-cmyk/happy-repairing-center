import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { login } from "../controllers/authController.js";
import {
  listRepairs, getRepair, createRepair, updateRepair, deleteRepair,
} from "../controllers/repairController.js";
import { listPayments, addPayment } from "../controllers/paymentController.js";
import {
  listParts, createPart, updatePart, deletePart, stockIn,
} from "../controllers/sparePartController.js";
import { stats } from "../controllers/dashboardController.js";
const router = Router();
router.post("/auth/login", login);
router.use(authRequired);
router.get("/dashboard", stats);
router.get("/repairs", listRepairs);
router.post("/repairs", createRepair);
router.get("/repairs/:id", getRepair);
router.put("/repairs/:id", updateRepair);
router.delete("/repairs/:id", deleteRepair);
router.get("/repairs/:repairId/payments", listPayments);
router.post("/repairs/:repairId/payments", addPayment);
router.get("/spare-parts", listParts);
router.post("/spare-parts", createPart);
router.put("/spare-parts/:id", updatePart);
router.delete("/spare-parts/:id", deletePart);
router.post("/spare-parts/stock-in", stockIn);
export default router;
