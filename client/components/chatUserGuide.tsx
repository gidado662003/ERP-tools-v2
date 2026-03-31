import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MessageCircle,
  Search,
  Pin,
  Reply,
  Copy,
  Forward,
  Trash2,
  Eye,
  AtSign,
} from "lucide-react";

export function ChatUserGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BookOpen className="h-4 w-4" />
          User Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chat Page User Guide</DialogTitle>
          <DialogDescription>
            Everything you need to know about using the chat interface
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Getting Started */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Getting Started
            </h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>
                Search for chats using the search bar or if search for users
              </li>
              <li>
                On clicking a chat, it opens the selected chat automatically
              </li>
              <li>Joins the chat and start your conversation</li>
              <li>Shows chat name and online/offline status</li>
            </ul>
          </section>

          {/* Chat Management */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Chat Management</h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>Lets you open extra chat actions from the menu</li>
              <li>Allows searching messages inside the current chat</li>
              <li>Displays pinned messages at the top</li>
              <li>Lets you load older messages manually</li>
              <li>Click on setting to access additional options</li>
              <li>Click on setting to access additional options</li>
              <li>
                To create group chat click on the "New Group Chat" button under
                settings
              </li>
              <li>
                Organizes messages by date: Today, Yesterday, or full date
              </li>
            </ul>
          </section>

          {/* Real-time Features */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Real-time Updates</h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>Updates in real time when new messages arrive</li>
              <li>Shows when another user is typing</li>
              <li>Shows read status for your sent messages</li>
            </ul>
          </section>

          {/* Message Actions */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              Message Actions on right clicking the message
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Reply, label: "Reply to a message with preview" },
                { icon: Copy, label: "Copy message text" },
                { icon: Forward, label: "Forward a message" },
                { icon: Pin, label: "Pin or unpin messages" },
                { icon: Trash2, label: "Delete your own recent messages" },
              ].map((action, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{action.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Media & Attachments */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Media & Attachments
            </h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>Lets you open attached files, images, and videos</li>
            </ul>
          </section>

          {/* Group Chat Features */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <AtSign className="h-5 w-5" />
              Group Chat Features
            </h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>Supports @mentions in group chats</li>
            </ul>
          </section>

          {/* Message Input */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Message Input</h3>
            <ul className="space-y-2 pl-6 list-disc text-muted-foreground">
              <li>Auto-expands the message input as you type</li>
              <li>Sends the message with the send button or Enter key</li>
            </ul>
          </section>

          {/* Quick Tips */}
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-2">💡 Quick Tips</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                • Press{" "}
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">
                  Enter
                </kbd>{" "}
                to send,{" "}
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">
                  Shift + Enter
                </kbd>{" "}
                for new line
              </li>
              <li>
                • Use{" "}
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">
                  Ctrl + K
                </kbd>{" "}
                to quickly search messages
              </li>
              <li>• Right-click on any message for more actions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
