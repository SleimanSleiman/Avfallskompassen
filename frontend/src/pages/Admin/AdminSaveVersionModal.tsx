import { useEffect } from 'react';
import type { PlanVersion } from './AdminUserDetail';

type AdminSaveVersionModalProps = {
  open: boolean;
  currentVersion: number;
  currentVersionCount: number;
  versions: PlanVersion[];
  versionName: string;
  onVersionNameChange: (name: string) => void;
  versionToReplace: number | null;
  onVersionToReplaceChange: (versionNumber: number | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

export default function AdminSaveVersionModal({
  open,
  currentVersion,
  currentVersionCount,
  versions,
  versionName,
  onVersionNameChange,
  versionToReplace,
  onVersionToReplaceChange,
  onConfirm,
  onCancel,
  loading,
}: AdminSaveVersionModalProps) {
  if (!open) return null;

  const isAtMax = currentVersionCount >= 6;
  
  useEffect(() => {
    if (open && isAtMax && versionToReplace === null && versions.length > 0) {
      const oldestVersion = versions.reduce((oldest, v) => 
        v.versionNumber < oldest.versionNumber ? v : oldest
      );
      onVersionToReplaceChange(oldestVersion.versionNumber);
    }
  }, [open, isAtMax, versionToReplace, versions, onVersionToReplaceChange]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md max-h-[85vh] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl flex flex-col">
          <h3 className="text-xl font-black text-nsr-ink">Spara version av planering</h3>
          <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1">
            {isAtMax ? (
              <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800 border border-orange-200">
                <p className="font-medium">Varning: Max antal versioner nått</p>
                <p className="mt-1 brodtext mb-3">
                  Du har redan {currentVersionCount} versioner (max 6). Välj vilken version som ska ersättas:
                </p>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <label
                      key={version.versionNumber}
                      className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        versionToReplace === version.versionNumber
                          ? 'bg-orange-100 border-orange-300'
                          : 'bg-white border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="versionToReplace"
                        value={version.versionNumber}
                        checked={versionToReplace === version.versionNumber}
                        onChange={() => onVersionToReplaceChange(version.versionNumber)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Version {version.versionNumber}
                            {version.versionName && ` - ${version.versionName}`}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            version.createdBy === 'admin'
                              ? 'bg-nsr-accent/20 text-nsr-accent'
                              : 'bg-nsr-teal/20 text-nsr-teal'
                          }`}>
                            {version.createdBy === 'admin' ? 'Admin' : 'Användare'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {version.createdBy === 'admin' && version.adminUsername && `Admin: ${version.adminUsername} • `}
                          Skapad: {new Date(version.createdAt).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : currentVersionCount === 5 ? (
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
                <p className="font-medium">Varning: Nästa version blir max</p>
                <p className="mt-1 brodtext">
                  Du har {currentVersionCount} versioner. Efter denna blir det 6 versioner (max). 
                  Nästa version kommer att kräva val av version att ersätta.
                </p>
              </div>
            ) : null}
            <p className="text-sm text-gray-700 brodtext">
              Du är på väg att spara en ny version av denna planering. Detta kommer att öka
              versionsnumret från {currentVersion} till {currentVersion + 1}.
            </p>
            <div>
              <label htmlFor="versionName" className="block text-sm font-medium mb-2 text-nsr-ink">
                Versionsnamn (valfritt)
              </label>
              <input
                id="versionName"
                type="text"
                value={versionName}
                onChange={(e) => onVersionNameChange(e.target.value)}
                placeholder={`Version ${currentVersion + 1}`}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-nsr-teal focus:ring-nsr-teal px-3 py-2"
              />
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <p className="font-medium">Information:</p>
              <ul className="mt-1 list-disc list-inside space-y-1 brodtext">
                <li>Användaren kommer att se den nya versionen</li>
                <li>Tidigare versioner behålls för historik</li>
                <li>Alla ändringar i rummet, dörrar och kärl sparas</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>
              Avbryt
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || (isAtMax && versionToReplace === null)}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sparar...' : 'Spara version'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

