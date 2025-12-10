import Layout from "@/components/Layout";
import { useTagsQuery } from "@/graphql/generated/schema";

export default function TagAdmin() {
  const { data } = useTagsQuery();
  const tags = data?.tags || [];
  return (
    <Layout pageTitle="Admin des Tags">
      <div>
        <h2> Administration des Tags</h2>
        {tags.map((tag) => (
          <p key={tag.id}>{tag.name}</p>
        ))}
      </div>
    </Layout>
  );
}
