package middleware

import (
	"clear/internal/dto"
	"clear/internal/models"
	"clear/pkg"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		auth := ctx.GetHeader("Authorization")

		if auth == "" {
			// 如果请求到的Header为空,意味着没有携带token
			// 如果有需要,可以根据不同的url prefix来进行路径判断放行

			ctx.JSON(http.StatusOK, dto.Fail[any](models.MissingTokenMessage))
			ctx.Abort()
			return
		}

		// 分割tk value
		parts := strings.SplitN(auth, " ", 2)

		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.JSON(http.StatusOK, dto.Fail[any](models.InvalidTokenMessage))
			ctx.Abort()
			return
		}

		res, err := pkg.ParseToken(parts[1])

		if err != nil {
			ctx.JSON(http.StatusOK, dto.Fail[any](models.InvalidTokenMessage))
			ctx.Abort()
			return
		}

		ctx.Set("userId", res.Userid)
		ctx.Next()
	}
}
