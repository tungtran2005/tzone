package handler

import "github.com/gin-gonic/gin"

type FrontendHandler struct{}

func NewFrontendHandler() *FrontendHandler {
	return &FrontendHandler{}
}

func (h *FrontendHandler) BrandsPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/brands.html")
}

func (h *FrontendHandler) BrandPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/brand.html")
}

func (h *FrontendHandler) LoginPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/login.html")
}

func (h *FrontendHandler) RegisterPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/register.html")
}

func (h *FrontendHandler) AdminPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/admin.html")
}

func (h *FrontendHandler) AdminBrandsPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/admin-brands.html")
}

func (h *FrontendHandler) AdminDevicesPage(ctx *gin.Context) {
	ctx.File("web/frontend/pages/admin-devices.html")
}
