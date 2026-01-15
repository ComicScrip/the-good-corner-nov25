import gql from "graphql-tag";

export default gql`
  mutation UpdateTag($id: Int!, $data: UpdateTagInput!) {
    updateTag(id: $id, data: $data) {
      id
      name
    }
  }
`;
