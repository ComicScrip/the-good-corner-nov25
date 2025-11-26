import express from "express"

const app = express();

app.use(express.json())

const port = 3000

let ads = [
  {
    id: 1,
    title: "Bike to sell",
    description:
      "My bike is blue, working fine. I'm selling it because I've got a new one",
    owner: "bike.seller@gmail.com",
    price: 100,
    picture:
      "https://images.lecho.be/view?iid=dc:113129565&context=ONLINE&ratio=16/9&width=640&u=1508242455000",
    location: "Paris",
    createdAt: "2023-09-05T10:13:14.755Z",
  },
  {
    id: 2,
    title: "Car to sell",
    description:
      "My car is blue, working fine. I'm selling it because I've got a new one",
    owner: "car.seller@gmail.com",
    price: 10000,
    picture:
      "https://www.automobile-magazine.fr/asset/cms/34973/config/28294/apres-plusieurs-prototypes-la-bollore-bluecar-a-fini-par-devoiler-sa-version-definitive.jpg",
    location: "Paris",
    createdAt: "2023-10-05T10:14:15.922Z",
  },
];

app.get("/", (req, res) => {
  console.log('test')
  res.send("Hello World!");
});

app.get('/ads', (req, res) => {
  res.send(ads)
})

app.post('/ads', (req, res) => {
  ads.push(req.body)
  res.send("OK");
})

app.delete('/ads/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const adToDelete = ads.find((ad) => ad.id === id)
  if (!adToDelete) return res.sendStatus(404)
  ads = ads.filter((ad) => ad.id !== id)
  res.send('ad deleted')
})

app.patch('/ads/:id', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const adToUpdate = ads.find((ad) => ad.id === id)
  if (!adToUpdate) return res.sendStatus(404)
  //Object.assign(adToUpdate, req.body)
  ads = ads.map(ad => ad.id === id ? ({ ...ad, ...req.body }) : ad)
  res.send('ad updated')
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
