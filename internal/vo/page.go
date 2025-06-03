package vo

type PgaeResult[T any] struct {
	Total   int64 `json:"total"`
	Size    int   `json:"size"`
	Current int   `json:"current"`
	Records []T   `json:"records"`
}
