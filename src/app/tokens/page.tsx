
import { TokenFactory } from '@/components/tokens/token-factory'
import { TokenGallery } from '@/components/tokens/token-gallery'

export default function TokensPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Token Factory</h1>
        <p className="text-muted-foreground">
          Create and manage tokens across all supported chains. The platform automatically selects the optimal chain for deployment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TokenFactory />
        </div>
        <div className="lg:col-span-2">
          <TokenGallery />
        </div>
      </div>
    </div>
  )
}
