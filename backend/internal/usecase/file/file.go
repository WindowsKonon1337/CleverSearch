package file

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/delivery/shared"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/cleveruser"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	fileDomain "github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/notifier"
	"github.com/WindowsKonon1337/CleverSearch/internal/domain/sharederrors"
	"github.com/google/uuid"
)

var eventChangeStatus = "changeStatus"

type Usecase struct {
	repo          Repository
	notifyUsecase NotifyUsecase
	userUsecase   UserUsecase
}

func NewUsecase(repo Repository, notifyUsecase NotifyUsecase, userUsecase UserUsecase) *Usecase {
	return &Usecase{
		repo:          repo,
		notifyUsecase: notifyUsecase,
		userUsecase:   userUsecase,
	}
}

func getFileExtension(filename string) string {
	parts := strings.Split(filename, ".")
	if len(parts) > 1 {
		return parts[len(parts)-1]
	}
	return ""
}

func (uc *Usecase) GetFileTypeByContentType(contentType string) fileDomain.FileType {
	fileType, exists := fileTypeMap[contentType]
	if !exists {
		log.Println("file type not found")
		return ""
	}
	return fileType
}

func (uc *Usecase) Upload(ctx context.Context, fileReader io.Reader, file fileDomain.File) (fileDomain.File, error) {
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	pathComponents := strings.Split(file.Path, "/")

	var userID string
	if len(pathComponents)-1 > 1 {
		log.Printf("[%s] - [%s]", pathComponents[0], pathComponents[1])
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return fileDomain.File{}, err
		}

		shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return fileDomain.File{}, err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				userID = user.ID
			}
		} else {
			userID = ""
			// if !shredDir.Accepted || shredDir.ShareAccess != fileDomain.Writer {
			if shredDir.ShareAccess != fileDomain.Writer {
				log.Println("reader access, but try upload")
				return fileDomain.File{}, fmt.Errorf("reader access, but try upload")
			}
		}
	} else {
		userID = user.ID
	}

	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath, userID)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return fileDomain.File{}, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path, userID)
	if err == nil {
		log.Println("Upload: the file path already exists")
		return fileDomain.File{}, fileDomain.ErrFileAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		return fileDomain.File{}, err
	}

	file.Link = "/minio/" + user.Bucket + file.Path
	file.Bucket = user.Bucket
	file.Extension = getFileExtension(file.Filename)
	file.UserID = user.ID
	file.Status = fileDomain.Uploaded
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = false
	file.IsShared = false
	file.Email = user.Email

	file, err = uc.repo.UploadToStorage(ctx, fileReader, file)
	if err != nil {
		log.Println("UploadToStorage repo error:", err)
		return file, err
	}

	err = uc.repo.CreateFile(ctx, file)
	if err != nil {
		log.Println("CreateFile repo error:", err)
		return file, err
	}

	err = uc.repo.PublishMessage(ctx, file)
	if err != nil {
		log.Println("PublishMessage repo error:", err)
		return file, err
	}
	return file, nil
}

