package file

import (
	"time"

	"github.com/WindowsKonon1337/CleverSearch/internal/domain/file"
)

type FileDTO struct {
	ID          string          `json:"id"`
	Filename    string          `json:"filename"`
	TimeCreated time.Time       `json:"time_created"`
	UserID      string          `json:"user_id"`
	Email       string          `json:"email"`
	Path        string          `json:"path"`
	Bucket      string          `json:"bucket"`
	IsDir       bool            `json:"is_dir"`
	FileType    file.FileType   `json:"file_type"`
	Size        int64           `json:"size"`
	ContentType string          `json:"content_type"`
	Extension   string          `json:"extension"`
	Status      file.StatusType `json:"status"`
	IsShared    bool            `json:"is_shared"`
	ShareAccess file.AccessType `json:"share_access"`
	ShareLink   string          `json:"share_link"`
	Link        string          `json:"link"`
	CloudID     string          `bson:"cloud_id"`
	CloudEmail  string          `bson:"cloud_email"`
	Disk        file.DiskType   `json:"disk"`
	PageNumber  int             `json:"page_number"`
	Timestart   string          `json:"timestart"`
	Duration    time.Duration   `json:"duration"`
}

type FileForMLDTO struct {
	FileDTO
	MLData interface{} `json:"ml_data"`
}

type DeleteFilesDTO struct {
	Files []string `json:"files"`
}

type RequestToShareDTO struct {
	Path        string          `json:"dir"`
	ShareAccess file.AccessType `json:"access_type"`
	ByEmails    bool            `json:"by_emails"`
	Emails      []string        `json:"emails"`
}

type ResponseShareLinkDTO struct {
	ShareLink string `json:"share_link"`
}
