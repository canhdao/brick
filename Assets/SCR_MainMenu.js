function Start() {
}

function OnPlayClassic() {
	SCR_Global.gameMode = GameMode.CLASSIC;
	SceneManagement.SceneManager.LoadScene("Gameplay");
}

function OnPlayPuzzle() {
	SCR_Global.gameMode = GameMode.PUZZLE;
	SceneManagement.SceneManager.LoadScene("Gameplay");
}
