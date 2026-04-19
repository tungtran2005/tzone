package route

import (
	"github.com/LuuDinhTheTai/tzone/internal/delivery/handler"
	"github.com/LuuDinhTheTai/tzone/internal/delivery/middleware"
	"github.com/gin-gonic/gin"
)

func MapAuthRoutes(r *gin.Engine, h *handler.AuthHandler) {

	auth := r.Group("/auth")
	auth.Use(middleware.AuthRateLimit())

	auth.POST("/register/send-otp", h.SendRegisterOTP)
	auth.POST("/register", h.Register)
	auth.POST("/password/send-otp", h.SendResetPasswordOTP)
	auth.POST("/password/reset", h.ResetPassword)
	auth.POST("/login", h.Login)
	auth.POST("/refresh", h.RefreshToken)
	auth.POST("/logout", h.Logout)

	authProtected := auth.Group("")
	authProtected.Use(middleware.JWTAuth())
	authProtected.POST("/password/change", h.ChangePassword)
}
