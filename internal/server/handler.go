package server

import (
	"log"
	"time"

	"github.com/LuuDinhTheTai/tzone/internal/delivery/handler"
	"github.com/LuuDinhTheTai/tzone/internal/delivery/route"
	"github.com/LuuDinhTheTai/tzone/internal/model"
	"github.com/LuuDinhTheTai/tzone/internal/repository"
	"github.com/LuuDinhTheTai/tzone/internal/service"
	"github.com/LuuDinhTheTai/tzone/util/seed"
)

func (s *Server) MapHandlers() error {
	// Check if MongoDB is available
	if !s.HasMongoDB() {
		log.Println("⚠️ MongoDB is not available, brand and device routes will not work properly")
	}

	// AutoMigrate missing tables (Users, RefreshTokens, and the newly added RBAC tables)
	s.db.AutoMigrate(
		&model.User{},
		&model.RefreshToken{},
		&model.Favorite{},
		&model.Review{},
		&model.Role{},
		&model.UserRole{},
		&model.Action{},
		&model.Resource{},
		&model.Permission{},
		&model.RolePermission{},
	)
	_ = s.db.Exec("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL").Error
	_ = s.db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub text").Error
	_ = s.db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users (google_sub)").Error
	_ = s.db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_device_rating_once ON reviews (user_id, device_id) WHERE rating > 0").Error

	// Seed RBAC data
	seed.SeedAll(s.db)

	// Init repository
	userRepo := repository.NewUserRepository(s.db)
	tokenRepo := repository.NewRefreshTokenRepository(s.db)
	favoriteRepo := repository.NewFavoriteRepository(s.db)
	reviewRepo := repository.NewReviewRepository(s.db)
	permissionRepo := repository.NewPermissionRepository(s.db)

	brandRepo := repository.NewBrandRepository()
	deviceRepo := repository.NewBrandRepository()
	if s.HasMongoDB() {
		brandRepo.SetClient(s.mongoClient)
		deviceRepo.SetClient(s.mongoClient)
		log.Printf("✅ MongoDB client set in repositories")
	}
	log.Printf("✅ Repositories initialized")

	// Init auth service
	authService := service.NewAuthService(userRepo, tokenRepo)
	cacheService := service.NewCacheService(s.redisClient, 3*time.Minute)

	// Init service
	brandService := service.NewBrandService(brandRepo, cacheService)
	deviceService := service.NewDeviceService(deviceRepo, cacheService)
	favoriteService := service.NewFavoriteService(favoriteRepo, deviceRepo)
	reviewService := service.NewReviewService(reviewRepo)
	permissionService := service.NewPermissionService(permissionRepo)
	aiService, err := service.NewAIChatService(s.cfg.AI)
	if err != nil {
		return err
	}
	log.Printf("✅ Services initialized")

	// Init handler
	commonHandler := handler.NewCommonHandler()
	frontendHandler := handler.NewFrontendHandler()
	brandHandler := handler.NewBrandHandler(brandService)
	deviceHandler := handler.NewDeviceHandler(deviceService)
	favoriteHandler := handler.NewFavoriteHandler(favoriteService)
	reviewHandler := handler.NewReviewHandler(reviewService)
	authHandler := handler.NewAuthHandler(authService)
	aiHandler := handler.NewAIHandler(aiService)
	log.Printf("✅ Handlers initialized")

	// Init route
	route.MapCommonRoutes(s.r, commonHandler)
	route.MapFrontendRoutes(s.r, frontendHandler, permissionService)
	route.MapBrandRoutes(s.r, brandHandler, permissionService)
	route.MapDeviceRoutes(s.r, deviceHandler, permissionService)
	route.MapFavoriteRoutes(s.r, favoriteHandler)
	route.MapReviewRoutes(s.r, reviewHandler)
	route.MapAuthRoutes(s.r, authHandler)
	route.MapAIRoutes(s.r, aiHandler)
	log.Printf("✅ Routes initialized")

	return nil
}
