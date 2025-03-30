import React, { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Community, fetchCommunities } from "./CommunityList";

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id: number | null;
}

const createPost = async (post: PostInput, imageFile: File) => {
  const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, imageFile);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("Posts")
    .insert({ ...post, image_url: publicUrlData.publicUrl });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [communityId, setCommunityId] = useState<number | null>(null);

  const { user } = useAuth();

  const { data: communities } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File }) => {
      return createPost(data.post, data.imageFile);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    mutate({
      post: {
        title: title,
        content: content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleCommunityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <label className="block mb-2 font-medium">Title</label>
        <input
          type="text"
          id="text"
          required
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border border-white/50 bg-transparent p-2 rounded outline-none"
        />
      </div>
      <div>
        <label className="block mb-2 font-medium">Content</label>
        <textarea
          id="content"
          required
          onChange={(event) => setContent(event.target.value)}
          className="w-full border border-white/50 bg-transparent p-2 rounded outline-none"
          rows={5}
        />
      </div>
      <div>
        <label>Select Community</label>
        <select id="community" onChange={handleCommunityChange}>
          <option value="">Choose A Community</option>
          {communities?.map((community, index) => {
            return (
              <option key={index} value={community.id}>
                {community.name}
              </option>
            );
          })}
        </select>
      </div>
      <div>
        <label className="block mb-2 font-medium">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          id="image"
          required
          onChange={handleFileChange}
          className="w-full text-gray-400 cursor-pointer"
        />
      </div>
      <button
        type="submit"
        className="bg-cyan-500 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Post"}
      </button>
      {isError && <p className="text-rose-500">Error Creating Post</p>}
    </form>
  );
};

export default CreatePost;
