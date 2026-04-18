package handler

import (
	"net/http"

	"github.com/LuuDinhTheTai/tzone/internal/dto"
	"github.com/LuuDinhTheTai/tzone/internal/service"
	"github.com/LuuDinhTheTai/tzone/util/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService}
}

// register endpoint
func (h *AuthHandler) Register(c *gin.Context) {

	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	err := h.authService.Register(req.Email, req.Password)

	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "register success", nil)
}

// login endpoint
func (h *AuthHandler) Login(c *gin.Context) {

	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	accessToken, refreshToken, user, roleName, err := h.authService.Login(req.Email, req.Password)

	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	c.SetCookie("refresh_token", refreshToken, 7*24*60*60, "/", "", false, true)

	response.Success(c, http.StatusOK, "login success", gin.H{
		"access_token": accessToken,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  roleName,
		},
	})
}

// RefreshToken endpoint
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Read refresh token from HttpOnly cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		response.Error(c, http.StatusUnauthorized, "refresh token cookie is missing", nil)
		return
	}

	newAccessToken, newRefreshToken, _, err := h.authService.RefreshToken(refreshToken)
	if err != nil {
		// Clear invalid cookie
		c.SetCookie("refresh_token", "", -1, "/", "", false, true)
		response.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	// Rotate: set new refresh token in HttpOnly cookie
	c.SetCookie("refresh_token", newRefreshToken, 7*24*60*60, "/", "", false, true)

	// Return only new access token in body
	response.Success(c, http.StatusOK, "token refreshed successfully", gin.H{
		"access_token": newAccessToken,
	})
}

// Logout endpoint
func (h *AuthHandler) Logout(c *gin.Context) {
	// Read refresh token from HttpOnly cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		// No cookie — already logged out or never logged in
		response.Success(c, http.StatusOK, "logged out successfully", nil)
		return
	}

	// Revoke refresh token in DB (ignore error — best effort)
	_ = h.authService.Logout(refreshToken)

	// Clear refresh token cookie
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	response.Success(c, http.StatusOK, "logged out successfully", nil)
}
