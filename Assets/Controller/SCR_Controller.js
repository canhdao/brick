static var CONTROL_ZONE_MARGIN = 6;
static var CONTROL_ZONE_X = 0;
static var CONTROL_ZONE_Y = 0;
static var CONTROL_ZONE_W = 0;
static var CONTROL_ZONE_H = 0;

private var SPEED_MULTIPLIER = 40;
private var MIN_SPEED = 50;

private var targetX:float = 0;
private var targetY:float = 0;


function Start() {
	
}

function SetTargetPosition (x, y) {
	var zoneX = CONTROL_ZONE_MARGIN * SCR_Gameplay.BRICK_SIZE;
	var zoneY = CONTROL_ZONE_MARGIN * SCR_Gameplay.BRICK_SIZE;
	var zoneW = (SCR_Gameplay.BRICK_W - 2 * CONTROL_ZONE_MARGIN) * SCR_Gameplay.BRICK_SIZE;
	var zoneH = (SCR_Gameplay.BRICK_H - 2 * CONTROL_ZONE_MARGIN) * SCR_Gameplay.BRICK_SIZE;
	
	targetX = x;
	targetY = y;
	
	if (targetX < zoneX) {targetX = zoneX;}
	if (targetX > zoneX + zoneW) {targetX = zoneX + zoneW;}
	if (targetY < zoneY) {targetY = zoneY;}
	if (targetY > zoneY + zoneH) {targetY = zoneY + zoneH;}
}


function Update() {
	var currentX = transform.position.x;
	var currentY = transform.position.y;
	
	var speed = SCR_Helper.DistanceBetweenTwoPoint(currentX, currentY, targetX, targetY) * SPEED_MULTIPLIER;
	if (speed < MIN_SPEED) {speed = 0;}
	
	var angle = SCR_Helper.AngleBetweenTwoPoint(currentX, currentY, targetX, targetY);
	var speedX = SCR_Helper.Sin(angle) * speed;
	var speedY = SCR_Helper.Cos(angle) * speed;
	
	
	gameObject.GetComponent(Rigidbody2D).velocity = Vector2(speedX, speedY);
	
}