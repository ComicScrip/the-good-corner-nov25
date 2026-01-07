import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { hash } from "argon2";
import { Ad } from "../entities/Ad";
import { Category } from "../entities/Category";
import { Tag } from "../entities/Tag";
import { User, UserRole } from "../entities/User";
import db from "./index";

export async function clearDB() {
  await unlink(resolve("src/db/the_good_corner.sqlite"));
}

async function main() {
  await clearDB().catch(console.error);
  await db.initialize();

  const visitor = await User.create({
    email: "dave.lopper@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
  }).save();

  const visitor2 = await User.create({
    email: "dave.lopper2@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
  }).save();

  await User.create({
    email: "admin@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Admin
  }).save();

  const macbook = Ad.create({
    title: "Macbook pro",
    description:
      "MacBook Pro boosté par la puce M2 Pro ou M2 Max. Avec autonomie d'une journée et sublime écran Liquid Retina XDR",
    price: 1500,
    pictureUrl:
      "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-midnight-config-20220606?wid=820&hei=498&fmt=jpeg&qlt=90&.v=1654122880566",
    location: "Lyon",
    author: visitor
  });
  const keyboard = Ad.create({
    title: "Clavier logitech",
    description:
      "Clavier Bluetooth® fin et minimaliste avec des touches personnalisables.",
    price: 30,
    pictureUrl:
      "https://resource.logitech.com/w_800,c_lpad,ar_16:9,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/pebble-keys-2-k380s/gallery/pebble-keys-2-k380s-top-tonal-graphite-gallery-ch.png?v=1",
    location: "Paris",
    author: visitor2
  });
  const peugeot = Ad.create({
    title: "Peugeot 206",
    description: "Diesel, 150000km, etat correct. CT effectué il y a 3 mois",
    price: 4000,
    pictureUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d9/Peugeot_206_Quicksilver_90.jpg",
    location: "Paris",
    author: visitor
  });
  const renault = Ad.create({
    title: "Renault 5",
    description: "Essence, 250000km, pour pièces",
    price: 200,
    pictureUrl:
      "https://images.caradisiac.com/images/6/6/5/2/196652/S0-youngtimers-quel-prix-aujourd-hui-pour-une-renault-supercinq-718545.jpg",
    location: "Lyon",
    author: visitor
  });
  const porsche = Ad.create({
    title: "Porsche 911",
    description: "Essence, 50000km, etat nickel",
    price: 50000,
    pictureUrl:
      "https://www.turbo.fr/sites/default/files/2022-01/high-mileage-991.2-porsche-911-for-sale.jpg",
    location: "Bordeaux",
    author: visitor
  });

  const raquette = Ad.create({
    title: "Raquettes de tenis",
    description: "Lot de 5 raquettes en parfait état",
    price: 25,
    pictureUrl:
      "https://contents.mediadecathlon.com/p2498847/k$7fea2d8de754899d9ddb8815b541ab86/sq/raquette-de-tennis-adulte-tr110-petrol.jpg?format=auto&f=969x969",
    location: "Bordeaux",
    author: visitor
  });

  const skis = Ad.create({
    title: "Paire de skis",
    description: "Marque Rossignol, tb état",
    price: 200,
    pictureUrl:
      "https://contents.mediadecathlon.com/p2332580/k$7fd9d6e45cc872a8637c81772dbb6e56/sq/ski-alpin-homme-avec-fixation-rossignol-react-6.jpg?format=auto&f=969x969",
    location: "Lyon",
    author: visitor
  });

  const computerCat = await Category.create({ name: "informatique" }).save();
  const voitureCat = await Category.create({ name: "automobile" }).save();
  const sportCat = await Category.create({ name: "sport" }).save();
  const tag1 = await Tag.create({ name: "tag1" }).save();
  const tag2 = await Tag.create({ name: "tag2" }).save();
  const tag3 = await Tag.create({ name: "tag3" }).save();

  keyboard.category = computerCat;
  keyboard.tags = [tag1, tag2];

  macbook.category = computerCat;
  macbook.tags = [tag2, tag3];

  peugeot.category = voitureCat;
  renault.category = voitureCat;
  porsche.category = voitureCat;

  skis.category = sportCat;
  raquette.category = sportCat;

  await keyboard.save();
  await macbook.save();
  await peugeot.save();
  await renault.save();
  await porsche.save();
  await raquette.save();
  await skis.save();

  await db.destroy();
  console.log("done !");
}

main();