func (uc *Usecase) GetFiles(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if options.Dir != "" && !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fileDomain.ErrDirectoryNotStartsWithSlash
	}
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return []fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	if options.Dir == "" {
		options.Dir = "/"
	}

	var files []fileDomain.File

	// если запрос на внешние, то обязательно нужно указать диск
	if options.ExternalDisklRequired && options.CloudEmail != "" {
		filesExternal, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("external requered, but cloud email is empty")
			return []fileDomain.File{}, err
		}
		if options.FirstNesting {
			files = append(files, filterFilesByNesting(filesExternal, options.Dir)...)
		} else {
			files = append(files, filesExternal...)
		}
	}

	if options.InternalDisklRequired {
		options.CloudEmail = ""
		options.ExternalDisklRequired = false
	} else {
		return files, nil
	}

	// если путь корневой, то нужны (shared папки и все файлы и папки) данного пользователя
	if options.Dir == "/" {
		options.UserID = user.ID
		// ищем файлы пользователя
		if options.PersonalRequired {
			filesTmp, err := uc.repo.GetFiles(ctx, options)
			if err != nil && !errors.Is(err, file.ErrNotFound) {
				log.Println("GetFiles error:", err)
				return []fileDomain.File{}, err
			}
			files = append(files, filesTmp...)
		}

		// ищем директории, которыми с данным пользователем пошарены
		if options.SharedRequired {
			sharedDirs, err := uc.repo.GetSharedDirs(ctx, "", options.UserID, true)
			if err != nil && !errors.Is(err, file.ErrNotFound) {
				log.Println("GetSharedDirs error:", err)
				return []fileDomain.File{}, err
			}
			if !errors.Is(err, file.ErrNotFound) {
				for _, sharedDir := range sharedDirs {
					// достаем сами эти пошаренные директории
					// TODO: в GetSharedDirs у файлов нет автора, поэтому нужно отдельно по ID запрашивать
					sharedDirFull, err := uc.repo.GetFileByID(ctx, sharedDir.ID)
					if err != nil && !errors.Is(err, file.ErrNotFound) {
						log.Println("GetFiles error:", err)
						return []fileDomain.File{}, err
					}
					if options.DirsRequired && options.Status == "" && (options.FileType == "" || options.FileType == "all") {
						files = append(files, sharedDirFull)
					}
					options.UserID = ""
					tmpOptionsDir := options.Dir
					options.Dir = sharedDir.Path
					// достаем файлы из пошаренных директорий
					filesTmp, err := uc.repo.GetFiles(ctx, options)
					options.Dir = tmpOptionsDir

					if err != nil && !errors.Is(err, file.ErrNotFound) {
						log.Println("GetFiles error:", err)
						return []fileDomain.File{}, err
					}

					files = append(files, filesTmp...)
				}
			}
		}
		if options.FirstNesting {
			return filterFilesByNesting(files, options.Dir), nil
		}
		return files, nil
	}

	// если запрошен не корень, то нужно проверить, корневой каталог является расшаренным данному пользователю
	rootDir := strings.Split(options.Dir, "/")[1]
	_, err := uc.repo.GetSharedDirs(ctx, "/"+rootDir, user.ID, true)
	if err != nil && !errors.Is(err, file.ErrNotFound) {
		log.Println("GetSharedDir error:", err)
		return []fileDomain.File{}, err
	}
	if options.PersonalRequired && errors.Is(err, file.ErrNotFound) {
		options.UserID = user.ID
		files, err = uc.repo.GetFiles(ctx, options)
	}
	if options.SharedRequired && err == nil {
		options.UserID = ""
		files, err = uc.repo.GetFiles(ctx, options)
	}
	if err != nil {
		log.Println("GetFiles error:", err)
		return []fileDomain.File{}, err
	}
	if options.FirstNesting {
		return filterFilesByNesting(files, options.Dir), nil
	}
	return files, nil
}

