import blogPosts from "../data/blogPosts.json";

function Blog() {
  return (
    <div>
      <h1>Blogi</h1>
      {blogPosts.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.date}</p>
          <img src={post.image} alt={post.title} width="300px" />
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}

export default Blog;
