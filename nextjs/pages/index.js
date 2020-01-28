

// import { gql, graphql } from "next-apollo";
// import { withData } from 'next-apollo'

// const query = gql`
// {
//   posts {
//     id
//     title
//   }
// }
// `;

// const index = () => <div>Hello</div>;

// const GraphqlIndex = graphql(query)(index);

// export default withData(GraphqlIndex);

// https://github.com/adamsoffer/next-apollo-example
// https://www.youtube.com/watch?v=5ugAK6hGljI

import PostList from "../components/PostList";
import withData from "../lib/apollo";


export default withData(props => {
	return (
	  <PostList />
	);
});


// ------------------------------------------------------------


// import React from 'react'
// import gql from "graphql-tag";
// import Link from "next/link";
// import { graphql } from "react-apollo";
// import createClient from "../lib/createClient";

// function Home ({ url: { pathname }, loading, data: { allPosts } }) {
//   return (
//     <App>
//       <Nav pathname={pathname} />
//       {
//         loading ? <Loading /> : (
//           <div>
//             <Header
//               title='Vinylbase'
//               subLine='The best music reviews on the interwebs'
//               pageImage='/static/records.svg'
//               isIcon
//             />
//             <section>
//               <Grid entries={allPosts} type='reviews' />
//             </section>
//           </div>
//         )
//        }
//     </App>
//   )
// }

// const allPosts = gql`
//   query allPosts {
//     posts(orderBy: createdAt_DESC) {
//       id
//       title
//     }
//   }`

// export default createClient(graphql(allPosts)(Home))





// function Home() {
//   return <div>Here we are!</div>;
// }

// export default Home;

// import React from 'react';

// class Index extends React.Component {
//   render() {
//     return (
//       <div>Hihihi</div>
//     );
//   }
// }

// export default Index;



// import React from 'react'
// import gql from "graphql-tag";
// import Link from "next/link";
// import { graphql } from "react-apollo";

// const IndexPage = ({ data }) => (
//     <ul>
//       {data.posts.map(document => (
//           <h2>
//             {data.posts.title}
//           </h2>
//       ))}
//     </ul>
// )

// export default IndexPage

// // export const pageQuery = graphql`  
// //   query IndexQuery {
// //     allStrapiArticle {
// //       edges {
// //         node {
// //           id
// //           title
// //           content
// //         }
// //       }
// //     }
// //   }
// // `

// const query = gql`
//   {
//     posts {
//       title
//     }
//   }
// `;