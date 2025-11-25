import { useState, useMemo } from 'react';
import PlanningTool from '../PlanningTool/PlanningTool';
import type { AdminUser } from '../AdminPage';
import type { AdminProperty, RoomPlan } from './AdminUserDetail';
import AdminSaveVersionModal from './AdminSaveVersionModal';
import { currentUser } from '../../lib/Auth';
import { createAdminVersion } from '../../lib/WasteRoomRequest';
import type { DoorRequest, ContainerPositionRequest } from '../../lib/WasteRoomRequest';

type AdminPlanningEditorProps = {
  plan: RoomPlan;
  property: AdminProperty;
  user: AdminUser;
  onSave: (planData: any, adminUsername: string) => void;
  onBack: () => void;
};

// Wrapper component that ensures localStorage is set before PlanningTool mounts
function PlanningToolWrapper({ planData }: { planData: any }) {
  const [initialized, setInitialized] = useState(false);
  
  if (typeof window !== 'undefined' && !initialized) {
    console.log('PlanningToolWrapper - Initial setup of localStorage');
    localStorage.removeItem('trashRoomData');
    localStorage.removeItem('enviormentRoomData');
    localStorage.setItem('trashRoomData', JSON.stringify(planData));
    setInitialized(true);
  }
  
  return <PlanningTool isAdminMode={true} />;
}

