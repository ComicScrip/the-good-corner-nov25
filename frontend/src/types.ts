export interface Ad {
  id: number
  title: string
  price: number
  pictureUrl: string
  tags: Tag[]
  category: Category
  description: string
  location: string
}

export interface AdInput {
  title: string
  price: number
  pictureUrl: string
  tags: { id: number }[]
  category: { id: number }
  description: string
  location: string
}

export interface Category {
  id: number
  name: string
}

export interface Tag {
  id: number
  name: string
}