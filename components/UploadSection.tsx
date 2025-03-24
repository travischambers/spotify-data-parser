"use client";

import FileUploadButton from "@/components/FileUploadButton";
import { ExtendedStream } from "@/types";
import { PiUploadSimpleBold, PiXCircleBold } from "react-icons/pi";

type UploadSectionProps = {
  onStreamsLoaded: (fileCount: number, streams: ExtendedStream[]) => void;
};

export default function UploadSection({ onStreamsLoaded }: UploadSectionProps) {
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      const allStreams: ExtendedStream[] = [];

      for (const file of files) {
        const text = await file.text();
        const parsedData: ExtendedStream[] = JSON.parse(text);

        // Validate that parsed data is an array of Stream objects
        if (!Array.isArray(parsedData)) {
          throw new Error("Invalid JSON format. Must be array.");
        }
        for (const item of parsedData) {
          if (typeof item.ts !== "string") {
            console.error("item", item);
            throw new Error("Invalid JSON format of item. Must have ts.");
          }
        }
        // Convert timestamp to Date objects
        const streams = parsedData.map((item) => ({
          ...item,
          endTime: new Date(item.ts),
        }));

        allStreams.push(...streams);
      }

      onStreamsLoaded(files.length, allStreams);
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
