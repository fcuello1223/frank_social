import { useState } from "react";
import { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  comment: Comment & { children?: Comment[] };
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You Must Be Logged In To Reply!");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parentCommentId,
    user_id: userId,
    author: author,
  });

  if (error) {
    throw new Error(error.message);
  }
};

const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata.user_name
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyText("");
      setShowReply(false);
    },
  });

  const handleReplySubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!replyText) {
      return;
    }

    mutate(replyText);
  };

  return (
    <div className="pl-4 border-l border-white/10">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-cyan-400">
            {comment.author}
          </span>
          <span className="text-xs text-cyan-200">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>
        <p className="text-white">{comment.content}</p>
        <button
          onClick={() => setShowReply((prev) => !prev)}
          className="text-sm mt-1 text-cyan-500"
        >
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>
      {showReply && user && (
        <form onSubmit={handleReplySubmit} className="mb-2">
          <textarea
            value={replyText}
            rows={2}
            placeholder="Write A Reply..."
            onChange={(event) => setReplyText(event.target.value)}
            className="w-full border border-white/10 bg-transparent p-2 rounded"
          />
          <button
            type="submit"
            disabled={!replyText}
            className="mt-1 bg-cyan-500 text-white px-3 py-1 rounded cursor-pointer"
          >
            {isPending ? "Posting..." : "Post Reply"}
          </button>
          {isError && <p className="text-rose-500 ">Error Posting Reply...</p>}
        </form>
      )}
      {comment.children && comment.children.length > 0 && (
        <div>
          <button onClick={() => setIsCollapsed((prev) => !prev)} title={isCollapsed ? "Hide Replies" : "Show Replies"}>
            {isCollapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
          </button>
          {isCollapsed && (
            <div className="space-y-2">
              {comment.children.map((child, index) => (
                <CommentItem key={index} comment={child} postId={postId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
