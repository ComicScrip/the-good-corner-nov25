import gql from "graphql-tag";

export default gql`
  query GetAds(
    $titleContains: String
    $categoryId: Int
    $limit: Int
    $sortBy: String
    $order: String
  ) {
    ads(
      titleContains: $titleContains
      categoryId: $categoryId
      limit: $limit
      sortBy: $sortBy
      order: $order
    ) {
      id
      title
      price
      description
      location
      pictureUrl
      category {
        id
        name
      }
      tags {
        id
        name
      }
      author {
        id
        email
      }
    }
  }
`;
