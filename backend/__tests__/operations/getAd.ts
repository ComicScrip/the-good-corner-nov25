import gql from "graphql-tag";

export default gql`
  query GetAd($id: Int!) {
    ad(id: $id) {
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
