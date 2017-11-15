var PREFAB_BRICK : GameObject;
var PREFAB_BACKGROUND : GameObject;
var PREFAB_CONTROL_ZONE : GameObject;
var MAT_BRICK : Material[];
var MAT_WHITE : Material;
var PREFAB_BALL : GameObject;

var TEX_BACKGROUND : Sprite[];

var CORNER_LENGTH : int = 5;

static var LOSE_TEXT : UI.Text = null;
static var TAP_TEXT : UI.Text = null;

static var BRICK_SIZE : int = 40;
static var BRICK_W : int = 0;
static var BRICK_H : int = 0;

static var BACKGROUND_SIZE : float = 100.0;
static var BACKGROUND_X : float = 0.0;
static var BACKGROUND_Y : float = 0.0;
static var BACKGROUND_W : int = 0;
static var BACKGROUND_H : int = 0;

static var BRICK_MIN_LENGTH = 3;
static var BRICK_MAX_LENGTH = 8;

var background : Array = new Array();
var bricks = new Array();
var balls = new Array();
var controller : GameObject;
var firstTime = true;

static var currentLevel = 1;
static var tapToReset = false;
static var tapNextLevel = false;

private var lastMouseX = 0;
private var lastMouseY = 0;
private var targetX = 0;
private var targetY = 0;

static var verticalScreen = true;
static var screenRatio : float = 1;

function Start() {
	Application.targetFrameRate = 60;
	Screen.orientation = ScreenOrientation.Portrait;
	
	// Setup pixel perfect 2D camera thingy
	if (Screen.height > Screen.width) {
		verticalScreen = true;
		screenRatio = Screen.height * 1.0 / Screen.width;
		Camera.main.orthographicSize = 500 * screenRatio;
	}
	else {
		verticalScreen = false;
		screenRatio = Screen.width * 1.0 / Screen.height;
		Camera.main.orthographicSize = 500;
	}
	
	if (verticalScreen) {
		Camera.main.transform.position.x = 500;
		Camera.main.transform.position.y = 500 * screenRatio;
		BRICK_W = 1000 / BRICK_SIZE;
		BRICK_H = BRICK_W * screenRatio;
		SCR_Ball.RIGHT_EDGE = 1000;
		SCR_Ball.TOP_EDGE = 1000 * screenRatio;
	}
	else {
		Camera.main.transform.position.x = 500 * screenRatio;
		Camera.main.transform.position.y = 500;
		BRICK_H = 1000 / BRICK_SIZE;
		BRICK_W = BRICK_H * screenRatio;
		SCR_Ball.RIGHT_EDGE = 1000 * screenRatio;
		SCR_Ball.TOP_EDGE = 1000;
	}
	
	var score = GameObject.Find("Score");
	score.transform.position.x = Camera.main.transform.position.x;
	score.transform.position.y = Camera.main.transform.position.y;
	
	var controlZoneMargin = SCR_Controller.CONTROL_ZONE_MARGIN;
	SCR_Controller.CONTROL_ZONE_X = controlZoneMargin * BRICK_SIZE;
	SCR_Controller.CONTROL_ZONE_Y = controlZoneMargin * BRICK_SIZE;
	SCR_Controller.CONTROL_ZONE_W = (BRICK_W - 2 * controlZoneMargin) * BRICK_SIZE;
	SCR_Controller.CONTROL_ZONE_H = (BRICK_H - 2 * controlZoneMargin) * BRICK_SIZE;
	
	if (verticalScreen) {
		BACKGROUND_SIZE = 1.0 * SCR_Controller.CONTROL_ZONE_W / 6;
		BACKGROUND_W = Mathf.Ceil(1000 / BACKGROUND_SIZE);
		BACKGROUND_H = Mathf.Ceil(BACKGROUND_W * screenRatio);
		SCR_Controller.CONTROL_ZONE_H = Mathf.Floor(SCR_Controller.CONTROL_ZONE_H / BACKGROUND_SIZE) * BACKGROUND_SIZE;
		SCR_Controller.CONTROL_ZONE_Y = (BRICK_H * BRICK_SIZE - SCR_Controller.CONTROL_ZONE_H) / 2;
	}
	else {
		BACKGROUND_SIZE = 1.0 * SCR_Controller.CONTROL_ZONE_H / 6;
		BACKGROUND_H = Mathf.Ceil(1000 / BACKGROUND_SIZE);
		BACKGROUND_W = Mathf.Ceil(BACKGROUND_H * screenRatio);
		SCR_Controller.CONTROL_ZONE_W = Mathf.Floor(SCR_Controller.CONTROL_ZONE_W / BACKGROUND_SIZE) * BACKGROUND_SIZE;
		SCR_Controller.CONTROL_ZONE_X = (BRICK_W * BRICK_SIZE - SCR_Controller.CONTROL_ZONE_W) / 2;
		
	}
	
	BACKGROUND_X = SCR_Controller.CONTROL_ZONE_X - (Mathf.Ceil(SCR_Controller.CONTROL_ZONE_X / BACKGROUND_SIZE)) * BACKGROUND_SIZE;
	BACKGROUND_Y = SCR_Controller.CONTROL_ZONE_Y - (Mathf.Ceil(SCR_Controller.CONTROL_ZONE_Y / BACKGROUND_SIZE)) * BACKGROUND_SIZE;

	
	var BACKGROUND_SCALE = 0.5;
	for (var i:int=0; i<BACKGROUND_W; i++) {
		var temp : Array = new Array();
		for (var j:int=0; j<BACKGROUND_H; j++) {
			temp[j] = Instantiate(PREFAB_BACKGROUND);
			(temp[j] as GameObject).transform.localScale.x = BACKGROUND_SIZE * BACKGROUND_SCALE;
			(temp[j] as GameObject).transform.localScale.y = BACKGROUND_SIZE * BACKGROUND_SCALE;
			(temp[j] as GameObject).transform.position.x = (i + 0.5) * BACKGROUND_SIZE + BACKGROUND_X;
			(temp[j] as GameObject).transform.position.y = (j + 0.5) * BACKGROUND_SIZE + BACKGROUND_Y;
			
			
			var texture = Random.Range(0, TEX_BACKGROUND.length - 1);
			(temp[j] as GameObject).GetComponent(SpriteRenderer).sprite = TEX_BACKGROUND[texture];
		}
		background[i] = temp;
	}
	
	
	
	LOSE_TEXT = GameObject.Find("LoseText").GetComponent(UI.Text);
	TAP_TEXT = GameObject.Find("TapText").GetComponent(UI.Text);
	LOSE_TEXT.enabled = false;
	TAP_TEXT.enabled = false;
	
	
	currentLevel = 1;
	Reset(currentLevel);
	
	tapToReset = false;
	tapNextLevel = false;
}

