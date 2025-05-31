package vo

type LoginVo struct {
	Id       string `json:"id"`
	Username string `json:"username" binding:"required"`
	Tk       string `json:"tk"`
	Theme    int    `json:"theme"`
}
