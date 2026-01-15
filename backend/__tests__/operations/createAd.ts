import gql from "graphql-tag";

export default gql`
  mutation CreateAd($data: NewAdInput!) {
    createAd(data: $data) {
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