function Reset(level : int) {
	for (var i:int=0; i<BACKGROUND_W; i++) {
		for (var j:int=0; j<BACKGROUND_H; j++) {
			((background[i] as Array)[j] as GameObject).GetComponent(SCR_Background).SetColor(MAT_BRICK[0], ((background[i] as Array).length - j + i) * 0.02);
		}
	}
	
	for (i=0; i<bricks.length; i++) {
		(bricks[i] as GameObject).SetActive(false);
	}
	CreateMap(level);
	
	for (i=0; i<balls.length; i++) {
		(balls[i] as GameObject).SetActive(false);
	}
	if (verticalScreen) {
		if (level == 1) {
			CreateBall(500, 650 * screenRatio);
		}
		else if (level == 2) {
			CreateBall(500, 650 * screenRatio);
			CreateBall(500, 350 * screenRatio);
		}
		else if (level == 3) {
			CreateBall(350, 650 * screenRatio);
			CreateBall(650, 650 * screenRatio);
			CreateBall(500, 350 * screenRatio);
		}
		else if (level == 4) {
			CreateBall(350, 650 * screenRatio);
			CreateBall(650, 650 * screenRatio);
			CreateBall(350, 350 * screenRatio);
			CreateBall(650, 350 * screenRatio);
		}
		
		targetX = 500;
		targetY = 500 * screenRatio;
	}
	else {
		if (level == 1) {
			CreateBall(650 * screenRatio, 500);
		}
		else if (level == 2) {
			CreateBall(650 * screenRatio, 500);
			CreateBall(350 * screenRatio, 500);
		}
		else if (level == 3) {
			CreateBall(650 * screenRatio, 350);
			CreateBall(650 * screenRatio, 650);
			CreateBall(350 * screenRatio, 500);
		}
		else if (level == 4) {
			CreateBall(650 * screenRatio, 350);
			CreateBall(650 * screenRatio, 650);
			CreateBall(350 * screenRatio, 350);
			CreateBall(350 * screenRatio, 650);
		}
		
		targetX = 500 * screenRatio;
		targetY = 500;
	}
	
	
	controller.GetComponent(SCR_Controller).SetTargetPosition (targetX, targetY);
	controller.transform.position.x = targetX;
	controller.transform.position.y = targetY;
	controller.transform.position.z = -1;
	controller.transform.localScale.x = BRICK_SIZE * 1.2;
	controller.transform.localScale.y = BRICK_SIZE * 1.2;
	
	lastMouseX = -1;
	lastMouseY = -1;
	
	
	if (firstTime) {
		CreateControlZone();
		firstTime = false;
	}
}

