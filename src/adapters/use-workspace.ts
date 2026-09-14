import { useConvex, useQuery } from 'convex/react';
import { useRef, useState, type SetStateAction } from 'react';
import { api } from '../../convex/_generated/api';
import type { Client, CompanyProfile, ItemPackage, SavedDocumentSet } from '../../App';

export function useWorkspace() {
  const convex = useConvex(); const data = useQuery(api.workspace.read);
  const [error, setError] = useState(''); const [pending, setPending] = useState(0);
  const queue = useRef(Promise.resolve());
  function run(work: () => Promise<unknown>) {
    setPending(p => p + 1);
    const task = queue.current.then(work).then(() => { setError(''); });
    queue.current = task.catch(() => {});
    task.catch(() => setError('Save failed or another window changed this record. Please retry.')).finally(() => setPending(p => p - 1));
    return task;
  }
  const resolve = <T,>(value: SetStateAction<T>, current: T): T => typeof value === 'function' ? (value as (p: T) => T)(current) : value;
  return { data, error, pending,
    setCompanyLogo: (value: SetStateAction<string | null>) => { void run(async () => { const current = await convex.query(api.workspace.read); await convex.mutation(api.workspace.update, { logo: resolve(value, current.logo), expectedRevision: current.revision }); }); },
    setCompanyProfile: (value: SetStateAction<CompanyProfile>) => { void run(async () => { const current = await convex.query(api.workspace.read); await convex.mutation(api.workspace.update, { profile: resolve(value, current.profile), expectedRevision: current.revision }); }); },
    setClients: (value: SetStateAction<Client[]>) => { const before = data?.clients ?? []; const after = resolve(value, before); void run(async () => { for (const row of after) if (!before.some(r => JSON.stringify(r) === JSON.stringify(row))) await convex.mutation(api.workspace.saveClient, { data: row }); for (const row of before) if (!after.some(r => r.id === row.id)) await convex.mutation(api.workspace.deleteClient, { id: row.id }); }); },
    setItemPackages: (value: SetStateAction<ItemPackage[]>) => { const before = data?.packages ?? []; const after = resolve(value, before); void run(async () => { for (const row of after) if (!before.some(r => JSON.stringify(r) === JSON.stringify(row))) await convex.mutation(api.workspace.savePackage, { data: row }); for (const row of before) if (!after.some(r => r.id === row.id)) await convex.mutation(api.workspace.deletePackage, { id: row.id }); }); },
    saveDocumentSet: (set: SavedDocumentSet) => run(() => convex.mutation(api.workspace.saveLegacy, { data: { id: set.id, savedAt: set.savedAt, clientCompany: set.clientCompany, documents: set.documents }, expectedRevision: data?.documents.find(d => d.id === set.id)?.revision ?? 0 })),
    deleteDocumentSet: (id: string) => run(() => convex.mutation(api.workspace.archiveLegacy, { id })),
  };
}
