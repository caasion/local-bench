import type { MockBenchmarkRun } from "./mockData";
import { formatTimeShort } from "./mockData";

interface ResultCardProps {
  run: MockBenchmarkRun;
  onClose?: () => void;
  compact?: boolean;
}

export function ResultCard({ run, onClose, compact }: ResultCardProps) {
  // Format the date to match the image: e.g., 15/05/2026, 3:32:51 pm
  const date = new Date(run.run_at);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);

  return (
    <div className="bg-[#1e1e1e] text-[#e0e0e0] border border-[#333] rounded-xl p-8 h-full" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4">
        <h2 className="text-[1.35rem] font-semibold text-white">{run.model_name} Profile</h2>
        <span className="text-[#a0a0a0] text-sm">{formattedDate}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-10">
        {/* Profile */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Profile</h3>
          <p className="text-sm text-[#888] mb-5">Profile criteria</p>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Maximum time until first token</span>
              <span className="font-medium text-white">10s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Minimum context window</span>
              <span className="font-medium text-white">4096</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Test Thinking</span>
              <span className="font-medium text-white">yes</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Score Breakdown</h3>
          <p className="text-sm text-[#888] mb-5">Model score based on profile criteria</p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[#a0a0a0]">Speed</span>
              <div className="h-3.5 bg-[#333] rounded-full overflow-hidden">
                <div className="h-full bg-[#d65ce1] rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-right text-gray-300">32/40</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[#a0a0a0]">Fit</span>
              <div className="h-3.5 bg-[#333] rounded-full overflow-hidden">
                <div className="h-full bg-[#d65ce1] rounded-full" style={{ width: '52%' }}></div>
              </div>
              <span className="text-right text-gray-300">13/25</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[#a0a0a0]">Accuracy</span>
              <div className="h-3.5 bg-[#333] rounded-full overflow-hidden">
                <div className="h-full bg-[#d65ce1] rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-right text-gray-300">20/25</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[#a0a0a0]">Stability</span>
              <div className="h-3.5 bg-[#333] rounded-full overflow-hidden">
                <div className="h-full bg-[#d65ce1] rounded-full" style={{ width: '90%' }}></div>
              </div>
              <span className="text-right text-gray-300">9/10</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Details</h3>
          <p className="text-sm text-[#888] mb-5">Benchmark result details</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Tokens per second</span>
              <span className="font-medium text-white">{run.tokens_per_second.toFixed(1)}/s</span>
            </div>
            {/* Right column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Time until first token</span>
              <span className="font-medium text-white">{formatTimeShort(run.ttft_ns_mean)}</span>
            </div>
            {/* Left column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Total tokens</span>
              <span className="font-medium text-white">{run.total_tokens}</span>
            </div>
            {/* Right column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">Total tokens</span>
              <span className="font-medium text-white">{run.total_tokens}</span>
            </div>
            {/* Left column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">VRam peak</span>
              <span className="font-medium text-white">{run.vram_peak_mb}</span>
            </div>
            <div />{/* Empty right column */}
            {/* Left column */}
            <div className="flex justify-between items-center">
              <span className="text-[#a0a0a0]">CPU peak %</span>
              <span className="font-medium text-white">{run.cpu_peak_percent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Model Details */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Model Details</h3>
          <p className="text-sm text-[#888]">Huggingface data</p>
        </div>
      </div>
    </div>
  );
}
