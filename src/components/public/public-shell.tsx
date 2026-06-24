import { Footer } from "@/components/public/footer";
import { PublicNav } from "@/components/public/public-nav";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      {children}
      <Footer />
    </>
  );
}
