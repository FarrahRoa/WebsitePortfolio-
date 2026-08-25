import AdminDashboardClient from "@/components/AdminDashboardClientFixed";

export default function AdminDashboardPage() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? null;
  return <AdminDashboardClient cloudName={cloudName} />;
}
