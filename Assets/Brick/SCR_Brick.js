public var MAT_WHITE : Material;
public var PREFAB_SHATTER : GameObject;

private var destructible:boolean = true;
private var color:int = 0;
private var width:int = 0;
private var height:int = 0;

private var HP:int = 1;
private var blinkCooldown:float = 0;
private var currentMaterial:Material = null;

private static var score:SCR_Score = null;

private static var shatterParticle = new Array();

static function ResetParticle() {
	shatterParticle = new Array();
}


function SetColor (c) {
	color = c;
}

function SetSize (w, h) {
	width = w;
	height = h;
}

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
			transform.GetChild(0).GetComponent(Renderer).sharedMaterial = currentMaterial;
			transform.GetChild(1).GetComponent(Renderer).sharedMaterial = currentMaterial;
			transform.GetChild(2).GetComponent(Renderer).sharedMaterial = currentMaterial;
			blinkCooldown = 0;
		}
	}
}

function Hit(damage:int, ballColor:int) {
	if (destructible) {
		HP -= damage;
		
		if (blinkCooldown == 0) {
			currentMaterial = transform.GetChild(0).GetComponent(Renderer).sharedMaterial;
			transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
			transform.GetChild(1).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
			transform.GetChild(2).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
		}
		
		blinkCooldown = 0.1;
		
		if (HP <= 0) {
			gameObject.SetActive(false);
			
			SpawnExplosion();
		}
		
		if (SCR_Global.gameMode == GameMode.CLASSIC) {
			score.IncreaseScore(1);
			if (color == ballColor) {
				score.IncreaseScore(2);
			}
		}
		else if (SCR_Global.gameMode == GameMode.PUZZLE) {
			if (color == ballColor) {
				//score.IncreaseScore(1);
			}
		}
	}
}

function SpawnExplosion() {
	var particle : GameObject = null;
	for (var i=0; i<shatterParticle.length; i++) {
		if ((shatterParticle[i] as GameObject).activeSelf == false) {
			particle = shatterParticle[i];
			break;
		}
	}
	
	if (particle == null) {
		particle = Instantiate(PREFAB_SHATTER);
		shatterParticle.Push (particle);
	}
	
	particle.transform.position.x = transform.position.x;
	particle.transform.position.y = transform.position.y;
	particle.transform.position.z = -5;
	
	var color = currentMaterial.color;
	particle.GetComponent(ParticleSystemRenderer).material.SetColor("_TintColor", color);
	particle.GetComponent(ParticleSystem).shape.scale = Vector3(width * 0.4, height * 0.4, 1);
	particle.SetActive(true);
}