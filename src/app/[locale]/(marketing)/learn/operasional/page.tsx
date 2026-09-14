import { TrackDetailView } from "@/components/marketing/learn/track-detail-view";
import { trackOperasional } from "@/lib/learn-data/tracks";
import { getWorkflowCasesByTrack } from "@/lib/learn-data/workflow-cases";

export default function OperasionalTrackPage() {
  return (
    <TrackDetailView
      track={trackOperasional}
      workflowCases={getWorkflowCasesByTrack("operasional")}
    />
  );
}
