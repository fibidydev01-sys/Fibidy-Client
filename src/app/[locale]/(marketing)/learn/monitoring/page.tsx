import { TrackDetailView } from "@/components/marketing/learn/track-detail-view";
import { trackMonitoring } from "@/lib/learn-data/tracks";
import { getWorkflowCasesByTrack } from "@/lib/learn-data/workflow-cases";

export default function MonitoringTrackPage() {
  return (
    <TrackDetailView
      track={trackMonitoring}
      workflowCases={getWorkflowCasesByTrack("monitoring")}
    />
  );
}
