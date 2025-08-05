import { useMutation } from "@tanstack/react-query";


export const useUploadFile = () => {
    return useMutation({
        mutationFn: async ({ foldername, files }: { foldername: string, files: File[] }) => {
            const formData = new FormData();
            for (const file of files) {
                formData.append("files", file);
            }
            const response = await fetch(`http://localhost:9000/files/?folder=${foldername}`, {
                method: "POST",
                body: formData,

            });
            if (!response.ok) {
                throw new Error("Failed to upload file");
            }
            return response.json();
        }
    })

}
