import { useState, useEffect } from 'react';
import PlanningTool from '../PlanningTool/PlanningTool';
import type { AdminUser } from '../AdminPage';
import type { AdminProperty, RoomPlan } from './AdminUserDetail';
import AdminSaveVersionModal from './AdminSaveVersionModal';
import { currentUser } from '../../lib/Auth';
import { createAdminVersion } from '../../lib/WasteRoomRequest';
import type { DoorRequest, ContainerPositionRequest } from '../../lib/WasteRoomRequest';
import Message from '../../components/ShowStatus';
import { getWasteRoomById } from '../../lib/WasteRoom';
import LoadingBar from '../../components/LoadingBar';

type AdminPlanningEditorProps = {
  plan: RoomPlan;
  property: AdminProperty;
  user: AdminUser;
  onSave: (planData: any, adminUsername: string) => void;
  onBack: () => void;
};

// Wrapper component that ensures localStorage is set before PlanningTool mounts
function PlanningToolWrapper({ planData, isLoading, property }: { planData: any; isLoading: boolean; property?: any }) {
  const [initialized, setInitialized] = useState(false);

  // Visa alltid loading tills vi har riktig rumsdata att arbeta med
  if (isLoading || !planData) {
    return (
      <div className="py-16">
        <LoadingBar message="Laddar miljörummet för redigering…" />
      </div>
    );
  }

  if (typeof window !== 'undefined' && !initialized && planData) {
    console.log('PlanningToolWrapper - Loading room data:', {
      name: planData.name,
      width: planData.width,
      length: planData.length,
      x: planData.x,
      y: planData.y,
      containerCount: planData.containers?.length || 0,
      doorCount: planData.doors?.length || 0,
      version: planData.version,
      wasteRoomId: planData.wasteRoomId
    });

    const propertyId = planData.property?.id;

    localStorage.removeItem('trashRoomData');
    localStorage.removeItem('enviormentRoomData');
    localStorage.setItem('trashRoomData', JSON.stringify(planData));

    // Se till att jämförelse-API:t får ett propertyId även i admin-läge
    if (propertyId) {
      localStorage.setItem('selectedPropertyId', String(propertyId));
      localStorage.setItem('selectedProperty', JSON.stringify({ propertyId }));
    }

    setInitialized(true);
  }

  if (!planData || !property) return <LoadingBar />;
  return <PlanningTool isAdminMode={true} property={property} />;
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
  const [planData, setPlanData] = useState<any>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [msg, setMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch the actual waste room data from the database
  useEffect(() => {
    const loadWasteRoomData = async () => {
      try {
        setIsLoadingRoom(true);
        const defaultVersionNumber = plan.selectedVersion ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
        const selectedVersion = plan.versions.find((v) => v.versionNumber === defaultVersionNumber) || plan.versions[plan.versions.length - 1];

        console.log('Admin room editor - Selected version:', {
          versionNumber: selectedVersion.versionNumber,
          wasteRoomId: selectedVersion.wasteRoomId,
          roomName: plan.name,
          propertyId: property.id
        });

        // Fetch the actual waste room from the database using its wasteRoomId
        if (selectedVersion.wasteRoomId) {
          console.log('Fetching waste room from database with ID:', selectedVersion.wasteRoomId);
          const wasteRoom = await getWasteRoomById(selectedVersion.wasteRoomId);
          console.log('Successfully fetched from DATABASE:', {
            id: wasteRoom.id,
            name: wasteRoom.name,
            dimensions: `${wasteRoom.width}m × ${wasteRoom.length}m`,
            doors: wasteRoom.doors?.length || 0,
            containers: wasteRoom.containers?.length || 0,
            position: { x: wasteRoom.x, y: wasteRoom.y }
          });
          
          setPlanData({
            length: wasteRoom.length,
            width: wasteRoom.width,
            x: wasteRoom.x,
            y: wasteRoom.y,
            property: property,
            planId: plan.id,
            wasteRoomId: selectedVersion.wasteRoomId,
            userId: user.id,
            version: selectedVersion.versionNumber,
            name: plan.name,
            doors: wasteRoom.doors || [],
            containers: wasteRoom.containers || [],
          });
        } else {
          console.warn('No wasteRoomId found, using fallback version data');
          // Fallback: use version data if no wasteRoomId
          setPlanData({
            length: selectedVersion.roomHeight,
            width: selectedVersion.roomWidth,
            x: selectedVersion.x,
            y: selectedVersion.y,
            property: property,
            planId: plan.id,
            wasteRoomId: selectedVersion.wasteRoomId,
            userId: user.id,
            version: selectedVersion.versionNumber,
            name: plan.name,
            doors: selectedVersion.doors,
            containers: selectedVersion.containers,
          });
        }
      } catch (error) {
        console.error('Failed to load waste room data:', error);
        alert('Kunde inte ladda miljörummet. Försök igen senare.');
        onBack();
      } finally {
        setIsLoadingRoom(false);
      }
    };

    loadWasteRoomData();
  }, [plan, property, user, onBack]);

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
        doorCount: currentPlanData.doors?.length,
          x: currentPlanData.x,
          y: currentPlanData.y
      });

            setMsg("")
      setError("");
      setTimeout(() => setMsg("Version sparad"), 10);
      
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
      const roomX = currentPlanData.x !== undefined ? currentPlanData.x : selectedVersion.x ?? 150;
      const roomY = currentPlanData.y !== undefined ? currentPlanData.y : selectedVersion.y ?? 150;

      const requestPayload = {
        length: currentPlanData.width || selectedVersion.roomHeight,
        width: currentPlanData.length || selectedVersion.roomWidth,
        x: roomX,
        y: roomY,
        doors,
        containers,
        otherObjects: [],
        propertyId: property.id,
        versionName: versionName || undefined,
        adminUsername,
        versionToReplace: versionToReplace || undefined
      };

        if (requestPayload.length > 9) {
            setMsg("")
            setError("");
            setTimeout(() => setError("Rummets höjd får inte överstiga 9 meter"), 10);
            setSaving(false);
            return;
        }

        if (requestPayload.width > 12) {
            setMsg("")
            setError("");
            setTimeout(() => setError("Rummets längd får inte överstiga 12 meter"), 10);
            setSaving(false);
            return;
        }

        if (requestPayload.length < 2.5 || requestPayload.width < 2.5) {
            setMsg("")
            setError("");
            setTimeout(() => setError("Rummets bredd alternativt längd får inte vara under 2.5 meter"), 10);
            setSaving(false);
            return;
        }

      console.log('========== SAVE REQUEST PAYLOAD ==========');
      console.log('Full request payload being sent to backend:', requestPayload);
      console.log('Room position - x:', requestPayload.x, 'y:', requestPayload.y);
      console.log('Room dimensions - length:', requestPayload.length, 'width:', requestPayload.width);
      console.log('Containers:', requestPayload.containers.map(c => ({ id: c.id, x: c.x, y: c.y })));
      console.log('Doors:', requestPayload.doors.map(d => ({ x: d.x, y: d.y, wall: d.wall })));
      console.log('Property ID:', property.id, 'Room Name:', plan.name);

        console.log("Width:", requestPayload.width);
        console.log("Length:", requestPayload.length);

      // Call the backend API to save the new version
      const savedVersion = await createAdminVersion(property.id, plan.name, requestPayload);
      console.log('Backend response - saved version:', savedVersion);

      // Also call onSave to update local state
      onSave(
        {
          roomWidth: currentPlanData.width || selectedVersion.roomWidth,
          roomHeight: currentPlanData.length || selectedVersion.roomHeight,
            x: roomX,
            y: roomY,
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
      setMsg("")
      setError("");
      setTimeout(() => setMsg("Version sparad"), 10);
    } catch (error) {
      console.error('Error saving plan:', error);
        setMsg("")
        setError("");
        setTimeout(() => setError("Fel vid sparande av version. Se konsolen för detaljer"), 10);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-x-hidden">
        {/* Feedback messages */}
        <div className="stage-content-wrapper">
          {msg && <Message message={msg} type="success" />}
          {error && <Message message={error} type="error" />}
        </div>
      {/* Admin overlay header */}
      <div className="border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur lg:sticky lg:top-0 lg:z-50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 items-start gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-nsr-teal transition-colors hover:text-nsr-tealDark"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Tillbaka</span>
            </button>
            <div className="hidden h-6 w-px bg-gray-300 lg:block" />
            <div className="flex-1">
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
                      {' '}Visar version {selectedVersionNumber} av {plan.versions.length}
                      {isViewingActive ? (
                        <span className="ml-2 inline-flex items-center rounded-full bg-nsr-teal/15 px-2 py-0.5 text-xs font-semibold text-nsr-teal">
                          Aktiv
                        </span>
                      ) : (
                        <span className="ml-2 text-xs font-semibold text-orange-600">
                          (Äldre version – spara skapar ny version)
                        </span>
                      )}
                      {selectedVersion?.versionName && (
                        <span className="ml-2 text-xs text-gray-500">- {selectedVersion.versionName}</span>
                      )}
                      {plan.versions.length >= 6 && (
                        <span className="ml-2 text-xs font-semibold text-orange-600">(Max 6 versioner)</span>
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

      {/* Planning Tool */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border bg-white p-6 shadow-soft">
          {planData?.property && (
            <PlanningToolWrapper
              key={`${plan.id}-${plan.selectedVersion ?? plan.activeVersionNumber}`}
              planData={planData}
              isLoading={isLoadingRoom}
              property={planData.property}
            />
          )}
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
