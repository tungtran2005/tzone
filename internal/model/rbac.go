package model

import (
	"github.com/google/uuid"
)

const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

type Role struct {
	ID   int32  `gorm:"primaryKey;column:id;autoIncrement"`
	Name string `gorm:"uniqueIndex;not null;column:name"`
}

type UserRole struct {
	UserID uuid.UUID `gorm:"primaryKey;type:uuid;column:user_id"`
	RoleID int32     `gorm:"primaryKey;column:role_id"`
}

type Action struct {
	ID   uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`
	Name string    `gorm:"uniqueIndex;not null;column:name"`
}

type Resource struct {
	ID       uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`
	Endpoint string    `gorm:"uniqueIndex;not null;column:endpoint"`
}

type Permission struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`
	ActionID    uuid.UUID `gorm:"type:uuid;not null;column:action_id"`
	ResourceID  uuid.UUID `gorm:"type:uuid;not null;column:resource_id"`
	Description string    `gorm:"column:description"`
}

type RolePermission struct {
	RoleID       int32     `gorm:"primaryKey;column:role_id"`
	PermissionID uuid.UUID `gorm:"primaryKey;type:uuid;column:permission_id"`
}
