import PostList from "../components/PostList";

const HomePage = () => {
  return (
    <div className="mt-10">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        Recent Posts
      </h2>
      <div>
        <PostList />
      </div>
    </div>
  );
};

export default HomePage;
