var MAT_WHITE : Material;

private var destructible:boolean = true;
private var color:int = 0;

private var HP:int = 1;
private var blinkCooldown:float = 0;
private var currentMaterial:Material = null;

private static var score:SCR_Score = null;

function SetDestructible(d) {
	destructible = d;
	blinkCooldown = 0;
}
function SetHP(hp : int) {
	HP = hp;
}

function IsDestructible() {
	return destructible;
}

function Start() {
	if (score == null) {
		score = GameObject.Find("Score").GetComponent(SCR_Score);
	}
}

function Update() {
	var dt = Time.deltaTime;
	
	if (blinkCooldown > 0) {
		blinkCooldown -= dt;
		if (blinkCooldown < 0) {
			transform.GetChild(0).GetComponent(Renderer).material = currentMaterial;
			transform.GetChild(1).GetComponent(Renderer).material = currentMaterial;
			transform.GetChild(2).GetComponent(Renderer).material = currentMaterial;
			blinkCooldown = 0;
		}
	}
}

function Hit(damage:int) {
	if (destructible) {
		HP -= damage;
		
		if (blinkCooldown == 0) {
			currentMaterial = transform.GetChild(0).GetComponent(Renderer).material;
			transform.GetChild(0).GetComponent(Renderer).material = MAT_WHITE;
			transform.GetChild(1).GetComponent(Renderer).material = MAT_WHITE;
			transform.GetChild(2).GetComponent(Renderer).material = MAT_WHITE;
		}
		
		blinkCooldown = 0.1;
		
		if (HP <= 0) {
			gameObject.SetActive(false);
		}
		
		score.IncreaseScore();
	}
}