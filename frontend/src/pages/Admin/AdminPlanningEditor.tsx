import { useState, useEffect } from 'react';
import PlanningTool from '../PlanningTool/PlanningTool';
import type { AdminUser } from '../AdminPage';
import type { AdminProperty, RoomPlan } from './AdminUserDetail';
import AdminSaveVersionModal from './AdminSaveVersionModal';
import { currentUser } from '../../lib/auth';

type AdminPlanningEditorProps = {
  plan: RoomPlan;
  property: AdminProperty;
  user: AdminUser;
  onSave: (planData: any, adminUsername: string) => void;
  onBack: () => void;
};

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

  useEffect(() => {
    const defaultVersionNumber = plan.selectedVersion ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
    const selectedVersion = plan.versions.find((v) => v.versionNumber === defaultVersionNumber) || plan.versions[plan.versions.length - 1];

    const planData = {
      length: selectedVersion.roomWidth,
      width: selectedVersion.roomHeight,
      property: property,
      planId: plan.id,
      userId: user.id,
      version: selectedVersion.versionNumber,
      doors: selectedVersion.doors,
      containers: selectedVersion.containers,
    };
    localStorage.setItem('trashRoomData', JSON.stringify(planData));
  }, [plan, property, user]);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedData = localStorage.getItem('trashRoomData');
      const planData = savedData ? JSON.parse(savedData) : {};
      
      const selectedVersionNumber = plan.selectedVersion ?? plan.activeVersionNumber ?? plan.versions[plan.versions.length - 1].versionNumber;
      const selectedVersion = plan.versions.find((v) => v.versionNumber === selectedVersionNumber) || plan.versions[plan.versions.length - 1];

      const admin = currentUser();
      const adminUsername = admin?.username || 'admin';

      onSave(
        {
          roomWidth: planData.length || selectedVersion.roomWidth,
          roomHeight: planData.width || selectedVersion.roomHeight,
          versionName: versionName || undefined,
          doors: planData.doors || selectedVersion.doors,
          containers: planData.containers || selectedVersion.containers,
          versionToReplace: versionToReplace || undefined,
        },
        adminUsername
      );

      setShowSaveModal(false);
      setVersionName('');
      setVersionToReplace(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 overflow-x-hidden">
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

      {/* Shared planning tool surface */}
      <div className="flex-1">
        <PlanningTool />
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
