var PREFAB_BRICK : GameObject;
var PREFAB_CONTROL_ZONE : GameObject;
var MAT_BRICK : Material[];
var PREFAB_BALL : GameObject;

static var LOSE_TEXT : UI.Text = null;
static var TAP_TEXT : UI.Text = null;

static var BRICK_SIZE : int = 40;
static var BRICK_W : int = 0;
static var BRICK_H : int = 0;

static var BRICK_MIN_LENGTH = 3;
static var BRICK_MAX_LENGTH = 8;

var bricks = new Array();
var balls = new Array();
var controller : GameObject;
var firstTime = true;
static var tapToReset = false;

function Start() {
	// Setup pixel perfect 2D camera thingy
	Camera.main.orthographicSize = Screen.height * 500 / Screen.width;
	Camera.main.transform.position.x = 500;
	Camera.main.transform.position.y = 500 * Screen.height / Screen.width;
	
	BRICK_W = 1000 / BRICK_SIZE;
	BRICK_H = BRICK_W * Screen.height / Screen.width;
	
	SCR_Ball.RIGHT_EDGE = 1000;
	SCR_Ball.TOP_EDGE = 1000 * Screen.height / Screen.width;
	
	Reset();
}

function Reset() {
	for (var i=0; i<bricks.length; i++) {
		(bricks[i] as GameObject).SetActive(false);
	}
	CreateMap();
	
	for (i=0; i<balls.length; i++) {
		(balls[i] as GameObject).SetActive(false);
	}
	CreateBall();
	
	controller.GetComponent(SCR_Controller).SetTargetPosition (500, 500 * Screen.height / Screen.width);
	controller.transform.position.x = 500;
	controller.transform.position.y = 500 * Screen.height / Screen.width;
	controller.transform.position.z = -1;
	controller.transform.localScale.x = BRICK_SIZE * 5;
	controller.transform.localScale.y = BRICK_SIZE * 5;
	
	if (LOSE_TEXT == null) {
		LOSE_TEXT = GameObject.Find("LoseText").GetComponent(UI.Text);
		LOSE_TEXT.enabled = false;
		TAP_TEXT = GameObject.Find("TapText").GetComponent(UI.Text);
		TAP_TEXT.enabled = false;
	}
	
	if (firstTime) {
		CreateControlZone();
		firstTime = false;
	}
}

function CreateBall() {
	var ball : GameObject = null;
	for (var i=0; i<balls.length; i++) {
		if ((balls[i] as GameObject).activeSelf == false) {
			ball = balls[i];
			break;
		}
	}
	
	if (ball == null) {
		ball = Instantiate(PREFAB_BALL);
		balls.Push (ball);
	}
	
	ball.transform.position.x = 500;
	ball.transform.position.y = 750 * Screen.height / Screen.width;
	ball.transform.position.z = -1;
	ball.transform.localScale.x = BRICK_SIZE * 2.5;
	ball.transform.localScale.y = BRICK_SIZE * 2.5;
	
	ball.SetActive(true);
}

function CreateBrick (x:float, y:float, w:float, h:float, destructible:boolean, color:int) {
	var brick : GameObject = null;
	for (var i=0; i<bricks.length; i++) {
		if ((bricks[i] as GameObject).activeSelf == false) {
			brick = bricks[i];
			break;
		}
	}
	
	if (brick == null) {
		brick = Instantiate(PREFAB_BRICK);
		bricks.Push (brick);
	}
	
	var padding = BRICK_SIZE * 0.1;
	brick.transform.localScale.x = w * BRICK_SIZE;
	brick.transform.localScale.y = h * BRICK_SIZE;
	brick.transform.GetChild(0).transform.localScale.x = 1 - padding / (w * BRICK_SIZE);
	brick.transform.GetChild(0).transform.localScale.y = 1 - padding / (h * BRICK_SIZE);
	brick.transform.position.x = (x + w * 0.5) * BRICK_SIZE;
	brick.transform.position.y = (y + h * 0.5) * BRICK_SIZE;
	
	brick.GetComponent(SCR_Brick).SetDestructible (destructible);
	
	if (destructible) {
		brick.transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
	}
	else {
		brick.transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
	}
	
	brick.SetActive(true);
	return brick;
}

function CreateMap(){
	// Bottom left
	CreateBrick(0, 0, 3, 1, false, 0);
	CreateBrick(0, 0, 1, 3, false, 0);
	
	// Bottom right
	CreateBrick(BRICK_W - 3, 0, 3, 1, false, 0);
	CreateBrick(BRICK_W - 1, 0, 1, 3, false, 0);
	
	// Top left
	CreateBrick(0, BRICK_H - 1, 3, 1, false, 0);
	CreateBrick(0, BRICK_H - 3, 1, 3, false, 0);
	
	// Bottom right
	CreateBrick(BRICK_W - 3, BRICK_H - 1, 3, 1, false, 0);
	CreateBrick(BRICK_W - 1, BRICK_H - 3, 1, 3, false, 0);
	
	// Fill 6 rows
	CreateMapFillRow (0);
	CreateMapFillRow (1);
	CreateMapFillRow (2);
	CreateMapFillRow (BRICK_H-1);
	CreateMapFillRow (BRICK_H-2);
	CreateMapFillRow (BRICK_H-3);
	
	// Fill 6 columns
	CreateMapFillColumn (0);
	CreateMapFillColumn (1);
	CreateMapFillColumn (2);
	CreateMapFillColumn (BRICK_W - 1);
	CreateMapFillColumn (BRICK_W - 2);
	CreateMapFillColumn (BRICK_W - 3);
}

