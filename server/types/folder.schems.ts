import { z } from "zod";

export const ZCreateFolderSchema = z.object({
    foldername: z.string().min(3)
})

export const ZDeleteFolderSchema = z.object({
    foldername: z.string().min(3)
})
