import {
  FiGitBranch,
  FiGitPullRequest,
  FiGitMerge,
  FiUploadCloud,
  FiAlertCircle,
} from "react-icons/fi";

type EventProps = {
  type: string;
  author: string;
  from_branch?: string;
  to_branch?: string;
  timestamp: string;
  action?: string;
};

const colorMap: Record<string, string> = {
  push: "bg-[#26233a]/80 border-l-4 border-[#31748f]",
  pull_request: "bg-[#232136]/90 border-l-4 border-[#f6c177]",
  merge: "bg-[#2a283e]/90 border-l-4 border-[#9ccfd8]",
  closed: "bg-[#2a232b]/90 border-l-4 border-[#eb6f92]",
  default: "bg-[#232136]/80 border-l-4 border-[#6e6a86]",
};

const iconMap: Record<string, React.ReactNode> = {
  push: (
    <FiUploadCloud className="text-[#31748f] text-2xl sm:text-3xl flex-shrink-0" />
  ),
  pull_request: (
    <FiGitPullRequest className="text-[#f6c177] text-2xl sm:text-3xl flex-shrink-0" />
  ),
  merge: (
    <FiGitMerge className="text-[#9ccfd8] text-2xl sm:text-3xl flex-shrink-0" />
  ),
  closed: (
    <FiAlertCircle className="text-[#eb6f92] text-2xl sm:text-3xl flex-shrink-0" />
  ),
  default: (
    <FiGitBranch className="text-[#6e6a86] text-2xl sm:text-3xl flex-shrink-0" />
  ),
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const then = new Date(dateStr);
  const diff = Math.max(0, now.getTime() - then.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function EventItem({
  type,
  author,
  from_branch,
  to_branch,
  timestamp,
  action,
}: EventProps) {
  const absoluteTime = new Date(timestamp).toLocaleString();
  const relativeTime = timeAgo(timestamp);

  let message: React.ReactNode;
  let colorClass = colorMap[type] || colorMap.default;
  let iconNode = iconMap[type] || iconMap.default;

  if (type === "pull_request" && action === "closed") {
    colorClass = colorMap.closed;
    iconNode = iconMap.closed;
  }

  // Maintain strict format as requested, use light font for message
  if (type === "push") {
    message = (
      <>
        <span className=" text-[#908caa]">
          "{author}" pushed to "{to_branch}" on {formatDate(timestamp)}
        </span>
      </>
    );
  } else if (type === "pull_request") {
    message = (
      <>
        <span className="ight text-[#908caa]">
          "{author}" submitted a pull request from "{from_branch}" to "
          {to_branch}" on {formatDate(timestamp)}
        </span>
      </>
    );
  } else if (type === "merge") {
    message = (
      <>
        <span className="ight text-[#908caa]">
          "{author}" merged branch "{from_branch}" to "{to_branch}" on{" "}
          {formatDate(timestamp)}
        </span>
      </>
    );
  } else {
    message = (
      <>
        <span className="ight text-[#908caa]">
          {author} performed an action of type "{type}" on{" "}
          {formatDate(timestamp)}
        </span>
      </>
    );
  }

  return (
    <div
      className={`relative w-full ${colorClass} px-0 sm:px-5  py-5 mb-3 transition-all duration-300 border-l-4 rounded-2xl`}
      aria-label={type + " event"}
      style={{
        display: "flex",
        alignItems: "stretch",
        minHeight: "64px",
        boxShadow: "none",
        border: "none",
      }}
    >
      <div className="flex items-center justify-center mr-5 min-w-[2.2rem]">
        {iconNode}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-1 text-base sm:text-md leading-snug">
          {message}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#b6b5d2] mt-1">
          <span>
            {relativeTime}
            <span className="mx-1 text-[#908caa]">|</span>
            <span className="font-mono px-1.5 py-0.5 bg-[#1f1d2e] rounded text-xs">
              {absoluteTime}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
