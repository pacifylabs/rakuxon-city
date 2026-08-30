import { requireStaff } from "@/lib/admin/access";
import { hasCloudinary } from "@/lib/env";
import { uploadMedia } from "@/lib/admin/actions/media";
import { MediaUploadForm } from "@/components/admin/media-upload";
import { PageHeader } from "@/components/admin/ui";

export default async function MediaUploadPage() {
  await requireStaff();

  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Upload an image"
        description="Alt text is required. It is what a screen reader announces, and design system §8 treats it as part of the image, not metadata."
      />
      <div className="mt-8">
        <MediaUploadForm
          action={uploadMedia}
          storageConfigured={hasCloudinary}
        />
      </div>
    </div>
  );
}
