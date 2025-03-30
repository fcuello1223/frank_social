import { useQuery } from "@tanstack/react-query";

import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import PostItem from "./PostItem";

interface Props {
  communityId: number;
}

interface PostWithCommunity extends Post {
  communities: {
    name: string;
  };
}

export const fetchCommunityPost = async (
  communityId: number
): Promise<PostWithCommunity[]> => {
  const { data, error } = await supabase
    .from("Posts")
    .select("*, communities(name)")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as PostWithCommunity[];
};

const CommunityDisplay = ({ communityId }: Props) => {
  const { data, error, isLoading } = useQuery<PostWithCommunity[], Error>({
    queryKey: ["communityPost", communityId],
    queryFn: () => fetchCommunityPost(communityId),
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading Communities...</div>;
  }

  if (error) {
    return (
      <div className="text-rose-500 text-center py-4">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        {data && data[0].communities.name} Community Posts
      </h2>
      {data && data.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {data.map((post, index) => {
            return <PostItem key={index} post={post} />;
          })}
        </div>
      ) : (
        <p className="text-center text-rose-500">
          No Posts In This Community Yet!
        </p>
      )}
    </div>
  );
};

export default CommunityDisplay;
