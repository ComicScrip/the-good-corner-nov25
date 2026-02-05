import gql from "graphql-tag";

export const createTag = gql`
        mutation CreateTag($data: NewTagInput!) {
            createTag(data: $data) {
                id
                name
            }
        }
    `;
