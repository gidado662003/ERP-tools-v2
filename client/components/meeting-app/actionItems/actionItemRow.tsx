import { ActionItem } from "@/lib/meeting/meetingAppTypes";

const statusColor: Record<string, string> = {
  completed: "bg-green-500",
  "in-progress": "bg-yellow-500",
  pending: "bg-gray-400",
};

function ActionItemRow({ item }: { item: ActionItem }) {
  const isOverdue =
    new Date(item.due) < new Date() && item.status !== "completed";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 transition">
      {/* Left */}
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div
          className={`w-2 h-2 mt-2 rounded-full ${
            isOverdue ? "bg-red-500" : statusColor[item.status]
          }`}
        />

        <div>
          <p className="font-medium text-sm">{item.desc}</p>

          <p className="text-xs text-gray-500">
            {item.owner.map((o) => o.username).join(", ")}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="text-right text-xs text-gray-500">
        <p className={isOverdue ? "text-red-500 font-medium" : ""}>
          Due: {new Date(item.due).toLocaleDateString()}
        </p>

        {item.penalty && <p>Penalty: {item.penalty}</p>}
      </div>
    </div>
  );
}

export default ActionItemRow;
