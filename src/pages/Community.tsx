
import { CommunityOverview } from '@/components/community/community-overview'
import { DiscussionFeed } from '@/components/community/discussion-feed'
import { GovernanceVoting } from '@/components/community/governance-voting'
import { UserProfiles } from '@/components/community/user-profiles'

const Community = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Community Hub
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow farmers, participate in governance, and build reputation across the ecosystem.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <CommunityOverview />
          <DiscussionFeed />
        </div>
        <div className="space-y-6">
          <GovernanceVoting />
          <UserProfiles />
        </div>
      </div>
    </div>
  )
}

export default Community
