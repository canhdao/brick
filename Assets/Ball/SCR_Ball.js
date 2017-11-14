var MAT_WHITE : Material;

private static var controller : GameObject = null;

private var MAX_VELOCITY : float = 4000;
static var RIGHT_EDGE = 1000;
static var TOP_EDGE = 1000;

private var background : Array = null;
private var stuck = false;

function Start() {
	if (controller == null) {
		controller = GameObject.Find("Controller");
	}
}

function Reset() {
	stuck = false;
}

function SetBackground(bg:Array) {
	background = bg;
}

function IsStuck() {
	return stuck;
}

function Update() {
	var dt = Time.deltaTime;
	if (transform.position.x < 0 || transform.position.x > RIGHT_EDGE
	||  transform.position.y < 0 || transform.position.y > TOP_EDGE) {
		SCR_Gameplay.Lose(0);
	}
	
	var MIN_VELOCITY_SQUARED = 1000;
	
	if (GetComponent(Rigidbody2D).velocity.sqrMagnitude < MIN_VELOCITY_SQUARED) {
		var ballRadius = gameObject.GetComponent(CircleCollider2D).radius * transform.localScale.x;
		var controllerRadius = controller.GetComponent(CircleCollider2D).radius * controller.transform.localScale.x;
		var margin = ballRadius + controllerRadius;
		
		var zone = SCR_Gameplay.GetControlZone();
		
		var left = zone[0] - margin;
		var right = zone[0] + zone[2] + margin;
		var bottom = zone[1] - margin;
		var top = zone[1] + zone[3] + margin;
		
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
	if (collision.gameObject.tag == "Controller") {
		
	}
	else if (collision.gameObject.tag == "Brick") {
		if (collision.gameObject.GetComponent(SCR_Brick).IsDestructible()) {
			var mat:Material = collision.gameObject.transform.GetChild(0).GetComponent(Renderer).material;
			for (var i=0; i<background.length; i++) {
				for (var j=0; j<(background[i] as Array).length; j++) {
					((background[i] as Array)[j] as GameObject).GetComponent(SCR_Background).SetColor(mat, ((background[i] as Array).length - j + i) * 0.02);
				}
			}
		}
		collision.gameObject.GetComponent(SCR_Brick).Hit(1);
	}
	
	if (GetComponent(Rigidbody2D).velocity.sqrMagnitude > MAX_VELOCITY * MAX_VELOCITY) {
		GetComponent(Rigidbody2D).velocity = MAX_VELOCITY * GetComponent(Rigidbody2D).velocity.normalized;
	}
}
