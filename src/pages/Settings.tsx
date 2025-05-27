
import { GeneralSettings } from '@/components/settings/general-settings'
import { WalletSettings } from '@/components/settings/wallet-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { SecuritySettings } from '@/components/settings/security-settings'

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your SCRYPTEX experience and manage your account preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GeneralSettings />
          <SecuritySettings />
        </div>
        <div className="space-y-6">
          <WalletSettings />
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}

export default Settings
