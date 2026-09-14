import { TrackDetailView } from "@/components/marketing/learn/track-detail-view";
import { trackOnboarding } from "@/lib/learn-data/tracks";
import { getWorkflowCasesByTrack } from "@/lib/learn-data/workflow-cases";

export default function OnboardingTrackPage() {
  return (
    <TrackDetailView
      track={trackOnboarding}
      workflowCases={getWorkflowCasesByTrack("onboarding")}
    />
  );
}
