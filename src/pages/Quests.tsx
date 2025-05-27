
import { QuestBoard } from '@/components/quests/quest-board'
import { AchievementGallery } from '@/components/quests/achievement-gallery'
import { Leaderboards } from '@/components/quests/leaderboards'
import { ProgressTracker } from '@/components/quests/progress-tracker'

const Quests = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Gaming Quests
        </h1>
        <p className="text-muted-foreground">
          Complete challenges, earn achievements, and climb the leaderboards across all chains.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuestBoard />
          <AchievementGallery />
        </div>
        <div className="space-y-6">
          <ProgressTracker />
          <Leaderboards />
        </div>
      </div>
    </div>
  )
}

export default Quests