func (uc *Usecase) CreateDir(ctx context.Context, file fileDomain.File) (fileDomain.File, error) {
	if file.Path == "" {
		log.Printf("CreateDir: dir path is empty")
		return file, fileDomain.ErrDirectoryNotSpecified
	}
	if !strings.HasPrefix(file.Path, "/") {
		log.Printf("Directory path [%s] does not start with /\n", file.Path)
		return file, fileDomain.ErrDirectoryNotStartsWithSlash
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return fileDomain.File{}, sharederrors.ErrUserNotFoundInContext
	}

	pathComponents := strings.Split(file.Path, "/")

	var userID string
	if len(pathComponents) > 1 {
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return fileDomain.File{}, err
		}

		shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return fileDomain.File{}, err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				userID = user.ID
			}
		} else {
			userID = ""
			// if !shredDir.Accepted || shredDir.ShareAccess != fileDomain.Writer {
			if shredDir.ShareAccess != fileDomain.Writer {
				log.Println("reader access, but try upload")
				return fileDomain.File{}, fmt.Errorf("reader access, but try upload")
			}
		}
	} else {
		userID = user.ID
	}

	// TODO: при условии, что в начале /
	for i := 1; i < len(pathComponents)-1; i++ {
		dirPath := strings.Join(pathComponents[:i+1], "/")
		_, err := uc.repo.GetFileByPath(ctx, dirPath, userID)
		if err != nil {
			log.Printf("Error checking directory %s existence: %v\n", dirPath, err)
			if errors.Is(err, fileDomain.ErrNotFound) {
				return file, fileDomain.ErrSubdirectoryNotFound
			}
			return file, err
		}
	}

	_, err := uc.repo.GetFileByPath(ctx, file.Path, userID)
	if err == nil {
		log.Println("GetFileByPath: the file path already exists")
		return file, fileDomain.ErrDirectoryAlreadyExists
	} else if err != fileDomain.ErrNotFound {
		log.Println("GetFileByPath: err", err)
		return file, err
	}

	file.Filename = pathComponents[len(pathComponents)-1]
	file.Bucket = user.Email
	file.UserID = user.ID
	file.TimeCreated = time.Now()
	file.ID = uuid.New().String()
	file.IsDir = true
	file.IsShared = false
	err = uc.repo.CreateDir(ctx, file)
	if err != nil {
		log.Println("CreateDir repo error:", err)
		return file, err
	}
	return file, nil
}

func (uc *Usecase) Search(ctx context.Context, options fileDomain.FileOptions) ([]fileDomain.File, error) {
	if !strings.HasPrefix(options.Dir, "/") {
		log.Printf("Directory path [%s] does not start with /\n", options.Dir)
		return []fileDomain.File{}, fmt.Errorf("directory path [%s] does not start with /", options.Dir)
	}

	if options.IsSmartSearch {
		return uc.repo.SmartSearch(ctx, options)
	}

	var files []fileDomain.File

	if options.ExternalDisklRequired && options.CloudEmail != "" {
		filesExternal, err := uc.repo.GetFiles(ctx, options)
		if err != nil {
			log.Println("external requered, but cloud email is empty")
			return []fileDomain.File{}, err
		}
		files = append(files, filesExternal...)
	}

	if options.InternalDisklRequired {
		options.CloudEmail = ""
		options.ExternalDisklRequired = false
		filesTmp, err := uc.GetFiles(ctx, options)
		if err != nil && !errors.Is(err, file.ErrNotFound) {
			return []fileDomain.File{}, nil
		}

		files = append(files, filesTmp...)
	}

	var filteredFiles []fileDomain.File

	for _, file := range files {
		if strings.Contains(file.Filename, options.Query) {
			filteredFiles = append(filteredFiles, file)
		}
	}

	return filteredFiles, nil
}

