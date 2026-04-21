package route

import (
	"github.com/LuuDinhTheTai/tzone/internal/delivery/handler"
	"github.com/LuuDinhTheTai/tzone/internal/delivery/middleware"
	"github.com/gin-gonic/gin"
)

func MapAIRoutes(r *gin.Engine, aiHandler *handler.AIHandler) {
	aiGroup := r.Group("/api/v1/ai")
	aiGroup.Use(middleware.APIRateLimit())
	{
		aiGroup.POST("/chat", aiHandler.RecommendDevices)
	}
}
