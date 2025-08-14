import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({
      foldername,
      files,
    }: {
      foldername: string | null;
      files: File[];
    }) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }
      const formData = new FormData();
      for (const file of files) {
        formData.append("files", file);
      }
      const response = await fetch(
        `http://localhost:9000/files/?folder=${foldername}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      return response.json();
    },
    onSuccess(variables) {
      toast(` ${ variables.files.length } iles Uploaded!`, {
        duration: 5000,
        action: {
          label: "View",
          onClick: () => console.log("Reschedule clicked"),
        },
      });
    },
  });
};
