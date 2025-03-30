import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

import { supabase } from "../supabase-client";

interface CommunityInput {
  name: string;
  description: string;
}

const createCommunity = async (community: CommunityInput) => {
  const { error, data } = await supabase.from("communities").insert(community);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const CreateCommunity = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: createCommunity,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      navigate("/communities");
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    mutate({ name: name, description: description });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
        Create New Community
      </h2>
      <div>
        <label className="block mb-2 font-medium">Community Name</label>
        <input
          type="text"
          id="name"
          required
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-2 font-medium">Description</label>
        <textarea
          rows={3}
          id="description"
          required
          onChange={(event) => setDescription(event.target.value)}
          className="w-full border border-white/10 bg-transparent p-2 rounded"
        />
      </div>
      <button className="bg-cyan-500 text-white px-4 py-2 rounded cursor-pointer">
        {isPending ? "Creating..." : "Create Community"}
      </button>
      {isError && <p className="text-rose-500">Error Creating Community</p>}
    </form>
  );
};

export default CreateCommunity;
