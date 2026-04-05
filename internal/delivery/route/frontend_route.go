package route

import (
	"github.com/LuuDinhTheTai/tzone/internal/delivery/handler"
	"github.com/gin-gonic/gin"
)

func MapFrontendRoutes(r *gin.Engine, frontendHandler *handler.FrontendHandler) {
	r.Static("/assets", "web/frontend/assets")

	r.GET("/brands", frontendHandler.BrandsPage)
	r.GET("/brands/:id", frontendHandler.BrandPage)
	r.GET("/login", frontendHandler.LoginPage)
	r.GET("/register", frontendHandler.RegisterPage)
	r.GET("/admin", frontendHandler.AdminPage)
	r.GET("/admin/brands", frontendHandler.AdminBrandsPage)
	r.GET("/admin/devices", frontendHandler.AdminDevicesPage)
}
