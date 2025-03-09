
import { Layout } from '@/components/layout/Layout';
import { AssetForm } from '@/components/assets/AssetForm';

const AddAsset = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Add New Asset</h1>
        <p className="text-muted-foreground">Create a new asset record in the inventory system</p>
        
        <AssetForm />
      </div>
    </Layout>
  );
};

export default AddAsset;
