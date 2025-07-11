import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getUserMediaKeys, getPresignedDownloadUrl } from "@/lib/s3";
import GalleryClient from "@/components/GalleryClient";

function isVideo(filename) {
  return /\.(mp4|mov)$/i.test(filename);
}

function getContentType(filename) {
  if (/\.(mp4|mov)$/i.test(filename)) return "video";
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) return "image";
  return "other";
}

function getThumbKey(key) {
  const parts = key.split("/");
  const filename = parts.pop();
  return [...parts, "thumbnails", filename].join("/");
}

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view your gallery.</h2>
      </div>
    );
  }
  const objects = await getUserMediaKeys(session.user.id);
  const media = await Promise.all(
    objects.map(async ({ key, lastModified, size }) => {
      const url = await getPresignedDownloadUrl(key);
      const contentType = getContentType(key);
      let thumbUrl = null;
      if (contentType === "image") {
        const thumbKey = getThumbKey(key);
        try {
          thumbUrl = await getPresignedDownloadUrl(thumbKey);
        } catch {}
      }
      return {
        key,
        url,
        isVideo: isVideo(key),
        contentType,
        lastModified,
        size,
        thumbUrl,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <GalleryClient media={media} />
    </div>
  );
}