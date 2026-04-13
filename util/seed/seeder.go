package seed

import (
	"log"

	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAll(db *gorm.DB) {
	log.Println("🌱 Starting database seeding...")

	seedRoles(db)
	seedActions(db)
	seedResources(db)
	seedPermissions(db)
	seedRolePermissions(db)
	seedAdminUser(db)
	seedAdminRole(db)

	log.Println("✅ Database seeding completed!")
}

func seedRoles(db *gorm.DB) {
	roles := []model.Role{
		{ID: 1, Name: model.RoleAdmin},
		{ID: 2, Name: model.RoleUser},
	}

	for _, role := range roles {
		var count int64
		db.Model(&model.Role{}).Where("name = ?", role.Name).Count(&count)
		if count == 0 {
			if err := db.Create(&role).Error; err != nil {
				log.Printf("⚠️ Failed to seed role '%s': %v", role.Name, err)
			} else {
				log.Printf("  ✅ Seeded role: %s (id=%d)", role.Name, role.ID)
			}
		} else {
			log.Printf("  ⏭️  Role '%s' already exists, skipping", role.Name)
		}
	}
}

func seedActions(db *gorm.DB) {
	actionNames := []string{"GET", "POST", "PUT", "DELETE"}

	for _, name := range actionNames {
		var count int64
		db.Model(&model.Action{}).Where("name = ?", name).Count(&count)
		if count == 0 {
			action := model.Action{Name: name}
			if err := db.Create(&action).Error; err != nil {
				log.Printf("⚠️ Failed to seed action '%s': %v", name, err)
			} else {
				log.Printf("  ✅ Seeded action: %s (id=%s)", name, action.ID)
			}
		} else {
			log.Printf("  ⏭️  Action '%s' already exists, skipping", name)
		}
	}
}

func seedResources(db *gorm.DB) {
	endpoints := []string{
		"/api/v1/brands",
		"/api/v1/brands/:id",
		"/api/v1/devices",
		"/api/v1/devices/:id",
		"/admin",
		"/admin/brands",
		"/admin/devices",
	}

	for _, ep := range endpoints {
		var count int64
		db.Model(&model.Resource{}).Where("endpoint = ?", ep).Count(&count)
		if count == 0 {
			res := model.Resource{Endpoint: ep}
			if err := db.Create(&res).Error; err != nil {
				log.Printf("⚠️ Failed to seed resource '%s': %v", ep, err)
			} else {
				log.Printf("  ✅ Seeded resource: %s (id=%s)", ep, res.ID)
			}
		} else {
			log.Printf("  ⏭️  Resource '%s' already exists, skipping", ep)
		}
	}
}

func findActionID(db *gorm.DB, name string) (uuid.UUID, bool) {
	var action model.Action
	if err := db.Where("name = ?", name).First(&action).Error; err != nil {
		log.Printf("⚠️ Action '%s' not found: %v", name, err)
		return uuid.Nil, false
	}
	return action.ID, true
}

func findResourceID(db *gorm.DB, endpoint string) (uuid.UUID, bool) {
	var res model.Resource
	if err := db.Where("endpoint = ?", endpoint).First(&res).Error; err != nil {
		log.Printf("⚠️ Resource '%s' not found: %v", endpoint, err)
		return uuid.Nil, false
	}
	return res.ID, true
}

type permissionSeed struct {
	ActionName   string
	ResourcePath string
	Description  string
}

func seedPermissions(db *gorm.DB) {
	permissions := []permissionSeed{
		// Brand API permissions
		{ActionName: "POST", ResourcePath: "/api/v1/brands", Description: "Create brand"},
		{ActionName: "PUT", ResourcePath: "/api/v1/brands/:id", Description: "Update brand"},
		{ActionName: "DELETE", ResourcePath: "/api/v1/brands/:id", Description: "Delete brand"},

		// Device API permissions
		{ActionName: "POST", ResourcePath: "/api/v1/devices", Description: "Create device"},
		{ActionName: "PUT", ResourcePath: "/api/v1/devices/:id", Description: "Update device"},
		{ActionName: "DELETE", ResourcePath: "/api/v1/devices/:id", Description: "Delete device"},

		// Admin frontend permissions
		{ActionName: "GET", ResourcePath: "/admin", Description: "Access admin dashboard"},
		{ActionName: "GET", ResourcePath: "/admin/brands", Description: "Access admin brands page"},
		{ActionName: "GET", ResourcePath: "/admin/devices", Description: "Access admin devices page"},
	}

	for _, p := range permissions {
		actionID, okA := findActionID(db, p.ActionName)
		resourceID, okR := findResourceID(db, p.ResourcePath)
		if !okA || !okR {
			log.Printf("⚠️ Skipping permission '%s': missing action or resource", p.Description)
			continue
		}

		// Check if this exact (action_id, resource_id) permission already exists
		var count int64
		db.Model(&model.Permission{}).
			Where("action_id = ? AND resource_id = ?", actionID, resourceID).
			Count(&count)

		if count == 0 {
			perm := model.Permission{
				ActionID:    actionID,
				ResourceID:  resourceID,
				Description: p.Description,
			}
			if err := db.Create(&perm).Error; err != nil {
				log.Printf("⚠️ Failed to seed permission '%s': %v", p.Description, err)
			} else {
				log.Printf("  ✅ Seeded permission: %s (id=%s)", p.Description, perm.ID)
			}
		} else {
			log.Printf("  ⏭️  Permission '%s' already exists, skipping", p.Description)
		}
	}
}

func seedRolePermissions(db *gorm.DB) {
	adminRoleID := int32(1)

	// Fetch all permissions from the DB
	var allPermissions []model.Permission
	if err := db.Find(&allPermissions).Error; err != nil {
		log.Printf("⚠️ Failed to fetch permissions: %v", err)
		return
	}

	for _, perm := range allPermissions {
		var count int64
		db.Model(&model.RolePermission{}).
			Where("role_id = ? AND permission_id = ?", adminRoleID, perm.ID).
			Count(&count)

		if count == 0 {
			rp := model.RolePermission{
				RoleID:       adminRoleID,
				PermissionID: perm.ID,
			}
			if err := db.Create(&rp).Error; err != nil {
				log.Printf("⚠️ Failed to seed role_permission (role=%d, perm=%s): %v", adminRoleID, perm.ID, err)
			} else {
				log.Printf("  ✅ Seeded role_permission: admin -> %s (%s)", perm.Description, perm.ID)
			}
		} else {
			log.Printf("  ⏭️  RolePermission (admin -> %s) already exists, skipping", perm.Description)
		}
	}
}

func seedAdminUser(db *gorm.DB) {
	adminEmail := "admin@tzone.com"

	var count int64
	db.Model(&model.User{}).Where("email = ?", adminEmail).Count(&count)
	if count > 0 {
		log.Printf("  ⏭️  Admin user '%s' already exists, skipping", adminEmail)
		return
	}

	// Hash the default password
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("⚠️ Failed to hash admin password: %v", err)
		return
	}

	admin := model.User{
		ID:           uuid.New(),
		Email:        adminEmail,
		PasswordHash: string(hash),
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Printf("⚠️ Failed to seed admin user: %v", err)
	} else {
		log.Printf("  ✅ Seeded admin user: %s (id=%s)", adminEmail, admin.ID)
	}
}

func seedAdminRole(db *gorm.DB) {
	adminEmail := "admin@tzone.com"
	adminRoleID := int32(1)

	// Look up admin user
	var adminUser model.User
	if err := db.Where("email = ?", adminEmail).First(&adminUser).Error; err != nil {
		log.Printf("⚠️ Admin user not found, skipping role assignment: %v", err)
		return
	}

	// Check if role already assigned
	var count int64
	db.Model(&model.UserRole{}).
		Where("user_id = ? AND role_id = ?", adminUser.ID, adminRoleID).
		Count(&count)

	if count == 0 {
		ur := model.UserRole{
			UserID: adminUser.ID,
			RoleID: adminRoleID,
		}
		if err := db.Create(&ur).Error; err != nil {
			log.Printf("⚠️ Failed to assign admin role: %v", err)
		} else {
			log.Printf("  ✅ Assigned admin role to user: %s", adminEmail)
		}
	} else {
		log.Printf("  ⏭️  Admin role already assigned to '%s', skipping", adminEmail)
	}
}
