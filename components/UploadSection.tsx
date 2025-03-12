"use client";

import FileUploadButton from "@/components/FileUploadButton";
import { Stream } from "@/types";
import { PiUploadSimpleBold, PiXCircleBold } from "react-icons/pi";

type UploadSectionProps = {
  onStreamsLoaded: (streams: Stream[]) => void;
};

export default function UploadSection({ onStreamsLoaded }: UploadSectionProps) {
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    console.log("handleUpload");

    try {
      const allStreams: Stream[] = [];

      for (const file of files) {
        const text = await file.text();
        const parsedData: Stream[] = JSON.parse(text);

        // Validate that parsed data is an array of Stream objects
        if (
          !Array.isArray(parsedData) ||
          !parsedData.every(
            (item) =>
              typeof item.endTime === "string" &&
              typeof item.artistName === "string" &&
              typeof item.trackName === "string" &&
              typeof item.msPlayed === "number",
          )
        ) {
          throw new Error("Invalid JSON format.");
        }

        // Convert endTime to Date objects
        const streams = parsedData.map((item) => ({
          ...item,
          endTime: new Date(item.endTime),
        }));

        allStreams.push(...streams);
      }

      onStreamsLoaded(allStreams);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <FileUploadButton
      size="lg"
      accept="json/*"
      multiple={true}
      startContent={<PiUploadSimpleBold />}
      rejectProps={{ color: "danger", startContent: <PiXCircleBold /> }}
      onUpload={handleUpload}
    >
      Upload
    </FileUploadButton>
  );
}
