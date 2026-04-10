import { Router } from "express";
import multer from "multer";
import { readNoitaSeed } from "./noitaMemoryReader.mjs";
import ProcessManager from "./noitaLauncher.mjs";

const router = Router();

const dbs = {};

router.get("/db_dump/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.sendStatus(400);
  }
  res.status(200).send(dbs[id]);
  delete dbs[id];
});

const m = multer();

import { getRoomNumber } from "./io/rooms.mjs";

router.post("/db_dump/", m.any(), (req, res) => {
  const id = getRoomNumber();
  dbs[id] = req.files[0].buffer;
  res.send({ id });
  setTimeout(() => {
    delete dbs[id];
  }, 900000); // 15 minutes
});

// Noita memory reading endpoint
router.get("/noita/current-seed", async (req, res) => {
  try {
    console.log("Fetching Noita seed from memory...");
    const result = await readNoitaSeed();
    console.log("Noita seed result:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in /api/noita/current-seed:", err);
    res.status(500).json({
      seed: null,
      error: "Internal server error",
    });
  }
});

// Noita launcher endpoint
router.post("/noita/restart", async (req, res) => {
  try {
    console.log("Restart request received:", req.body);

    const { cleanSave = true, gameMode = "normal" } = req.body;

    const processManager = new ProcessManager();
    const result = await processManager.restartNoita({ cleanSave, gameMode });

    if (result.success) {
      console.log("Noita restart successful:", result.message);
      res.status(200).json(result);
    } else {
      console.error("Noita restart failed:", result.message);
      res.status(500).json(result);
    }
  } catch (err) {
    console.error("Error in /api/noita/restart:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: { message: err.message },
    });
  }
});

export default router;
