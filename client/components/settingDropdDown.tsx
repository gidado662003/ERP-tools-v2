"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { FiFile, FiImage, FiPaperclip } from "react-icons/fi";
import { ImagePreviewModal } from "./settingModals";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store";
import { useParams } from "next/navigation";
import{FILE_ACCEPT_TYPES}from "@/helper/acceptedFiles";


export function SettingDropdown() {
    const { user: currentUser } = useAuthStore();

    const { id } = useParams();
    const [chatId, setChatId] = useState<string | null>(id as string);
    const triggerInput = (id: string) => {
        document.getElementById(id)?.click();
    };
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [url, setUrl] = useState()
    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            setShowPreview(true);
            // Cleanup function to revoke object URL
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            setPreviewUrl(null);
            setShowPreview(false);
        }
    }, [selectedFile]);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-all outline-none">
                        <FiPaperclip size={20} />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" side="top" className="w-48 mb-2 p-1">
                    {/* Photo/Video Option */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            triggerInput("photo-video-input");
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                    >
                        <FiImage size={18} className="text-blue-500" />
                        <span className="font-medium">Photo or Video</span>
                        <input
                            id="photo-video-input"
                            type="file"
                            accept={FILE_ACCEPT_TYPES.IMAGES_VIDEOS}
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                    </DropdownMenuItem>

                    {/* Document Option */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            triggerInput("document-input");
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700"
                    >
                        <FiFile size={18} className="text-emerald-500" />
                        <span className="font-medium">Document</span>
                        <input
                            id="document-input"
                            type="file"
                            accept={FILE_ACCEPT_TYPES.DOCUMENTS}
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ImagePreviewModal
                imageUrl={previewUrl}
                isOpen={showPreview}
                onClose={() => {
                    setShowPreview(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }}
                onSend={async (uploadedUrl: string, type: string) => {
                    // Send socket message AFTER upload succeeds
                    socket.emit("send_message", {
                        chatId: chatId,
                        text: type === "image" ? "image sent" : type === "video" ? "video sent" : "file sent",
                        type: type,
                        fileUrl: uploadedUrl, // Use uploaded URL, not blob URL
                        senderId: currentUser?.id,
                    });
                    setShowPreview(false);
                }}
                selectedFile={selectedFile}
            />
        </>
    );
}