import { Clapperboard, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CreativeBrief } from "@/lib/integrations/higgsfield";

/** Presentational storyboard view for a Higgsfield CreativeBrief. */
export function Storyboard({
  brief,
  stub,
  className,
}: {
  brief: CreativeBrief;
  stub?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Clapperboard className="size-4 text-primary" />
        <h3 className="font-semibold text-foreground">{brief.title}</h3>
        <Badge variant="outline" className="capitalize">{brief.kind.replace("-", " ")}</Badge>
        <Badge variant="secondary">{brief.aspectRatio}</Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {brief.durationSec}s
        </span>
        {stub && <Badge variant="wait">storyboard ready · render stubbed</Badge>}
      </div>

      <p className="text-xs italic text-muted-foreground">{brief.style}</p>

      <ol className="space-y-2">
        {brief.scenes.map((scene) => (
          <li key={scene.id} className="rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-primary">Scene {scene.id}</span>
              <span>{scene.durationSec}s</span>
            </div>
            <p className="mt-1.5 text-sm text-foreground">{scene.onScreenText}</p>
            <p className="mt-1 text-xs text-muted-foreground"><span className="text-foreground/70">Visual:</span> {scene.visual}</p>
            <p className="mt-1 text-xs text-muted-foreground"><span className="text-foreground/70">VO:</span> “{scene.voiceover}”</p>
          </li>
        ))}
      </ol>

      {brief.caption && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="text-xs font-medium text-muted-foreground">Caption</div>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{brief.caption}</p>
          {brief.hashtags && (
            <p className="mt-2 text-xs text-primary">{brief.hashtags.join(" ")}</p>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">{brief.disclaimer}</p>
    </div>
  );
}
