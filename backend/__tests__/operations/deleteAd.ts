import gql from "graphql-tag";

export default gql`
  mutation DeleteAd($id: Int!) {
    deleteAd(id: $id)
  }
`;
