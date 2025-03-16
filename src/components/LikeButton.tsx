import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

const vote = async (voteVal: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("Votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote === voteVal) {
      const { error } = await supabase
        .from("Votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase
        .from("Votes")
        .update({ vote: voteVal })
        .eq("id", existingVote.id);

      if (error) {
        throw new Error(error.message);
      }
    }
  } else {
    const { error } = await supabase
      .from("Votes")
      .insert({ post_id: postId, user_id: userId, vote: voteVal });

    if (error) {
      throw new Error(error.message);
    }
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("Votes")
    .select("*")
    .eq("post_id", postId);

  if (error) {
    throw new Error(error.message);
  }

  return data as Vote[];
};

const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000,
  });

  const { mutate } = useMutation({
    mutationFn: (voteVal: number) => {
      if (!user) {
        throw new Error("You Must Be Logged In To Vote!");
      }

      return vote(voteVal, postId, user.id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  if (isLoading) {
    return <div>Votes Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const likes =
    votes?.filter((vote) => {
      return vote.vote === 1;
    }).length || 0;

  const dislikes =
    votes?.filter((vote) => {
      return vote.vote === -1;
    }).length || 0;

  const userVote = votes?.find((vote) => {
    return vote.user_id === user?.id;
  })?.vote;

  return (
    <div className="flex items-center space-x-4 my-4">
      <button
        onClick={() => mutate(1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === 1
            ? "bg-emerald-500 text-white"
            : "bg-gray-200 text-black"
        }`}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => mutate(-1)}
        className={`px-3 py-1 cursor-pointer rounded transition-colors duration-150 ${
          userVote === -1 ? "bg-rose-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        👎 {dislikes}
      </button>
    </div>
  );
};

export default LikeButton;
