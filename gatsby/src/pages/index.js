import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/layout'

const IndexPage = ({ data }) => (
  <Layout>
    <ul>
      {data.allStrapiProjet.edges.map(document => (
        <li key={document.node.id}>
          <h2>
            <Link to={`/${document.node.id}`}>{document.node.titre}</Link>
          </h2>
          <p>{document.node.contenu}</p>
        </li>
      ))}
    </ul>
  </Layout>
)

export default IndexPage

export const pageQuery = graphql`  
  query IndexQuery {
    allStrapiProjet {
      edges {
        node {
        	id
        	titre
          contenu
        }
      }
    }
  }
`