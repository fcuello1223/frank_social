import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase-client";

interface Props {
  postId: number;
}

interface NewComment {
  content: string;
  parent_comment_id?: number | null;
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

const CommentSection = ({ postId }: Props) => {
  const [commentText, setCommentText] = useState<string>("");

  const { user } = useAuth();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (newComment: NewComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata.user_name
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!commentText) {
      return;
    }

    mutate({ content: commentText, parent_comment_id: null });

    setCommentText("");
  };

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
    </div>
  );
};

export default CommentSection;
