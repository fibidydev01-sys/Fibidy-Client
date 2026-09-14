import { TrackDetailView } from "@/components/marketing/learn/track-detail-view";
import { trackKustomisasi } from "@/lib/learn-data/tracks";
import { getWorkflowCasesByTrack } from "@/lib/learn-data/workflow-cases";

export default function KustomisasiTrackPage() {
  return (
    <TrackDetailView
      track={trackKustomisasi}
      workflowCases={getWorkflowCasesByTrack("kustomisasi")}
    />
  );
}
