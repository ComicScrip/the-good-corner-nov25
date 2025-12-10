export type Ad = {
  id: number;
  title: string;
  price: number;
  pictureUrl: string;
};

export type Category = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type AdDetails = Ad & {
  location: string;
  owner: string;
  description: string;
  createdAt: string;
  category: Category;
  tags: Tag[];
};

export interface AdInput {
  title: string;
  price: number;
  pictureUrl: string;
  tags: { id: number }[];
  category: { id: number };
  description: string;
  location: string;
}
