import { FileText, Loader, User } from "lucide-react";
import Image from "next/image";
import { ChatAction } from "./chat-action";
import { format, set } from "date-fns";
import { ChannelMessage, ChannelMessageType } from "@prisma/client";
import { use, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { editChat } from "@/serverAction/chat";
import { toast } from "sonner";
import { useMessageStore } from "@/hooks/use-message-store";
import PDFViewerDialog from "./pdf-viewer-dialog";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

export function Chat({ chat }: { chat: any }) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>(chat.content);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);
  const { setEditedChat } = useMessageStore();

  function setEditing(): void {
    setIsEditing(true);
  }
  
  function handleOpenPdfViewer(e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) {
    if (chat.type === ChannelMessageType.PDF) {
      e.preventDefault();
      setIsPdfViewerOpen(true);
    }
  }

  return (
    <div
      key={chat.id}
      className="flex items-center h-full hover:bg-zinc-800 p-3 gap-3 w-full"
    >
      {chat.members.user.imageUrl ? (
          <div className="bg-transparent/20 p-1 rounded-full h-8 w-8 text-white object-cover flex items-center justify-center">
            <img
              src={chat.members.user.imageUrl}
              alt={chat.members.user.userName}
              className="h-12 w-12 rounded-full object-cover bg-transparent"
            />
          </div>
        ) : (
          <User className="bg-transparent/20 p-1 rounded-full h-8 w-8 text-white" />

        )}
      <div>
        <p className="text-lg pb-2 text-zinc-300">
          @ {chat.members.user.userName}
        </p>

        {chat.type === ChannelMessageType.TEXT &&
          (isEditing ? (
            <div className="flex items-center justify-center gap-2 w-full">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent "
              />

              <Button
                onClick={async () => {
                  try {
                    setLoading(true);

                    const editedChat: ChannelMessage | null = await editChat(
                      chat.id,
                      content
                    );

                    setIsEditing(false);

                    if (editedChat) {
                      setEditedChat(editedChat);
                    }

                    toast.success("Message edited successfully");
                  } catch (error) {
                    toast.error("Failed to edit message");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                size="sm"
                className="bg-green-900 hover:bg-green-800 flex items-center justify-center gap-1"
              >
                {loading && <Loader className="animate-spin w-4 h-4" />}
                Save
              </Button>

              <Button
                onClick={() => setIsEditing(false)}
                size="sm"
                className="bg-red-500 hover:bg-red-400"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-xl">{chat.content} </p>
          ))}

        {chat.type === ChannelMessageType.IMAGE && (
          <div>
            <div className="max-w-sm object-cover">
              {chat.content.split('|')[0].startsWith('http://localhost') ? (
                <img
                  src={chat.content.split('|')[0]}
                  alt="message"
                  className="max-w-full max-h-[300px] object-cover bg-transparent rounded-md"
                />
              ) : (
                <Image
                  src={chat.content.split('|')[0]}
                  alt="message"
                  height={300}
                  width={300}
                  className="max-w-full object-cover bg-transparent rounded-md"
                />
              )}
            </div>
            {chat.content.includes('|') && (
              <p className="text-xl mt-2">{chat.content.split('|')[1]}</p>
            )}
          </div>
        )}

        {chat.type === ChannelMessageType.VIDEO && (
          <div>
            <div className="max-w-sm">
              <video 
                controls 
                className="max-w-full rounded-md"
              >
                <source src={chat.content.split('|')[0]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {chat.content.includes('|') && (
              <p className="text-xl mt-2">{chat.content.split('|')[1]}</p>
            )}
          </div>
        )}

        {chat.type === ChannelMessageType.PDF && (
          <div>
            <div 
              className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 transition-colors p-3 rounded-md w-fit cursor-pointer"
              onClick={handleOpenPdfViewer}
            >
              <FileText size={20} className="text-red-500" />
              <span className="text-white font-medium">
                {chat.content.split('/').pop()?.split('?')[0] || "PDF Document"}
              </span>
            </div>
            {chat.content.includes('|') && (
              <p className="text-xl mt-2">{chat.content.split('|')[1]}</p>
            )}
            
            <PDFViewerDialog 
              isOpen={isPdfViewerOpen} 
              onClose={() => setIsPdfViewerOpen(false)} 
              pdfUrl={chat.content.split('|')[0]}
              fileName={chat.content.split('/').pop()?.split('-', 2)[1]?.split('?')[0] || "Document"}
            />
          </div>
        )}

        <p className="text-xs text-zinc-400 pt-1">
          {chat.isEdited && "(Edited)"}{" "}
          {format(new Date(chat.createdAt), DATE_FORMAT)}
        </p>
      </div>

      <ChatAction chat={chat} setEditing={setEditing} />
    </div>
  );
}
