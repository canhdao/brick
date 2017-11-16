public var MAT_BRICK : Material[];
public var MAT_WHITE : Material;
public var PREFAB_SPARKLE_CONTROLLER : GameObject;
public var PREFAB_SPARKLE_BRICK : GameObject;

private static var controller : GameObject = null;

private var MAX_VELOCITY : float = 4000;
static var RIGHT_EDGE = 1000;
static var TOP_EDGE = 1000;

private var background : Array = null;
private var stuck = false;
private var touchCooldown: float = 0;
private var color:int = 0;

function Start() {
	if (controller == null) {
		controller = GameObject.Find("Controller");
	}
}

function Reset() {
	stuck = false;
	
	color = Random.Range(1, MAT_BRICK.length);
	gameObject.GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
}

function SetBackground(bg:Array) {
	background = bg;
}

function IsStuck() {
	return stuck;
}

function Update() {
	var dt = Time.deltaTime;
	if (touchCooldown > 0) {
		touchCooldown -= dt;
	}
	if (transform.position.x < 0 || transform.position.x > RIGHT_EDGE
	||  transform.position.y < 0 || transform.position.y > TOP_EDGE) {
		SCR_Gameplay.Lose(0);
	}
	
	var MIN_VELOCITY_SQUARED = 1000;
	
	if (GetComponent(Rigidbody2D).velocity.sqrMagnitude < MIN_VELOCITY_SQUARED) {
		var ballRadius = gameObject.GetComponent(CircleCollider2D).radius * transform.localScale.x;
		var controllerRadius = controller.GetComponent(CircleCollider2D).radius * controller.transform.localScale.x;
		var margin = ballRadius + controllerRadius;
		
		var left = SCR_Controller.CONTROL_ZONE_X - margin;
		var right = SCR_Controller.CONTROL_ZONE_X + SCR_Controller.CONTROL_ZONE_W + margin;
		var bottom = SCR_Controller.CONTROL_ZONE_Y - margin;
		var top = SCR_Controller.CONTROL_ZONE_Y + SCR_Controller.CONTROL_ZONE_H + margin;
		
		if (transform.position.x < left   || transform.position.x > right
		||  transform.position.y < bottom || transform.position.y > top) {
			stuck = true;
		}
		else {
			stuck = false;
		}
	}
	else {
		stuck = false;
	}
}

function OnCollisionEnter2D(collision: Collision2D) {
	var contacts : ContactPoint2D[] = new ContactPoint2D[1];
	collision.GetContacts(contacts);
	var position = Vector3(contacts[0].point.x, contacts[0].point.y, -5);
	
	if (collision.gameObject.tag == "Controller") {
		if (SCR_Global.gameMode == GameMode.PUZZLE) {
			if (touchCooldown <= 0) {
				GameObject.Find("Score").GetComponent(SCR_Score).DecreaseScore(1);
				touchCooldown = 0.1;
			}
		}
		// Sparkle effect
		var sparkleController = Instantiate(PREFAB_SPARKLE_CONTROLLER, position, PREFAB_SPARKLE_CONTROLLER.transform.rotation);
	}
	else if (collision.gameObject.tag == "Brick") {
		// Sparkle effect
		var sparkleBrick = Instantiate(PREFAB_SPARKLE_BRICK, position, PREFAB_SPARKLE_BRICK.transform.rotation);
		var col = collision.transform.GetChild(0).GetComponent(SpriteRenderer).material.color;
		sparkleBrick.transform.GetChild(0).gameObject.GetComponent(ParticleSystemRenderer).material.SetColor("_TintColor", col);
		if (collision.transform.eulerAngles.z < 45) {
			// Horizontal brick
			if (collision.transform.position.y > transform.position.y) {
				// Top brick
				sparkleBrick.transform.eulerAngles.z = 180;
			}
			else {
				// Bottom brick
				sparkleBrick.transform.eulerAngles.z = 0;
			}
		}
		else {
			// Verticle brick
			if (collision.transform.position.x < transform.position.x) {
				// Left brick
				sparkleBrick.transform.eulerAngles.z = 270;
			}
			else {
				// Right brick
				sparkleBrick.transform.eulerAngles.z = 90;
			}
		}
		
		if (collision.gameObject.GetComponent(SCR_Brick).IsDestructible()) {
			var mat:Material = collision.gameObject.transform.GetChild(0).GetComponent(Renderer).material;
			for (var i=0; i<background.length; i++) {
				for (var j=0; j<(background[i] as Array).length; j++) {
					((background[i] as Array)[j] as GameObject).GetComponent(SCR_Background).SetColor(mat, ((background[i] as Array).length - j + i) * 0.02);
				}
			}
			collision.gameObject.GetComponent(SCR_Brick).Hit(1, color);
		}
		
		color = Random.Range(1, MAT_BRICK.length);
		gameObject.GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
	}
	
	if (GetComponent(Rigidbody2D).velocity.sqrMagnitude > MAX_VELOCITY * MAX_VELOCITY) {
		GetComponent(Rigidbody2D).velocity = MAX_VELOCITY * GetComponent(Rigidbody2D).velocity.normalized;
	}
}