function CreateBall(x, y) {
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
	
	ball.transform.position.x = x;
	ball.transform.position.y = y;
	ball.transform.position.z = -1;
	ball.transform.localScale.x = BRICK_SIZE * 0.6;
	ball.transform.localScale.y = BRICK_SIZE * 0.6;
	
	ball.GetComponent(SCR_Ball).Reset();
	ball.GetComponent(SCR_Ball).SetBackground(background);
	ball.SetActive(true);
}

function CreateBrick (x:float, y:float, w:float, h:float, hp:int, color:int) {
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
	
	var BRICK_SCALE = 0.5;
	
	var padding = BRICK_SIZE * 0.1;
	var scale = w >= h ? w : h;
	scale -= 2;
	var rotate = h > w;
		
	brick.transform.transform.localScale.x = BRICK_SIZE * BRICK_SCALE;
	brick.transform.transform.localScale.y = BRICK_SIZE * BRICK_SCALE;
	
	if (rotate) {
		brick.transform.eulerAngles.z = 90;
		brick.transform.position.x = (x + 0.5) * BRICK_SIZE;
		brick.transform.position.y = (y + (scale + 2) * 0.5) * BRICK_SIZE;
	}
	else {
		brick.transform.eulerAngles.z = 0;
		brick.transform.position.x = (x + (scale + 2) * 0.5) * BRICK_SIZE;
		brick.transform.position.y = (y + 0.5) * BRICK_SIZE;
	}
	
	brick.transform.GetChild(1).transform.localScale.x = scale;
	brick.transform.GetChild(0).transform.localPosition.x = -(scale + 1.1);
	brick.transform.GetChild(2).transform.localPosition.x = (scale + 1.1);
	
	brick.transform.GetChild(4).transform.localScale.x = scale;
	brick.transform.GetChild(3).transform.localPosition.x = -(scale + 1);
	brick.transform.GetChild(5).transform.localPosition.x = (scale + 1);
	
	brick.transform.GetComponent(BoxCollider2D).size.x = (scale + 2) * 2;

	var destructible = false;
	if (hp > 0) {
		destructible = true;
	}
	
	brick.GetComponent(SCR_Brick).SetDestructible (destructible);
	brick.GetComponent(SCR_Brick).SetHP (hp);
	
	if (destructible) {
		brick.transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
		brick.transform.GetChild(1).GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
		brick.transform.GetChild(2).GetComponent(Renderer).sharedMaterial = MAT_BRICK[color];
		brick.transform.GetChild(3).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
		brick.transform.GetChild(4).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
		brick.transform.GetChild(5).GetComponent(Renderer).sharedMaterial = MAT_WHITE;
		brick.GetComponent(SCR_Brick).SetColor(color);
	}
	else {
		brick.transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.transform.GetChild(1).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.transform.GetChild(2).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.transform.GetChild(3).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.transform.GetChild(4).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.transform.GetChild(5).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
		brick.GetComponent(SCR_Brick).SetColor(0);
	}
	
	
	
	brick.SetActive(true);
	return brick;
}

