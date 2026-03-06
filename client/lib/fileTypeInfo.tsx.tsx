import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  File,
  Presentation,
  FileCode2,
} from "lucide-react";

type FileTypeInfo = { icon: React.ReactNode; label: string; color: string };

const FILE_CATEGORIES: Record<
  string,
  { extensions: string[]; info: Omit<FileTypeInfo, "label">; label: string }
> = {
  pdf: {
    extensions: ["pdf"],
    label: "PDF",
    info: {
      icon: <FileText className="h-6 w-6" />,
      color: "text-red-500 bg-red-500/10",
    },
  },
  word: {
    extensions: ["doc", "docx"],
    label: "Word",
    info: {
      icon: <FileText className="h-6 w-6" />,
      color: "text-blue-500 bg-blue-500/10",
    },
  },
  spreadsheet: {
    extensions: ["xls", "xlsx", "csv"],
    label: "Spreadsheet",
    info: {
      icon: <FileSpreadsheet className="h-6 w-6" />,
      color: "text-green-500 bg-green-500/10",
    },
  },
  presentation: {
    extensions: ["ppt", "pptx"],
    label: "Presentation",
    info: {
      icon: <Presentation className="h-6 w-6" />,
      color: "text-orange-500 bg-orange-500/10",
    },
  },
  image: {
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    label: "Image",
    info: {
      icon: <FileImage className="h-6 w-6" />,
      color: "text-purple-500 bg-purple-500/10",
    },
  },
  video: {
    extensions: ["mp4", "mov", "avi", "mkv", "webm"],
    label: "Video",
    info: {
      icon: <FileVideo className="h-6 w-6" />,
      color: "text-pink-500 bg-pink-500/10",
    },
  },
  audio: {
    extensions: ["mp3", "wav", "ogg", "flac"],
    label: "Audio",
    info: {
      icon: <FileAudio className="h-6 w-6" />,
      color: "text-yellow-500 bg-yellow-500/10",
    },
  },
  markdown: {
    extensions: ["md", "log"],
    label: "Mark Down",
    info: {
      icon: <FileCode2 className="h-6 w-6" />,
      color: "text-indigo-500 bg-indigo-500/10",
    },
  },
  code: {
    extensions: [
      "js",
      "ts",
      "tsx",
      "jsx",
      "html",
      "css",
      "json",
      "py",
      "java",
      "cpp",
      "c",
      "sh",
    ],
    label: "Code",
    info: {
      icon: <FileCode className="h-6 w-6" />,
      color: "text-cyan-500 bg-cyan-500/10",
    },
  },
  archive: {
    extensions: ["zip", "rar", "tar", "gz", "7z"],
    label: "Archive",
    info: {
      icon: <FileArchive className="h-6 w-6" />,
      color: "text-amber-500 bg-amber-500/10",
    },
  },
};

const EXTENSION_MAP: Record<string, FileTypeInfo> = {};

Object.values(FILE_CATEGORIES).forEach(({ extensions, info, label }) => {
  extensions.forEach((ext) => {
    EXTENSION_MAP[ext] = { ...info, label };
  });
});

export function getFileTypeInfo(extension: string = ""): FileTypeInfo {
  const ext = extension.toLowerCase();

  return (
    EXTENSION_MAP[ext] || {
      icon: <File className="h-6 w-6" />,
      label: ext.toUpperCase() || "File",
      color: "text-muted-foreground bg-muted",
    }
  );
}
