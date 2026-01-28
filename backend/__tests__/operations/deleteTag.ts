import gql from "graphql-tag";

export default gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id)
  }
`;
