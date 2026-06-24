import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "About PDA Family Tools",
  description:
    "Learn why PDA Family Tools helps families reduce repeated explaining, translating, and advocacy work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PortalShell>
      <section className="panel">
        <h1 className="page-title">About PDA Family Tools</h1>
        <p className="lede">
          This portal is built around one idea: PDA families should not have to
          re-explain, re-translate, and re-advocate from scratch every time a new
          adult enters the picture.
        </p>
        <p>
          The tools are practical communication supports, not medical, legal,
          diagnostic, or therapeutic advice. The Support Sheet Builder is
          template-first and local to the browser in this MVP so families can get
          useful output without creating an account or sending child details to a
          server.
        </p>
      </section>
      <Footer />
    </PortalShell>
  );
}
