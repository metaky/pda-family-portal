import { Footer, PortalShell } from "@/components/PortalShell";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "About PDA Family Tools",
  description:
    "Learn how PDA Family Tools helps parents and caregivers reduce repeated explaining, translating, and school advocacy work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PortalShell>
      <section className="panel">
        <h1 className="page-title">About PDA Family Tools</h1>
        <p className="lede">
          PDA families should not have to re-explain, re-translate, and
          re-advocate from scratch every time a new adult enters the picture.
        </p>
        <p>
          These tools help with the ordinary moments that can become exhausting:
          finding lower-pressure words, handing context to another adult,
          preparing for an IEP conversation, or responding to a school incident
          report with clearer questions.
        </p>
        <p>
          The tools are practical communication supports, not medical, legal,
          diagnostic, or therapeutic advice. They are designed to create usable
          language quickly, while leaving parents and caregivers in charge of
          what fits their child.
        </p>
      </section>
      <Footer />
    </PortalShell>
  );
}