function CreateMapFillRow(row) {
	var finished = false;
	var index = 0;
	
	if (row == 0 || row == BRICK_H-1) {
		index = 3;
	}
	else if (row == 1 || row == BRICK_H-2) {
		index = 1;
	}
	else if (row == 2 || row == BRICK_H-3) {
		index = 2;
	}
	
	var createdBrick = new Array();
	var maxW = BRICK_W - index;
	
	while (!finished) {
		var color = Random.Range(1, MAT_BRICK.length);
		var currentMaxLength = BRICK_MAX_LENGTH;
		if (maxW - index < BRICK_MAX_LENGTH + BRICK_MIN_LENGTH) {
			currentMaxLength = BRICK_MAX_LENGTH - 2;
		}
		var length = Random.Range(BRICK_MIN_LENGTH, currentMaxLength);
		
		if (row == 0 || row == BRICK_H-1) {
			if (Random.Range(0, 1) == 1) {
				color = 0;
			}
		}
		
		createdBrick.push (CreateBrick(index, row, length, 1, true, color));
		index += length;

		if (maxW - index < BRICK_MAX_LENGTH) {
			color = Random.Range(1, MAT_BRICK.length);
			createdBrick.push (CreateBrick(index, row, maxW - index, 1, true, color));
			finished = true;
		}
	}
	
	if (row == 0 || row == BRICK_H-1) {
		(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetDestructible (false);
		(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
	}
}

function CreateMapFillColumn(col) {
	var finished = false;
	var index = 0;
	
	if (col == 0 || col == BRICK_W - 1) {
		index = 3;
	}
	else if (col == 1 || col == BRICK_W - 2) {
		index = 2;
	}
	else if (col == 2 || col == BRICK_W - 3) {
		index = 3;
	}
	
	var createdBrick = new Array();
	var maxH = BRICK_H - index;
	
	while (!finished) {
		var color = Random.Range(1, MAT_BRICK.length);
		var currentMaxLength = BRICK_MAX_LENGTH;
		if (maxH - index < BRICK_MAX_LENGTH + BRICK_MIN_LENGTH) {
			currentMaxLength = BRICK_MAX_LENGTH - 2;
		}
		var length = Random.Range(BRICK_MIN_LENGTH, currentMaxLength);
		
		if (col == 0 || col == BRICK_W - 1) {
			if (Random.Range(0, 1) == 1) {
				color = 0;
			}
		}
		
		createdBrick.push(CreateBrick(col, index, 1, length, true, color));
		index += length;
		
		if (maxH - index < BRICK_MAX_LENGTH) {
			color = Random.Range(1, MAT_BRICK.length);
			createdBrick.push(CreateBrick(col, index, 1, maxH - index, true, color));
			finished = true;
		}
	}
	
	if (col == 0 || col == BRICK_W - 1) {
		(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetDestructible(false);
		(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
	}
}

function CreateControlZone() {
	var margin = SCR_Controller.CONTROL_ZONE_MARGIN;
	
	var x = margin * BRICK_SIZE;
	var y = margin * BRICK_SIZE;
	var w = (BRICK_W - 2 * margin) * BRICK_SIZE;
	var h = (BRICK_H - 2 * margin) * BRICK_SIZE;
	
	var zone = Instantiate(PREFAB_CONTROL_ZONE);
	
	zone.transform.localScale.x = w;
	zone.transform.localScale.y = h;
	zone.transform.position.x = x + w * 0.5;
	zone.transform.position.y = y + h * 0.5;
}

static function GetControlZone() {
	var margin = SCR_Controller.CONTROL_ZONE_MARGIN;
	
	var x = margin * BRICK_SIZE;
	var y = margin * BRICK_SIZE;
	var w = (BRICK_W - 2 * margin) * BRICK_SIZE;
	var h = (BRICK_H - 2 * margin) * BRICK_SIZE;
	
	return [x, y, w, h];
}



function Update() {
	var dt = Time.deltaTime;
	
	if (Input.GetMouseButton(0)) {
		var result = ConvertScreenCoordToGameCoord(Input.mousePosition.x, Input.mousePosition.y);
		var targetX = result[0];
		var targetY = result[1];
		
		controller.GetComponent(SCR_Controller).SetTargetPosition(targetX, targetY);
	}
	
	if (tapToReset == true && Input.GetMouseButtonDown(0)) {
		Reset();
		LOSE_TEXT.enabled = false;
		TAP_TEXT.enabled = false;
		tapToReset = false;
	}
}

function ConvertScreenCoordToGameCoord (x:float, y:float) {
	var realX = x * 1000 / Screen.width;
	var realY = y * (1000 * Screen.height / Screen.width) / Screen.height;
	
	return [realX, realY];
}




static function Lose (reason) {
	LOSE_TEXT.enabled = true;
	if (reason == 0) {
		LOSE_TEXT.text = "You lose your ball!";
	}
	else if (reason == 1) {
		LOSE_TEXT.text = "Hey, your ball seems stuck!";
	}
	TAP_TEXT.enabled = true;
	tapToReset = true;
}