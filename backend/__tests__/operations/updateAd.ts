import gql from "graphql-tag";

export default gql`
  mutation UpdateAd($id: Int!, $data: UpdateAdInput!) {
    updateAd(id: $id, data: $data) {
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
