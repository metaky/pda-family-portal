import Link from "next/link";
import { LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";

export default function PrivacyPage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">Privacy</span>
        <h1 className="page-title">Privacy and Safety</h1>
        <p className="lede">
          PDA Family Tools is built for sensitive family and school information.
          The strongest rule is simple: child details, uploaded document text,
          generated output, and form answers should never be analytics data.
        </p>
      </section>

      <div className="content-stack">
        <section className="content-section panel">
          <div className="principle-grid">
            <article>
              <ShieldCheck size={22} aria-hidden="true" />
              <strong>No selling child data</strong>
              <p>
                We do not sell personal data, child data, uploaded documents, or
                generated tool output.
              </p>
            </article>
            <article>
              <LockKeyhole size={22} aria-hidden="true" />
              <strong>No public AI training</strong>
              <p>
                Uploaded IEP or 504 documents are not used to train public AI
                models. They are used only to return the requested analysis.
              </p>
            </article>
            <article>
              <Trash2 size={22} aria-hidden="true" />
              <strong>Transient processing</strong>
              <p>
                Uploaded documents are processed in memory for analysis and are
                not kept as a student-document database or parent dashboard.
              </p>
            </article>
          </div>
        </section>

        <section className="content-section panel">
          <h2>What the analyzer receives</h2>
          <p>
            When you use PDA IEP Advice, the analyzer receives the PDF you choose
            to upload and returns a PDA-aware analysis. The upload is not sent
            until you choose to analyze it.
          </p>
          <p>
            The analyzer may send extracted document text or PDF content to the
            configured AI provider so it can generate the requested result. That
            document content is not captured in analytics and is not used to
            build a saved child profile.
          </p>
        </section>

        <section className="content-section panel">
          <h2>Analytics boundaries</h2>
          <p>
            Product analytics, if enabled later, should be limited to privacy-safe
            events such as a tool being opened, a report being generated, or a
            print button being used. Analytics must not include child names,
            school names, uploaded document text, typed phrases, form answers, or
            generated output.
          </p>
        </section>

        <section className="content-section panel">
          <h2>Support Sheet Builder difference</h2>
          <p>
            The Support Sheet Builder is template-first and local to your browser
            in this MVP. It does not require an account or server-side child
            profile storage.
          </p>
          <Link className="button button-secondary" href="/terms">
            Read terms of use
          </Link>
        </section>
      </div>
      <Footer />
    </PortalShell>
  );
}
