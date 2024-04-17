import { diskTypes } from './disk';
import { ConnectedClouds } from './user';

export const sharedType = {
  reader: 'reader',
  writer: 'writer',
} as const;

export type fileTypes = 'all' | 'img' | 'video' | 'text' | 'audio';

/** if text of diskType return true */
export const isFileType = (text: string): boolean => {
  if (['all', 'img', 'video', 'text', 'audio'].includes(text)) return true;
  return false;
};


export interface SearchParamsLocal {
  smartSearch: boolean;
  fileType?: fileTypes[];
  query: string;
  dir?: string[];
  disk?: diskTypes[] | ConnectedClouds[];
  sharedReq?: boolean,
  dirsReq?: boolean,
  filesReq?: boolean,
  nestingReq?: boolean,
  personalReq?: boolean,
}

export const transformToSearchParams = (obj: {
  query?: string,
  is_smart_search?: string,
  limit?: string,
  offset?: string,
  file_type?: string,
  dir?: string,
  cloud_email?: string,
  external_disk_required?: string,
  internal_disk_required?: string,
}) => {
  let fileType: fileTypes[] | string[];
  if (obj.file_type) {
    fileType = obj.file_type.split(',')?.filter(val => isFileType(val)) || ['all']
  } else {
    fileType = ['all']
  }

  return {
    limit: Number(obj.limit) || 10,
    offset: Number(obj.offset) || 0,
    fileType: fileType || 'all',
    dir: obj.dir ? obj.dir.split('/').filter(val => val !== '') : [],
    disk: obj.cloud_email?.split(',') || ['all'],
    query: obj.query || '',
    smartSearch: obj.is_smart_search === 'true' ? true : false,
    externalDiskRequired: obj.external_disk_required === 'true',
    internalDiskRequired: obj.internal_disk_required === 'true',
  } as SearchParams
}



export interface SearchParams extends SearchParamsLocal {
  limit?: number;
  offset?: number;
  externalDiskRequired?: boolean;
  internalDiskRequired?: boolean;
}

export interface fileFile {
  id: string;
  filename: string;
  user_id: string;
  email: string,
  path: string;
  bucket: string,
  is_dir: boolean;
  file_type: fileTypes,
  size: string;
  'content_type': string;
  extension: string;
  status: string;
  is_shared: boolean,
  share_access: string,
  share_link: string,
  date: string;
  link: string,
  cloud_email: string,
  disk: diskTypes,
  shared: {
    author_id: string;
    access: typeof sharedType;
    is_owner: boolean;
  };
  duration?: number,
  timestart?: number,
  page_number?: number,
}

export interface SearchResponse {
  status: number;
  message: string;
  body: fileFile[];
}

export const transformToShowParams = (obj: {
  limit?: number,
  offset?: number,
  file_type?: string,
  dir?: string,
  cloud_email?: string,
  external_disk_required?: string,
  internal_disk_required?: string,
}) => {
  let fileType: fileTypes[];
  if (obj.file_type) {
    fileType = obj.file_type.split(',')?.filter(val => isFileType(val)) as fileTypes[] || ['all']
  } else {
    fileType = ['all']
  }

  let dir = obj.dir?.split('/').filter(val => val !== '');
  if (dir) {
    if (dir.length === 0) {
      dir = []
    }
  } else {
    dir = []
  }

  return {
    limit: obj.limit || 10,
    offset: obj.offset || 0,
    fileType: fileType || 'all',
    dir: dir,
    disk: obj.cloud_email || 'all',
    externalDiskRequired: obj.external_disk_required === 'true',
    internalDiskRequired: obj.internal_disk_required === 'true',
  } as ShowParams
}

export interface ShowParams {
  limit: number;
  offset: number;
  fileType?: fileTypes[];
  dir?: string[];
  disk?: diskTypes | ConnectedClouds;
  sharedReq?: boolean,
  dirsReq?: boolean,
  filesReq?: boolean,
  nestingReq?: boolean,
  personalReq?: boolean,
  externalDiskRequired?: boolean,
  internalDiskRequired?: boolean,
}

export interface ShowResponse {
  body: fileFile[];
}

export interface SharedUUIDResponse {
  body: fileFile
}

export interface DiskSearch {
  disk: diskTypes;
  dir: string;
}

export type AccessRights = 'reader' | 'writer' | ''

export const isAccessRights = (stringToCheck: string): boolean => {
  return stringToCheck === 'reader' || stringToCheck === 'writer'
}

export const getAccessRights = (stringToTransfrom: string): AccessRights => {
  switch (stringToTransfrom) {
    case 'reader':
      return 'reader';
    case 'writer':
      return 'writer'
    default:
      return 'writer'
  }
}

export interface ShareRequest {
  dir: string;
  access_type: AccessRights;
  by_emails: boolean;
  emails: string[]
}

export interface ShareResponse {
  body: {
    share_link: string
  },
  message: string,
  status: number,
}
