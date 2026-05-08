import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload completely successful! URL:", file.url);
    }),
  productAttachmentUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
    audio: { maxFileSize: "32MB", maxFileCount: 10 },
    text: { maxFileSize: "8MB", maxFileCount: 10 },
    blob: { maxFileSize: "64MB", maxFileCount: 10 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Product attachment uploaded:", file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
