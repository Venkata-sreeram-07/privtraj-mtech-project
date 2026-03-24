import { useState } from 'react';
import AppSidebar from '@/components/Sidebar';
import DashboardView from '@/components/DashboardView';
import UploadView from '@/components/UploadView';
import PrivacyConfigView from '@/components/PrivacyConfigView';
import MapView from '@/components/MapView';
import ResultsView from '@/components/ResultsView';
import SettingsView from '@/components/SettingsView';
import { TrajectoryPoint, PrivacyMetrics } from '@/lib/trajectoryUtils';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
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
    setActiveTab('map');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView metrics={metrics} hasData={originalData.length > 0} />;
      case 'upload': return <UploadView onDataLoaded={handleDataLoaded} />;
      case 'privacy': return <PrivacyConfigView originalData={originalData} onProcessed={handleProcessed} />;
      case 'map': return <MapView originalData={originalData} anonymizedData={anonymizedData} />;
      case 'results': return <ResultsView metrics={metrics} originalData={originalData} anonymizedData={anonymizedData} />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView metrics={metrics} hasData={originalData.length > 0} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 grid-bg">
        <div className="max-w-5xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