function CreateMap(level : int){
	if (level > 4) {
		level = 4;
	}
	
	// Bottom left
	CreateBrick(0, 0, CORNER_LENGTH, 1, 0, 0);
	CreateBrick(0, 0, 1, CORNER_LENGTH, 0, 0);
	
	// Bottom right
	CreateBrick(BRICK_W - CORNER_LENGTH, 0, CORNER_LENGTH, 1, 0, 0);
	CreateBrick(BRICK_W - 1, 0, 1, CORNER_LENGTH, 0, 0);
	
	// Top left
	CreateBrick(0, BRICK_H - 1, CORNER_LENGTH, 1, 0, 0);
	CreateBrick(0, BRICK_H - CORNER_LENGTH, 1, CORNER_LENGTH, 0, 0);
	
	// Bottom right
	CreateBrick(BRICK_W - CORNER_LENGTH, BRICK_H - 1, CORNER_LENGTH, 1, 0, 0);
	CreateBrick(BRICK_W - 1, BRICK_H - CORNER_LENGTH, 1, CORNER_LENGTH, 0, 0);
	
	// Fill 6 rows
	CreateMapFillRow (level, 0);
	CreateMapFillRow (level, 1);
	CreateMapFillRow (level, 2);
	CreateMapFillRow (level, BRICK_H-1);
	CreateMapFillRow (level, BRICK_H-2);
	CreateMapFillRow (level, BRICK_H-3);
	
	
	// Fill 6 columns
	CreateMapFillColumn (level, 0);
	CreateMapFillColumn (level, 1);
	CreateMapFillColumn (level, 2);
	CreateMapFillColumn (level, BRICK_W - 1);
	CreateMapFillColumn (level, BRICK_W - 2);
	CreateMapFillColumn (level, BRICK_W - 3);
	
	
	if (SCR_Global.gameMode == GameMode.PUZZLE) {
		var numberOfTouch:float = 0.0;
		for (var i=0; i<bricks.length; i++) {
			if ((bricks[i] as GameObject).activeSelf == true) {
				if ((bricks[i] as GameObject).GetComponent(SCR_Brick).IsDestructible()) {
					numberOfTouch += 0.25 + currentLevel * 0.12;
				}
			}
		}
		GameObject.Find("Score").GetComponent(SCR_Score).IncreaseScore(Mathf.Ceil(numberOfTouch));
	}
}

