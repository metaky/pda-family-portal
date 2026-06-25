import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PortalTool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: PortalTool }) {
  const quick = tool.status === "quick";

  return (
    <Link className="tool-card" href={tool.href}>
      <span className={`status ${quick ? "" : "pending"}`}>
        {quick ? "Use in the moment" : "School preparation"}
      </span>
      <h2>{tool.title}</h2>
      <p>{tool.description}</p>
      <p className="small-copy">{tool.job}</p>
      <span className="button button-secondary" style={{ marginTop: "auto" }}>
        Start here <ArrowRight size={16} />
      </span>
    </Link>
  );
}
