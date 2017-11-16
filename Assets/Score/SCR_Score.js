private var score = 0;

function Start() {
	ResetScore();
}

function ResetScore() {
	score = 0;
	GetComponent(UI.Text).text = score.ToString();
}

function IncreaseScore(amount:int) {
	score += amount;
	
	GetComponent(UI.Text).text = score.ToString();
}

function DecreaseScore(amount:int) {
	score -= amount;
	
	GetComponent(UI.Text).text = score.ToString();
	
	if (score < 0) {
		SCR_Gameplay.Lose(2);
	}
}