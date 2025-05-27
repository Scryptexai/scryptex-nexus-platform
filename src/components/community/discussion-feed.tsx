
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Clock } from "lucide-react"

export function DiscussionFeed() {
  const discussions = [
    {
      id: 1,
      title: "New farming strategies for RiseChain",
      author: "CryptoFarmer",
      avatar: "/placeholder.svg",
      replies: 23,
      likes: 45,
      time: "2h ago",
      chain: "RiseChain"
    },
    {
      id: 2,
      title: "Abstract governance proposal discussion",
      author: "DeFiGuru",
      avatar: "/placeholder.svg",
      replies: 18,
      likes: 32,
      time: "4h ago",
      chain: "Abstract"
    },
    {
      id: 3,
      title: "0G data storage optimization tips",
      author: "DataMiner",
      avatar: "/placeholder.svg",
      replies: 12,
      likes: 28,
      time: "6h ago",
      chain: "0G Galileo"
    },
    {
      id: 4,
      title: "Somnia quest completion guide",
      author: "QuestMaster",
      avatar: "/placeholder.svg",
      replies: 35,
      likes: 67,
      time: "8h ago",
      chain: "Somnia"
    }
  ]

  const getChainColor = (chain: string) => {
    switch (chain) {
      case "RiseChain": return "bg-blue-500/20 text-blue-400"
      case "Abstract": return "bg-purple-500/20 text-purple-400"
      case "0G Galileo": return "bg-green-500/20 text-green-400"
      case "Somnia": return "bg-orange-500/20 text-orange-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <Card className="cyber-border">
      <CardHeader>
        <CardTitle className="cyber-text flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion Feed
        </CardTitle>
        <CardDescription>Latest community discussions and updates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {discussions.map((discussion) => (
          <div key={discussion.id} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={discussion.avatar} />
                <AvatarFallback>{discussion.author[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium hover:text-primary transition-colors">
                    {discussion.title}
                  </h4>
                  <Badge className={getChainColor(discussion.chain)}>
                    {discussion.chain}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>by {discussion.author}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{discussion.replies}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{discussion.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{discussion.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
