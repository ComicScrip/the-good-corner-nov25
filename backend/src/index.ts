import "reflect-metadata";
import { validate } from "class-validator";
import express from "express";
import db from "./db";
import { Ad } from "./entities/Ad";

const app = express();

app.use(express.json());

const port = 4000;

app.get("/ads", async (_req, res) => {
  try {
    const ads = await Ad.find()
    res.send(ads);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/ads", async (req, res) => {
  try {
    const newAd = Ad.create(req.body);
    const errors = await validate(newAd);
    if (errors.length > 0) return res.status(422).send({ errors });
    const adWithId = await newAd.save();
    res.send(adWithId);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.delete("/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const adToDelete = await Ad.findOneBy({ id });
    if (!adToDelete) return res.sendStatus(404);
    await adToDelete.remove()
    res.send('deleted !');
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.patch("/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const adToUpdate = await Ad.findOneBy({ id });
    if (!adToUpdate) return res.sendStatus(404);
    Ad.merge(adToUpdate, req.body);
    const errors = await validate(adToUpdate);
    if (errors.length > 0)
      return res.status(422).send({ errors });
    res.send(await adToUpdate.save());
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});


app.listen(port, async () => {
  await db.initialize();
  console.log(`Example app listening on port ${port}`);
});
