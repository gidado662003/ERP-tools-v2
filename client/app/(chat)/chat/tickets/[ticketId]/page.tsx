"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getTicket, getTicketMessages } from "@/app/api";

type Ticket = {
  ticketId: string;
  title?: string;
  clientName?: string;
  clientContact?: string;
  faultType?: string;
  description?: string;
  status?: string;
  assignedEngineerName?: string;
  assignedEngineerEmail?: string;
  chatId?: string;
  updatedAt?: string;
};

type TicketMessage = {
  _id: string;
  text: string;
  createdAt: string;
  senderId?: { username?: string };
};

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [tRes, mRes] = await Promise.all([
          getTicket(ticketId),
          getTicketMessages(ticketId, 200),
        ]);
        if (cancelled) return;
        setTicket(tRes?.ticket || null);
        setMessages(mRes?.data?.messages || []);
      } catch (e: any) {
        if (cancelled) return;
        setError("Failed to load ticket");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  return (
    <div className="h-full bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <SidebarTrigger className="h-9 w-9" />
          </div>
          <div>
            <div className="text-xs text-gray-500">
              <Link href="/chat/tickets" className="hover:underline">
                Tickets
              </Link>{" "}
              / {ticketId}
            </div>
            <h1 className="text-lg font-bold text-gray-900">{ticketId}</h1>
          </div>
        </div>
        {ticket?.chatId && (
          <Link
            href={`/chat/chats/${ticket.chatId}`}
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Open tickets chat
          </Link>
        )}
      </header>

      <div className="p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading ticket...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : !ticket ? (
          <div className="py-10 text-center text-gray-500">Ticket not found.</div>
        ) : (
          <>
            <div className="border rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-blue-600">{ticket.ticketId}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {ticket.title || "Untitled ticket"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {ticket.clientName ? `Client: ${ticket.clientName}` : ""}
                    {ticket.clientName && ticket.faultType ? " • " : ""}
                    {ticket.faultType ? `Fault: ${ticket.faultType}` : ""}
                  </div>
                  {ticket.clientContact && (
                    <div className="text-sm text-gray-600">
                      Contact: {ticket.clientContact}
                    </div>
                  )}
                </div>
                <div className="shrink-0">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {ticket.status || "Open"}
                  </div>
                  {ticket.updatedAt && (
                    <div className="text-[11px] text-gray-400 mt-1">
                      Updated: {new Date(ticket.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {(ticket.assignedEngineerName || ticket.assignedEngineerEmail) && (
                <div className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Assigned engineer:</span>{" "}
                  {[ticket.assignedEngineerName, ticket.assignedEngineerEmail]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              )}

              {ticket.description && (
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                    {ticket.description}
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">
                  Ticket history (messages)
                </div>
                <div className="text-xs text-gray-500">{messages.length} items</div>
              </div>

              {messages.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-sm">
                  No ticket messages found yet.
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {messages
                    .slice()
                    .reverse()
                    .map((m) => (
                      <div key={m._id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-semibold text-gray-700 truncate">
                            {m.senderId?.username || "System"}
                          </div>
                          <div className="text-[11px] text-gray-400 shrink-0">
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap mt-2">
                          {m.text}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