func (uc *Usecase) DeleteFiles(ctx context.Context, filePaths []string) error {
	for _, path := range filePaths {
		if !strings.HasPrefix(path, "/") {
			log.Printf("DeleteFiles: Directory path [%s] does not start with /\n", path)
			return fileDomain.ErrDirectoryNotStartsWithSlash
		}
	}

	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}

	filePath := filePaths[0]

	pathComponents := strings.Split(filePath, "/")

	// нельзя удалить sharing папку
	if len(pathComponents) == 2 {
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return err
		}
		if fileTmpShare.UserID != user.ID {
			fmt.Println("not access to delete sharing dir")
			return fmt.Errorf("not access to delete sharing dir")
		}
	}

	var userID string
	if len(pathComponents) > 2 {
		fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
		if err != nil {
			log.Println("GetFileByPath err:", err)
			return err
		}

		shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
		if err != nil {
			if !errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("GetSharedDir err:", err)
				return err
			}
			if errors.Is(err, fileDomain.ErrNotFound) {
				fmt.Println("delete not sharing dir or file")
				userID = user.ID
			}
		} else {
			userID = fileTmpShare.UserID
			if shredDir.ShareAccess != fileDomain.Writer {
				log.Println("reader access, but try delete")
				return fmt.Errorf("reader access, but try delete")
			}
		}
	} else {
		userID = user.ID
	}

	// if len(pathComponents) > 2 {
	// 	fileTmpShare, err := uc.repo.GetFileByPath(ctx, "/"+pathComponents[1], "")
	// 	if err != nil {
	// 		log.Println("GetFileByPath err:", err)
	// 		return err
	// 	}

	// 	shredDir, err := uc.repo.GetSharedDir(ctx, fileTmpShare.ID, user.ID)
	// 	if err != nil {
	// 		if !errors.Is(err, fileDomain.ErrNotFound) {
	// 			log.Println("GetSharedDir err:", err)
	// 			return err
	// 		}
	// 		if errors.Is(err, fileDomain.ErrNotFound) {
	// 			userID = user.ID
	// 		}
	// 	} else {
	// 		userID = ""
	// 		// if !shredDir.Accepted || shredDir.ShareAccess != fileDomain.Writer {
	// 		if shredDir.ShareAccess != fileDomain.Writer {
	// 			log.Println("reader access, but try upload")
	// 			return fmt.Errorf("reader access, but try upload")
	// 		}
	// 	}
	// } else {
	// 	userID = user.ID
	// }

	var files []file.File
	for _, path := range filePaths {
		file, err := uc.repo.GetFileByPath(ctx, path, userID)
		if err != nil {
			log.Println("GetFileByPath repo, path:", path, ", error:", err)
			return err
		}
		files = append(files, file)
	}

	stack := make([]file.File, 0)
	stack = append(stack, files...)

	for len(stack) > 0 {
		currentFile := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if currentFile.IsDir {
			dir, err := uc.repo.GetFileByPath(ctx, currentFile.Path, currentFile.UserID)
			if err != nil {
				return err
			}
			err = uc.repo.DeleteFile(ctx, dir)
			if err != nil {
				log.Println("Error deleting file:", currentFile.Path, ", error:", err)
				return err
			}

			options := fileDomain.FileOptions{
				Dir:           currentFile.Path,
				UserID:        user.ID,
				FirstNesting:  false,
				DirsRequired:  true,
				FilesRequired: true,
			}

			retrievedFiles, err := uc.repo.GetFiles(ctx, options)
			if err != nil {
				if errors.Is(err, file.ErrNotFound) {
					continue
				}
				log.Println("Error retrieving files in directory:", currentFile.Path, ", error:", err)
				return err
			}
			stack = append(stack, retrievedFiles...)
		} else {
			err := uc.repo.RemoveFromStorage(ctx, currentFile)
			if err != nil {
				log.Println("Error removing from storage:", currentFile.Path, ", error:", err)
				return err
			}
			err = uc.repo.DeleteFile(ctx, currentFile)
			if err != nil {
				log.Println("Error deleting file:", currentFile.Path, ", error:", err)
				return err
			}
		}
	}
	return nil
}

func (uc *Usecase) CompleteProcessingFile(ctx context.Context, uuidFile string) error {
	file, err := uc.repo.GetFileByID(ctx, uuidFile)
	if err != nil {
		log.Println("GetFileByID repo error:", err)
		return err
	}

	file.Status = fileDomain.Processed

	err = uc.repo.Update(ctx, file)
	if err != nil {
		log.Println("Update repo error:", err)
		return err
	}

	if string(file.Disk) != "" {
		err = uc.repo.RemoveFromStorage(ctx, file)
		if err != nil {
			log.Println("RemoveFromStorage err in CompleteProcessingFile:", err)
			return err
		}
	}

	uc.notifyUsecase.Notify(notifier.Notify{
		Event:  eventChangeStatus,
		File:   file,
		UserID: file.UserID,
	})
	return nil
}

func (uc *Usecase) DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error) {
	return uc.repo.DownloadFile(ctx, filePath)
}

