import { useState } from 'react';
import AppSidebar from '@/components/Sidebar';
import AppNavbar from '@/components/AppNavbar';
import DashboardView from '@/components/DashboardView';
import UploadView from '@/components/UploadView';
import PrivacyConfigView from '@/components/PrivacyConfigView';
import MapView from '@/components/MapView';
import ResultsView from '@/components/ResultsView';
import SettingsView from '@/components/SettingsView';
import { TrajectoryPoint, PrivacyMetrics } from '@/lib/trajectoryUtils';

export default function Index() {
  const [activeTab, setActiveTab] = useState('upload');
  const [originalData, setOriginalData] = useState<TrajectoryPoint[]>([]);
  const [anonymizedData, setAnonymizedData] = useState<TrajectoryPoint[]>([]);
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);

  const handleDataLoaded = (points: TrajectoryPoint[], name: string) => {
    setOriginalData(points);
    setAnonymizedData([]);
    setMetrics(null);
    setActiveTab('privacy');
  };

  const handleProcessed = (anonymized: TrajectoryPoint[], newMetrics: PrivacyMetrics) => {
    setAnonymizedData(anonymized);
    setMetrics(newMetrics);
    setActiveTab('dashboard');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <DashboardView metrics={metrics} hasData={originalData.length > 0} />
            {metrics && anonymizedData.length > 0 && (
              <div className="border-t border-border pt-8">
                <MapView originalData={originalData} anonymizedData={anonymizedData} />
              </div>
            )}
          </div>
        );
      case 'upload': return <UploadView onDataLoaded={handleDataLoaded} />;
      case 'privacy':
        return <PrivacyConfigView originalData={originalData} onProcessed={handleProcessed} />;
      case 'results': return <ResultsView metrics={metrics} originalData={originalData} anonymizedData={anonymizedData} />;
      case 'settings': return <SettingsView />;
      default: return <UploadView onDataLoaded={handleDataLoaded} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 grid-bg">
          <div className="w-full max-w-[95%] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
