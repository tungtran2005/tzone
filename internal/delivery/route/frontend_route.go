package route

import (
	"github.com/LuuDinhTheTai/tzone/internal/delivery/handler"
	"github.com/LuuDinhTheTai/tzone/internal/delivery/middleware"
	"github.com/LuuDinhTheTai/tzone/internal/service"
	"github.com/gin-gonic/gin"
)

func MapFrontendRoutes(r *gin.Engine, frontendHandler *handler.FrontendHandler, permissionService *service.PermissionService) {
	r.Static("/assets", "web/frontend/assets")

	r.GET("/brands", frontendHandler.BrandsPage)
	r.GET("/brands/:id", frontendHandler.BrandPage)
	r.GET("/login", frontendHandler.LoginPage)
	r.GET("/register", frontendHandler.RegisterPage)
	adminGroup := r.Group("/admin")
	adminGroup.Use(middleware.JWTAuth(), middleware.RBACAuth(permissionService))
	{
		adminGroup.GET("", frontendHandler.AdminPage)
		adminGroup.GET("/brands", frontendHandler.AdminBrandsPage)
		adminGroup.GET("/devices", frontendHandler.AdminDevicesPage)
	}
}
