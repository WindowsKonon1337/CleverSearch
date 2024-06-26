package file

import (
	"context"
	"io"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type Usecase interface {
	Upload(ctx context.Context, fileReader io.Reader, file file.File) (file.File, error)
	GetFiles(ctx context.Context, options file.FileOptions) ([]file.File, error)
	GetFileByID(ctx context.Context, file_uuid string) (file.File, error)
	Search(ctx context.Context, options file.FileOptions) ([]file.File, error)
	CompleteProcessingFile(ctx context.Context, uuid string) error
	CreateDir(ctx context.Context, file file.File) (file.File, error)
	DeleteFiles(ctx context.Context, filePaths []string) error
	DownloadFile(ctx context.Context, filePath string) (io.ReadCloser, error)
	GetSharingLink(ctx context.Context, reqShare file.RequestToShare) (string, error)
	GetFileTypeByContentType(contentType string) file.FileType

	GetFavs(ctx context.Context) ([]file.File, error)
	AddFav(ctx context.Context, fileID string) error
	DeleteFav(ctx context.Context, fileID string) error

	// v2
	ProccessedUploaded(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	Shared(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	Drive(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	Internal(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	SearchV2(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
	Dirs(ctx context.Context, options file.FileOptionsV2) ([]file.File, error)
}
