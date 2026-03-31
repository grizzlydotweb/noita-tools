import { Router } from "express";
import multer from "multer";
import { readNoitaSeed } from "./noitaMemoryReader.mjs";

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

export default router;
