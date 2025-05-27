
import { TokenCreatorForm } from '@/components/tokens/token-creator-form'
import { DeploymentPreview } from '@/components/tokens/deployment-preview'
import { ChainOptimizer } from '@/components/tokens/chain-optimizer'

const TokenCreate = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Create Token
        </h1>
        <p className="text-muted-foreground">
          Launch your own token with optimized deployment across supported chains.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <TokenCreatorForm />
          <ChainOptimizer />
        </div>
        <div>
          <DeploymentPreview />
        </div>
      </div>
    </div>
  )
}

export default TokenCreate
