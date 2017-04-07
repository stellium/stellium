import * as path from 'path';

export const RootPath = StelliumRootPath
export const StoragePath = path.resolve(RootPath, 'storage')
export const ViewsPath = path.resolve(RootPath, 'views')
export const PublicPath = path.resolve(RootPath, 'public')
export const ScriptsPath = path.resolve(RootPath, 'js')
export const SeederPath = path.resolve(RootPath, 'seeder')
export const MediaPath = path.resolve(RootPath, 'media')
export const SnapshotPath = path.resolve(StoragePath, '.snapshots')
export const CachePath = path.resolve(StoragePath, '.cache')
