import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import CommentItem from "./CommentItem";

interface Props {
  postId: number;
}

interface NewComment {
  content: string;
  parent_comment_id?: number | null;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  user_id: string;
  created_at: string;
  author: string;
}

const createComment = async (
  newComment: NewComment,
  postId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You Must Be Logged In To Comment!");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
    user_id: userId,
    author: author,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Comment[];
};

const CommentSection = ({ postId }: Props) => {
  const [commentText, setCommentText] = useState<string>("");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (newComment: NewComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata.user_name
      ),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!commentText) {
      return;
    }

    mutate({ content: commentText, parent_comment_id: null });

    setCommentText("");
  };

  const buildCommentTree = (
    flatComments: Comment[]
  ): (Comment & { children?: Comment[] })[] => {
    const map = new Map<number, Comment & { children?: Comment[] }>();

    const roots: (Comment & { children?: Comment[] })[] = [];

    flatComments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    flatComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);

        if (parent) {
          parent.children!.push(map.get(comment.id)!);
        }
      } else {
        roots.push(map.get(comment.id)!);
      }
    });

    return roots;
  };

  if (isLoading) {
    return <div>Loading Comments...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const commentTree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={commentText}
            rows={3}
            placeholder="Write A Comment..."
            onChange={(event) => setCommentText(event.target.value)}
            className="w-full border border-white/10 bg-transparent p-2 rounded"
          />
          <button
            type="submit"
            disabled={!commentText}
            className="mt-2 bg-cyan-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>
          {isError && (
            <p className="text-rose-500 ">Error Posting Comment...</p>
          )}
        </form>
      ) : (
        <p className="mb-4 text-gray-600">
          You Must Be Logged In To Post A Comment!
        </p>
      )}
      {/* Comments Display */}
      <div className="space-y-4">
        {commentTree.map((comment, index) => {
          return <CommentItem key={index} comment={comment} postId={postId} />;
        })}
      </div>
    </div>
  );
};

export default CommentSection;
