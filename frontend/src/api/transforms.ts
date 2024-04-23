import { SearchParams, ShowParams, fileTypes } from '@models/searchParams';

export const transfromToShowRequestString = (showReq: ShowParams): string => {
	let diskToShow: string;
	if (showReq.disk) {
		if (typeof showReq.disk === 'string') {
			diskToShow = showReq.disk
		} else {
			diskToShow = showReq.disk.cloud_email
		}
	} else {
		diskToShow = 'all'
	}
	if (diskToShow === 'all') diskToShow = ''
	return [`/files?limit=${showReq.limit}`,
	`&offset=${showReq.offset}`,
	`&cloud_email=${diskToShow}`,
	`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${showReq.dir && showReq.dir.length !== 0 ? ['', ...showReq.dir].join('/') : '/'}`,
	`&first_nesting=${showReq.nestingReq === undefined ? true : showReq.nestingReq}`,
	`&dirs_required=${showReq.dirsReq === undefined ? true : showReq.dirsReq}`,
	`&files_required=${showReq.filesReq === undefined ? true : showReq.filesReq}`,
	`&shared_required=${showReq.sharedReq === undefined ? true : showReq.sharedReq}`,
	`&personal_required=${showReq.personalReq === undefined ? true : showReq.personalReq}`,
	`&external_disk_required=${showReq.externalDiskRequired}`,
	`&internal_disk_required=${showReq.internalDiskRequired}`].join('')
}

export const transformToSearchRequestString = (searchReq: SearchParams): string => {
	let diskToShow: string;
	if (searchReq.disk) {
		if (typeof searchReq.disk[0] === 'string') {
			diskToShow = searchReq.disk[0]
		} else {
			diskToShow = searchReq.disk[0].cloud_email
		}
	} else {
		diskToShow = 'all'
	}

	if (diskToShow === 'all') diskToShow = ''
	return [`files/search?is_smart_search=${searchReq.smartSearch}`,
	`&query=${searchReq.query}`,
	`&cloud_email=${diskToShow}`,
	`&file_type=${searchReq.fileType ? searchReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${searchReq.dir && searchReq.dir.length !== 0 ? ['', ...searchReq.dir].join('/') : '/'}`,
	`&limit=${searchReq.limit ? searchReq.limit : 10}`,
	`&offset=${searchReq.offset ? searchReq.offset : 0}`,
	`&first_nesting=${searchReq.nestingReq === undefined ? false : searchReq.nestingReq}`,
	`&dirs_required=${searchReq.dirsReq === undefined ? true : searchReq.dirsReq}`,
	`&files_required=${searchReq.filesReq === undefined ? true : searchReq.filesReq}`,
	`&shared_required=${searchReq.sharedReq === undefined ? true : searchReq.sharedReq}`,
	`&personal_required=${searchReq.personalReq === undefined ? true : searchReq.personalReq}`
	].join('')
}

export const transfromToSharedRequestParams = (showReq: ShowParams): string => {
	let emailToShow: string;
	let diskToShow: string;
	if (showReq.disk) {
		if (typeof showReq.disk === 'string') {
			emailToShow = showReq.disk
			diskToShow = 'all'
		} else {
			emailToShow = showReq.disk.cloud_email
			diskToShow = showReq.disk.disk
		}
	} else {
		emailToShow = 'all'
	}
	
	if (emailToShow === 'all') emailToShow = ''

	return [`?limit=${showReq.limit}`,
	`&offset=${showReq.offset}`,
	`&disk=${diskToShow}`,
	`&file_type=${showReq.fileType ? showReq.fileType.join(',') : 'all' as fileTypes}`,
	`&dir=${showReq.dir && showReq.dir.length !== 0 ? ['', ...showReq.dir].join('/') : '/'}`,
	`&first_nesting=${showReq.nestingReq === undefined ? true : showReq.nestingReq}`,
	`&dirs_required=${showReq.dirsReq === undefined ? true : showReq.dirsReq}`,
	`&files_required=${showReq.filesReq === undefined ? true : showReq.filesReq}`,
	`&external_disk_required=${true}`,
	`&internal_disk_required=${true}`,
	'&shared_required=true',
	`&cloud_email=${emailToShow}`,
	'&personal_required=false'].join('')
}

export const transfromToProcessedRequestParams = (showReq: ShowParams): string => {
	return [
		`?limit=${showReq.limit}`,
		`&offset=${showReq.offset}`,
		'&file_type=all',
		'&dir=/',
		'&dirs_required=false',
		'&files_required=true',
		'&status=uploaded'
	].join('')
}
