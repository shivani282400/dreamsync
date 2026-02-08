import { useInsightStore } from "../../store/insightStore";

export default function DreamClusterCard() {
  const clusters = useInsightStore((s) => s.clusters);

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-white/85">
        Dream Chapters
      </h2>

      {clusters.map((cluster) => (
        <div
          key={cluster.clusterId}
          className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-xl p-5 border border-white/10 backdrop-blur"
        >
          <p className="text-white/90 font-light mb-1">
            {cluster.label}
          </p>

          <p className="text-sm text-white/50">
            {cluster.dreamIds.length} dreams feel connected
          </p>
        </div>
      ))}
    </div>
  );
}
