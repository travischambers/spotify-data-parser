"use client";

import FileUploadButton from "@/components/FileUploadButton";
import { PiUploadSimpleBold, PiXCircleBold } from "react-icons/pi";

export default function Upload() {
  return (
    <FileUploadButton
      size="lg"
      accept="json/*"
      startContent={<PiUploadSimpleBold />}
      rejectProps={{ color: "danger", startContent: <PiXCircleBold /> }}
      multiple={true}
      onUpload={(files) => {
        console.log("TRAVIS WAS HERE");
        console.log(files);
      }}
    >
      Upload
    </FileUploadButton>
  );
}
