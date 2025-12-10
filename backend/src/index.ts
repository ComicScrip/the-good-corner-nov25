import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { validate } from "class-validator";
import cors from "cors";
import express from "express";
import { buildSchema } from "type-graphql";
import { Like } from "typeorm";
import db from "./db";
import { Ad } from "./entities/Ad";
import { Category } from "./entities/Category";
import { Tag } from "./entities/Tag";
import env from "./env";
import AdResolver from "./resolvers/AdResolver";
import CategoryResolver from "./resolvers/CategoryResolver";
import TagResolver from "./resolvers/TagResolver";

buildSchema({ resolvers: [AdResolver, CategoryResolver,TagResolver] }).then((schema) => {
  const server = new ApolloServer({ schema });
  startStandaloneServer(server, {
    listen: { port: env.GRAPHQL_SERVER_PORT },
  }).then(({ url }) => {
    console.log(`graphql server ready on ${url}`);
  });
});

const app = express();

app.use(express.json());
app.use(cors());

const port = 4000;

app.get("/ads", async (req, res) => {
  try {
    const categoryId =
      typeof req.query.categoryId === "string"
        ? parseInt(req.query.categoryId, 10)
        : undefined;

    const titleContains = req.query.titleContains;

    const limit =
      typeof req.query.limit === "string"
        ? parseInt(req.query.limit, 10)
        : undefined;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const ads = await Ad.find({
      where: {
        category: { id: categoryId },
        title: titleContains ? Like(`%${titleContains}%`) : undefined,
      },
      take: limit,
      order: { [`${sortBy}`]: order },
    });
    res.send(ads);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ad = await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true },
    });
    if (!ad) return res.sendStatus(404);
    res.send(ad);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/categories", async (_req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/tags", async (_req, res) => {
  try {
    const tags = await Tag.find();
    res.send(tags);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/ads", async (req, res) => {
  try {
    const newAd = Ad.create(req.body);
    //const errors = await validate(newAd);
    //if (errors.length > 0) return res.status(422).send({ errors });
    const adWithId = await newAd.save();
    res.send(adWithId);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/categories", async (req, res) => {
  try {
    const newCategory = Category.create(req.body);
    const errors = await validate(newCategory);
    if (errors.length > 0) return res.status(422).send({ errors });
    const categoryWithId = await newCategory.save();
    res.send(categoryWithId);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post("/tags", async (req, res) => {
  try {
    const newTag = Tag.create(req.body);
    const errors = await validate(newTag);
    if (errors.length > 0) return res.status(422).send({ errors });
    const tagWithId = await newTag.save();
    res.send(tagWithId);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.delete("/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adToDelete = await Ad.findOneBy({ id });
    if (!adToDelete) return res.sendStatus(404);
    await adToDelete.remove();
    res.send({ message: "ad deleted" });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.patch("/ads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adToUpdate = await Ad.findOneBy({ id });
    if (!adToUpdate) return res.sendStatus(404);
    Ad.merge(adToUpdate, req.body);
    const errors = await validate(adToUpdate);
    if (errors.length > 0) return res.status(422).send({ errors });
    res.send(await adToUpdate.save());
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.listen(port, async () => {
  await db.initialize();
  console.log(`REST API listening on port ${port}`);
});