export default function AdminPlanningEditor({
  plan,
  property,
  user,
  onSave,
  onBack,
}: AdminPlanningEditorProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [versionToReplace, setVersionToReplace] = useState<number | null>(null);

  // Prepare the plan data
  const planData = useMemo(() => {
    const defaultVersionNumber = plan.selectedVersion ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
    const selectedVersion = plan.versions.find((v) => v.versionNumber === defaultVersionNumber) || plan.versions[plan.versions.length - 1];

    return {
      length: selectedVersion.roomWidth,
      width: selectedVersion.roomHeight,
      property: property,
      planId: plan.id,
      wasteRoomId: selectedVersion.wasteRoomId,
      userId: user.id,
      version: selectedVersion.versionNumber,
      name: plan.name,
      doors: selectedVersion.doors,
      containers: selectedVersion.containers,
    };
  }, [plan, property, user]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const savedData = localStorage.getItem('trashRoomData');
      console.log('========== READING FROM LOCALSTORAGE ==========');
      console.log('Raw localStorage data:', savedData);
      const currentPlanData = savedData ? JSON.parse(savedData) : {};
      console.log('Parsed currentPlanData:', {
        hasContainers: !!currentPlanData.containers,
        containerCount: currentPlanData.containers?.length,
        hasDoors: !!currentPlanData.doors,
        doorCount: currentPlanData.doors?.length
      });
      
      const selectedVersionNumber = plan.selectedVersion ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
      const selectedVersion = plan.versions.find((v) => v.versionNumber === selectedVersionNumber) || plan.versions[plan.versions.length - 1];

      const admin = currentUser();
      const adminUsername = admin?.username || 'admin';

      // Prepare doors in the correct format for the backend
      const rawDoors = currentPlanData.doors || selectedVersion.doors || [];
      console.log('Raw doors before mapping:', rawDoors);
      
      const doors: DoorRequest[] = rawDoors.map((d: any) => ({
        x: d.x ?? 0,
        y: d.y ?? 0,
        width: d.width ?? 1.2,
        wall: d.wall ?? 'bottom',
        angle: d.rotation ?? d.angle ?? 0,
        swingDirection: d.swingDirection ?? 'inward'
      }));
      
      console.log('Mapped doors for backend:', doors);

      const rawContainers = currentPlanData.containers || selectedVersion.containers || [];
      console.log('========== SAVE VERSION DEBUG ==========');
      console.log('Raw containers before mapping:', rawContainers);
      console.log('Number of containers:', rawContainers.length);
      console.log('currentPlanData.containers length:', currentPlanData.containers?.length);
      console.log('selectedVersion.containers length:', selectedVersion.containers?.length);
      
      const containers: ContainerPositionRequest[] = rawContainers.map((c: any) => {
        // Try multiple ways to get the container type ID
        const containerId = c.container?.id ?? c.containerDTO?.id ?? c.containerType?.id ?? c.id;
        console.log('Container mapping:', { 
          original: c, 
          extractedId: containerId,
          x: c.x,
          y: c.y,
          angle: c.rotation ?? c.angle,
          hasContainer: !!c.container,
          hasContainerDTO: !!c.containerDTO,
          containerName: c.container?.name ?? c.containerDTO?.name
        });
        
        return {
          id: containerId,
          x: c.x ?? 0,
          y: c.y ?? 0,
          angle: c.rotation ?? c.angle ?? 0
        };
      });
      
      console.log('Mapped containers for backend:', containers);

      const requestPayload = {
        length: currentPlanData.length || selectedVersion.roomWidth,
        width: currentPlanData.width || selectedVersion.roomHeight,
        x: currentPlanData.x ?? 150,
        y: currentPlanData.y ?? 150,
        doors,
        containers,
        propertyId: property.id,
        versionName: versionName || undefined,
        adminUsername,
        versionToReplace: versionToReplace || undefined
      };
      
      console.log('Full request payload being sent to backend:', requestPayload);
      console.log('Property ID:', property.id, 'Room Name:', plan.name);

      // Call the backend API to save the new version
      const savedVersion = await createAdminVersion(property.id, plan.name, requestPayload);
      console.log('Backend response - saved version:', savedVersion);

      // Also call onSave to update local state
      onSave(
        {
          roomWidth: currentPlanData.length || selectedVersion.roomWidth,
          roomHeight: currentPlanData.width || selectedVersion.roomHeight,
          versionName: versionName || undefined,
          doors: selectedVersion.doors,
          containers: selectedVersion.containers,
          versionToReplace: versionToReplace || undefined,
        },
        adminUsername
      );

      setShowSaveModal(false);
      setVersionName('');
      setVersionToReplace(null);
      setHasUnsavedChanges(false);
      
      // Show success message
      alert('Version sparad!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Fel vid sparande av version. Se konsolen för detaljer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-nsr-teal hover:text-nsr-tealDark transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Tillbaka</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-lg font-black text-nsr-ink">
                  Redigera: {plan.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Fastighet: {property.address} • Användare: {user.username} • 
                  {(() => {
                    const defaultVersionNumber = plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
                    const selectedVersionNumber = plan.selectedVersion ?? defaultVersionNumber;
                    const selectedVersion = plan.versions.find((v) => v.versionNumber === selectedVersionNumber);
                    const isViewingActive = selectedVersionNumber === defaultVersionNumber;
                    return (
                      <>
                        Visar version {selectedVersionNumber} av {plan.versions.length}
                        {isViewingActive ? (
                          <span className="ml-2 text-xs bg-nsr-teal/20 text-nsr-teal px-2 py-0.5 rounded-full font-medium">Aktiv</span>
                        ) : (
                          <span className="ml-2 text-xs text-orange-600 font-medium">(Äldre version – spara skapar ny version)</span>
                        )}
                        {selectedVersion?.versionName && (
                          <span className="ml-2 text-xs text-gray-500">- {selectedVersion.versionName}</span>
                        )}
                        {plan.versions.length >= 6 && (
                          <span className="ml-2 text-xs text-orange-600 font-medium">(Max 6 versioner)</span>
                        )}
                      </>
                    );
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-gray-500">Osparade ändringar</span>
              )}
              <button onClick={handleSaveClick} className="btn-primary">
                Spara version
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Planning Tool */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          <PlanningToolWrapper 
            key={`${plan.id}-${plan.selectedVersion ?? plan.activeVersionNumber}`}
            planData={planData}
          />
        </div>
      </div>

      {/* Save Version Modal */}
      <AdminSaveVersionModal
        open={showSaveModal}
        currentVersion={(() => {
          const selectedVersionNumber = plan.selectedVersion || plan.versions[plan.versions.length - 1].versionNumber;
          return selectedVersionNumber;
        })()}
        currentVersionCount={plan.versions.length}
        versions={plan.versions}
        versionName={versionName}
        onVersionNameChange={setVersionName}
        versionToReplace={versionToReplace}
        onVersionToReplaceChange={setVersionToReplace}
        onConfirm={handleConfirmSave}
        onCancel={() => {
          setShowSaveModal(false);
          setVersionName('');
          setVersionToReplace(null);
        }}
        loading={saving}
      />
    </div>
  );
}

