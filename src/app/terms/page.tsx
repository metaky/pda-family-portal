import Link from "next/link";
import { AlertTriangle, FileText, HeartHandshake } from "lucide-react";
import { Footer, PortalShell } from "@/components/PortalShell";

export default function TermsPage() {
  return (
    <PortalShell>
      <section className="content-hero panel">
        <span className="status">Terms</span>
        <h1 className="page-title">Terms of Use</h1>
        <p className="lede">
          PDA Family Tools provides free educational and communication supports.
          The tools can help you prepare language and questions, but they do not
          replace qualified professional advice.
        </p>
      </section>

      <div className="content-stack">
        <section className="content-section panel">
          <div className="content-section-heading">
            <span className="content-icon" aria-hidden="true">
              <AlertTriangle size={24} />
            </span>
            <h2>Educational use only</h2>
          </div>
          <p>
            The portal is not legal, medical, diagnostic, or therapeutic advice.
            PDA IEP Advice can help you prepare for school conversations, but it
            cannot guarantee an IEP meeting outcome, due-process result, medical
            decision, or school placement decision.
          </p>
        </section>

        <section className="content-section panel">
          <div className="content-section-heading">
            <span className="content-icon" aria-hidden="true">
              <FileText size={24} />
            </span>
            <h2>Your documents and output</h2>
          </div>
          <p>
            You retain all rights to documents you upload and content you create
            with the tools. By uploading a document, you allow the portal to
            process it only so it can provide the requested analysis or output.
          </p>
          <p>
            AI-generated output may be incomplete or mistaken. Review everything
            before sharing it with a school team, clinician, provider, relative,
            or caregiver.
          </p>
        </section>

        <section className="content-section panel">
          <div className="content-section-heading">
            <span className="content-icon" aria-hidden="true">
              <HeartHandshake size={24} />
            </span>
            <h2>Donation-supported tools</h2>
          </div>
          <p>
            The tools are free to use. Donations support ongoing development and
            hosting, but do not unlock premium services or special treatment.
          </p>
          <div className="cta-row">
            <Link className="button button-primary" href="/privacy">
              Read privacy details
            </Link>
            <Link className="button button-secondary" href="/donate">
              Donate
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </PortalShell>
  );
}
