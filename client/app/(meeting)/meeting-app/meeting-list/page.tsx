import MeetingPreviewCard from "@/components/meeting-app/MeetingPreviewCard";
import { MeetingPreview } from "@/lib/meeting/meetingAppTypes";
import { mettingAppAPI } from "@/lib/meeting/mettingAppApi";
import { meetingServerAPI } from "@/lib/meeting/mettingAppApi.server";
export default async function MeetingListBox() {
  const response = await meetingServerAPI.getMeetings("", "");
  const { meetings, nextCursor } = response as {
    meetings: MeetingPreview[];
    nextCursor: string;
  };
  return <MeetingPreviewCard meetings={meetings} nextCursor={nextCursor} />;
}
