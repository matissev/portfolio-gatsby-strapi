
import { useQuery } from "@apollo/react-hooks";
import { gql, graphql } from "apollo-boost";

const GET_POSTS = gql`
  query allPosts {
    posts {
      id
      title
    }
  }
`;


function PostList() {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { skip: 0, first: 5 },
    notifyOnNetworkStatusChange: true
  });
  if (data && data.allPosts) {
    const areMorePosts = data.allPosts.length < data._allPostsMeta.count;
    return (
        <List>
          {data.allPosts.map((post, index) => (
            <h1>
              {post.title}
            </h1>
          ))}
        </List>
    );
  }
}

export default PostList;