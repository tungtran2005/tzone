package main

import (
	"log"
	"log/slog"
	"os"

	"github.com/LuuDinhTheTai/tzone/infrastructure/configuration"
	"github.com/LuuDinhTheTai/tzone/infrastructure/database"
	server2 "github.com/LuuDinhTheTai/tzone/internal/server"
	"github.com/gin-gonic/gin"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	log.Println("🚀 Starting TZone Application...")
	log.Printf("📅 Date: %s", "2026-01-26")

	// Load configuration
	cfg := configuration.LoadEnv()

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		log.Printf("❌ Configuration validation failed: %v", err)
		slog.Error("Configuration validation error", "error", err)
		log.Println("🛑 Application startup aborted")
		os.Exit(1)
	}

	log.Println("✅ Configuration validated successfully")

	// Connect to PostgreSQL
	var db *gorm.DB

	if cfg.Database.Supabase.URL != "" {

		dbTemp, err := gorm.Open(
			postgres.Open(cfg.Database.Supabase.URL),
			&gorm.Config{},
		)

		if err != nil {
			log.Fatalf("❌ PostgreSQL connection failed: %v", err)
		}

		db = dbTemp
		log.Println("✅ PostgreSQL connected")
	} else {
		log.Println("⚠️ PostgreSQL not configured")
	}
	// Connect to MongoDB
	var mongoClient interface{}

	if cfg.Database.MongoDbAtlas.URL != "" {
		client, ctx, cancel, errDB := database.Connect(cfg.Database.MongoDbAtlas.URL)
		if errDB != nil {
			log.Printf("❌ MongoDB connection failed: %v", errDB)
			slog.Error("MongoDB connect error", "error", errDB)
			log.Println("⚠️ Continuing without MongoDB...")
		} else {
			errPing := database.Ping(client, ctx)
			if errPing != nil {
				log.Printf("❌ MongoDB ping failed: %v", errPing)
				slog.Error("MongoDB ping error", "error", errPing)
				cancel()
				log.Println("⚠️ Continuing without MongoDB...")
			} else {
				mongoClient = client
				defer database.Close(client, ctx, cancel)
				log.Println("✅ MongoDB connected and ready")
			}
		}
	} else {
		log.Println("⚠️ MongoDB not configured, skipping...")
	}

	// Connect to Supabase
	var supaClient interface{}

	if cfg.Database.Supabase.URL != "" && cfg.Database.Supabase.Key != "" {
		supaClientTemp, errSupa := database.ConnectSupabase(cfg.Database.Supabase.URL, cfg.Database.Supabase.Key)
		if errSupa != nil {
			log.Printf("⚠️ Supabase connection failed: %v", errSupa)
			slog.Warn("Supabase connect warning", "error", errSupa)
			log.Println("⚠️ Continuing without Supabase...")
		} else {
			supaClient = supaClientTemp
			log.Println("✅ Supabase connected and ready")
		}
	} else {
		log.Println("⚠️ Supabase not configured, skipping...")
	}

	// Initialize Gin router
	log.Println("🔧 Initializing HTTP server...")
	r := gin.Default()

	// Create server with available database connections
	server := server2.NewServer(r, cfg, db, mongoClient, supaClient)

	// Start server
	log.Printf("🌐 Starting HTTP server on port %s...", cfg.Server.Port)
	err := server.Run()
	if err != nil {
		log.Printf("❌ Server failed to start: %v", err)
		slog.Error("Server start error", "error", err)
		log.Println("🛑 Application terminated")
		os.Exit(1)
	}

	log.Println("👋 Application shutdown gracefully")
}
