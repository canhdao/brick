private static var controller : GameObject = null;

private var MAX_VELOCITY : float = 4000;
static var RIGHT_EDGE = 1000;
static var TOP_EDGE = 1000;

function Start() {
	if (controller == null) {
		controller = GameObject.Find("Controller");
	}
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
			SCR_Gameplay.Lose(1);
		}
	}
}

function OnCollisionEnter2D(collision: Collision2D) {
	if (collision.gameObject.tag == "Controller") {
		
	}
	else if (collision.gameObject.tag == "Brick") {
		collision.gameObject.GetComponent(SCR_Brick).Hit(1);
	}
	
	if (GetComponent(Rigidbody2D).velocity.sqrMagnitude > MAX_VELOCITY * MAX_VELOCITY) {
		GetComponent(Rigidbody2D).velocity = MAX_VELOCITY * GetComponent(Rigidbody2D).velocity.normalized;
	}
}