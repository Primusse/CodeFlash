package dto

// QuestionUpdate 题目可更新字段
type QuestionUpdate struct {
	Question    string `json:"question"`
	Subcategory string `json:"subcategory"`
	Difficulty  string `json:"difficulty"`
	Type        string `json:"type"`
	Options     string `json:"options"`
	Answer      string `json:"answer"`
	Explanation string `json:"explanation"`
	Category    string `json:"category"`
}
