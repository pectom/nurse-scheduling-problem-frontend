import { useEffect, useState } from "react";

export const useFileReader = (): [ArrayBuffer | undefined, (srcFile: File) => void] => {
  //#region members
  const fileReader: FileReader = new FileReader();
  const [content, setContent] = useState<ArrayBuffer>();
  //#endregion

  //#region effects
  useEffect(() => {
    const updateContent = () => {
      setContent(fileReader.result as ArrayBuffer);
    };

    fileReader.addEventListener("loadend", updateContent);
    return () => fileReader.removeEventListener("loadend", updateContent);
  }, [fileReader]);
  //#endregion

  //#region logic
  const setSrcFile = (file: File) => {
    fileReader.readAsArrayBuffer(file);
  };
  //#endregion

  return [content, setSrcFile];
};