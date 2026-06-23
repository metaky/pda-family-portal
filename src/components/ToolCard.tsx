import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PortalTool } from "@/lib/tools";

export function ToolCard({ tool }: { tool: PortalTool }) {
  const ready = tool.status === "ready";

  return (
    <Link className="tool-card" href={tool.href}>
      <span className={`status ${ready ? "" : "pending"}`}>
        {ready ? "Ready in MVP" : "Native route, migration planned"}
      </span>
      <h2>{tool.title}</h2>
      <p>{tool.description}</p>
      <p className="small-copy">{tool.job}</p>
      <span className="button button-secondary" style={{ marginTop: "auto" }}>
        Open tool <ArrowRight size={16} />
      </span>
    </Link>
  );
}
