private var score = 0;

function Start() {
	ResetScore();
}

function ResetScore() {
	score = 0;
	GetComponent(TextMesh).text = score.ToString();
}

function IncreaseScore() {
	score++;
	GetComponent(TextMesh).text = score.ToString();
}
