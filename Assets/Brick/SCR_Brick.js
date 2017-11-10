var WHITE_MATERIAL : Material;

private var destructible:boolean = true;
private var color:int = 0;

private var HP:int = 1;
private var blinkCooldown:float = 0;
private var currentMaterial:Material = null;

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
	
}

function Update() {
	var dt = Time.deltaTime;
	
	if (blinkCooldown > 0) {
		blinkCooldown -= dt;
		if (blinkCooldown < 0) {
			transform.GetChild(0).GetComponent(Renderer).material = currentMaterial;
			blinkCooldown = 0;
		}
	}
}

function Hit(damage:int) {
	if (destructible) {
		HP -= damage;
		
		if (blinkCooldown == 0) {
			currentMaterial = transform.GetChild(0).GetComponent(Renderer).material;
			transform.GetChild(0).GetComponent(Renderer).material = WHITE_MATERIAL;
		}
		
		blinkCooldown = 0.1;
		
		if (HP <= 0) {
			gameObject.SetActive(false);
		}
	}
}