function CreateMapFillRow(level:int, row:int) {
	var finished = false;
	var index = 0;
	
	if (row == 0 || row == BRICK_H-1) {
		index = CORNER_LENGTH;
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
		
		var brickHP = level;
		if (row == 0 || row == BRICK_H-1) {
			if (SCR_Global.gameMode == GameMode.PUZZLE) {
				brickHP = 0;
			}
		}
		
		if (SCR_Global.gameMode == GameMode.CLASSIC || Random.Range(0, 9) > 1 || row == 0 || row == BRICK_H-1) {
			createdBrick.push (CreateBrick(index, row, length, 1, brickHP, color));
		}
		index += length;

		if (maxW - index < BRICK_MAX_LENGTH) {
			color = Random.Range(1, MAT_BRICK.length);
			createdBrick.push (CreateBrick(index, row, maxW - index, 1, brickHP, color));
			finished = true;
		}
	}
	
	if (row == 0 || row == BRICK_H-1) {
		if (SCR_Global.gameMode == GameMode.CLASSIC) {
			(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetDestructible (false);
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(1).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(2).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(3).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(4).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(5).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetColor(0);
		}
	}
}

function CreateMapFillColumn(level:int, col:int) {
	var finished = false;
	var index = 0;
	
	if (col == 0 || col == BRICK_W - 1) {
		index = CORNER_LENGTH;
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
		
		var brickHP = level;
		if (col == 0 || col == BRICK_W - 1) {
			if (SCR_Global.gameMode == GameMode.PUZZLE) {
				brickHP = 0;
			}
		}
		
		if (SCR_Global.gameMode == GameMode.CLASSIC || Random.Range(0, 9) > 1 || col == 0 || col == BRICK_W - 1) {
			createdBrick.push(CreateBrick(col, index, 1, length, brickHP, color));
		}
		index += length;
		
		if (maxH - index < BRICK_MAX_LENGTH) {
			color = Random.Range(1, MAT_BRICK.length);
			createdBrick.push(CreateBrick(col, index, 1, maxH - index, brickHP, color));
			finished = true;
		}
	}
	
	if (col == 0 || col == BRICK_W - 1) {
		if (SCR_Global.gameMode == GameMode.CLASSIC) {
			(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetDestructible(false);
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(0).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(1).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(2).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(3).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(4).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).transform.GetChild(5).GetComponent(Renderer).sharedMaterial = MAT_BRICK[0];
			(createdBrick[createdBrick.length >> 1] as GameObject).GetComponent(SCR_Brick).SetColor(0);
		}
	}
}

function CreateControlZone() {
	var zone = Instantiate(PREFAB_CONTROL_ZONE);
	
	zone.transform.localScale.x = SCR_Controller.CONTROL_ZONE_W;
	zone.transform.localScale.y = SCR_Controller.CONTROL_ZONE_H;
	zone.transform.position.x = SCR_Controller.CONTROL_ZONE_X + SCR_Controller.CONTROL_ZONE_W * 0.5;
	zone.transform.position.y = SCR_Controller.CONTROL_ZONE_Y + SCR_Controller.CONTROL_ZONE_H * 0.5;
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
	
	var result = ConvertScreenCoordToGameCoord(Input.mousePosition.x, Input.mousePosition.y);
	
	if (Input.GetMouseButton(0)) {
		if (lastMouseX != -1 && lastMouseY != -1) {
			targetX += result[0] - lastMouseX;
			targetY += result[1] - lastMouseY;
		}
		lastMouseX = result[0];
		lastMouseY = result[1];
		
		var zoneX = SCR_Controller.CONTROL_ZONE_MARGIN * BRICK_SIZE;
		var zoneY = SCR_Controller.CONTROL_ZONE_MARGIN * BRICK_SIZE;
		var zoneW = (BRICK_W - 2 * SCR_Controller.CONTROL_ZONE_MARGIN) * BRICK_SIZE;
		var zoneH = (BRICK_H - 2 * SCR_Controller.CONTROL_ZONE_MARGIN) * BRICK_SIZE;
		
		if (targetX < zoneX) {targetX = zoneX;}
		if (targetX > zoneX + zoneW) {targetX = zoneX + zoneW;}
		if (targetY < zoneY) {targetY = zoneY;}
		if (targetY > zoneY + zoneH) {targetY = zoneY + zoneH;}
		
		controller.GetComponent(SCR_Controller).SetTargetPosition(targetX, targetY);
	}
	else {
		lastMouseX = -1;
		lastMouseY = -1;
	}
	
	
	
	if (tapToReset == false) {
		// Check stuck
		var stuck = true;
		for (var i=0; i<balls.length; i++) {
			if ((balls[i] as GameObject).activeSelf == true && (balls[i] as GameObject).GetComponent(SCR_Ball).IsStuck() == false) {
				stuck = false;
				break;
			}
		}
		if (stuck) {
			Lose(1);
		}
		
		// Check bricks
		var win = true;
		for (i=0; i<bricks.length; i++) {
			if ((bricks[i] as GameObject).activeSelf == true && (bricks[i] as GameObject).GetComponent(SCR_Brick).IsDestructible() == true) {
				win = false;
				break;
			}
		}
		
		if (win) {
			Win();
		}
	}
	
	if (tapToReset == true && Input.GetMouseButtonDown(0)) {
		if (tapNextLevel) {
			GameObject.Find("Score").GetComponent(SCR_Score).ResetScore();
			
			currentLevel ++;
			Reset(currentLevel);
			
			LOSE_TEXT.enabled = false;
			TAP_TEXT.enabled = false;
			tapToReset = false;
		}
		else {
			SceneManagement.SceneManager.LoadScene("MainMenu");
		}
	}
}

function ConvertScreenCoordToGameCoord (x:float, y:float) {
	var realX = 0;
	var realY = 0;
	
	if (verticalScreen) {
		realX = x * 1000 / Screen.width;
		realY = y * (1000 * screenRatio) / Screen.height;
	}
	else {
		realX = x * (1000 * screenRatio) / Screen.width;
		realY = y * 1000 / Screen.height;
	}
	
	return [realX, realY];
}


static function Win () {
	LOSE_TEXT.enabled = true;
	LOSE_TEXT.text = "Oh, nice! Next level!";
	TAP_TEXT.enabled = true;
	TAP_TEXT.text = "Tap to start!";
	
	tapToReset = true;
	tapNextLevel = true;
}

static function Lose (reason) {
	if (tapToReset == false) {
		LOSE_TEXT.enabled = true;
		if (reason == 0) {
			LOSE_TEXT.text = "You lose your ball!";
		}
		else if (reason == 1) {
			LOSE_TEXT.text = "Your ball stuck!";
		}
		else if (reason == 2) {
			LOSE_TEXT.text = "No more touch!";
		}
		TAP_TEXT.enabled = true;
		TAP_TEXT.text = "Tap to reset!";
		tapToReset = true;
		tapNextLevel = false;
	}
}