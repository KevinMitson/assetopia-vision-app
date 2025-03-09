
import { Layout } from '@/components/layout/Layout';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

const Settings = () => {
  return (
    <Layout>
      <div className="animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <div className="max-w-4xl">
          <SettingsTabs />
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