func (uc *Usecase) GetSharingLink(ctx context.Context, reqShare file.RequestToShare) (string, error) {
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return "", sharederrors.ErrUserNotFoundInContext
	}

	file, err := uc.repo.GetFileByPath(ctx, reqShare.Path, user.ID)
	if err != nil {
		return "", err
	}
	file.IsShareByEmail = false

	if reqShare.ByEmails {
		file.IsShareByEmail = true
		for _, email := range reqShare.Emails {
			user, err := uc.userUsecase.GetUserByEmail(ctx, email)
			if err != nil {
				// TODO: если не найден email, нужно сообщать фронту о том, что пользователь не найден
				if !errors.Is(err, cleveruser.ErrUserNotFound) {
					return "", err
				}
			}
			_, err = uc.repo.GetSharedDir(ctx, file.ID, user.ID)
			if err != nil {
				if !errors.Is(err, fileDomain.ErrNotFound) {
					log.Println("GetSharedDir err:", err)
					return "", err
				}
				if errors.Is(err, fileDomain.ErrNotFound) {
					sharedDir := fileDomain.SharedDir{
						ID:          uuid.New().String(),
						FileID:      file.ID,
						UserID:      user.ID,
						Accepted:    false,
						ShareAccess: reqShare.ShareAccess,
						Path:        file.Path,
					}
					err = uc.repo.InsertSharedDir(ctx, sharedDir)
					if err != nil {
						log.Println("InsertSharedDir err:", err)
						return "", err
					}
				}
			}
		}
	}
	file.IsShared = true
	file.ShareLink = "/dirs/" + file.ID + "?sharing=true"
	file.ShareAccess = reqShare.ShareAccess
	uc.repo.Update(ctx, file)
	return file.ShareLink, nil
}

func (uc *Usecase) AddSheringGrant(ctx context.Context, fileID string) error {
	file, err := uc.repo.GetFileByID(ctx, fileID)
	if err != nil {
		log.Println("AddSheringGrant GetFileByID with error:", err)
		return err
	}
	if !file.IsShared {
		log.Println(fileDomain.ErrDirNotSharing.Error())
		return fileDomain.ErrDirNotSharing
	}
	user, ok := ctx.Value(shared.UserContextName).(cleveruser.User)
	if !ok {
		log.Println(sharederrors.ErrUserNotFoundInContext.Error())
		return sharederrors.ErrUserNotFoundInContext
	}

	log.Println("fileID = ", fileID)
	log.Println("userID = ", user.ID)

	if file.IsShareByEmail {
		sharedDir, err := uc.repo.GetSharedDir(ctx, fileID, user.ID)
		if err != nil {
			if errors.Is(err, fileDomain.ErrNotFound) {
				log.Println("access to the shared dir was not granted")
				return fmt.Errorf("access to the shared dir was not granted")
			}
			return err
		}
		if !sharedDir.Accepted {
			sharedDir.Accepted = true
			_, err := uc.repo.UpdateSharedDir(ctx, sharedDir)
			if err != nil {
				log.Println("UpdateSharedDir err:", err)
				return err
			}
		}
		return nil
	} else {
		_, err := uc.repo.GetSharedDir(ctx, fileID, user.ID)
		if err != nil {
			if errors.Is(err, fileDomain.ErrNotFound) {
				sharedDir := fileDomain.SharedDir{
					ID:          uuid.New().String(),
					FileID:      file.ID,
					UserID:      user.ID,
					Accepted:    true,
					ShareAccess: file.ShareAccess,
					Path:        file.Path,
				}
				err = uc.repo.InsertSharedDir(ctx, sharedDir)
				if err != nil {
					log.Println("InsertSharedDir err:", err)
					return err
				}
				return nil
			}
			log.Println("GetSharedDir err:", err)
			return err
		}
		return nil
	}
	// return uc.repo.AddUserToSharingDir(ctx, file, user.ID, file.ShareAccess)
}

func (uc *Usecase) GetFileByID(ctx context.Context, file_uuid string) (file.File, error) {
	return uc.repo.GetFileByID(ctx, file_uuid)
}
