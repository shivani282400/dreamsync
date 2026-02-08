import CommunityFeed from "../components/community/CommunityFeed";
import PageTransition from "../components/ui/PageTransition";

export default function Community() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto mt-12 px-4 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Shared dreams
          </h1>

          <p className="text-textMuted text-sm max-w-xl">
            Explore dreams shared anonymously by people experiencing similar emotions.
          </p>

          {/* Philosophy line (important for tone) */}
          <p className="text-xs text-textMuted/80 max-w-xl">
            These are not interpretations — only echoes of recurring feelings and symbols.
          </p>
        </div>

        {/* Community Feed */}
        <CommunityFeed />
      </div>
    </PageTransition>
  );
}
